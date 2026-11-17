import type { EngineInterface, Register, ThemeColors, ThemeSetArgs } from 'claude-code'

import { checkColors, makeColors } from './make-colors.js'
import type { ThemeDef } from './themes'
import { THEMES } from './themes'

// A Looksmith: dropdowns pick the theme, light/dark (default: follow the OS)
// and motion. They live in a bar above the input (hideable) and in a pane opened
// by /themes.
//
// Each theme is a palette for the whole app plus an SVG scene drawn behind the
// conversation. Measured on Claude desktop 5.11:
// - scenes show only with glass off, and `image` grounds never draw;
// - a scene's CSS/SMIL animation plays only while the OS does not ask for reduced
//   motion: the desktop strips animation from the backdrop when it does (Windows:
//   "Animate controls and elements inside windows"; macOS: Reduce motion);
// - an animated scene redraws the whole window every frame, so it costs GPU
//   whatever moves in it.

type Mode = 'auto' | 'light' | 'dark'
type Half = 'light' | 'dark'
type Motion = 'off' | 'swim'
type Glass = 'off' | 'clear'
const MODES: readonly Mode[] = ['auto', 'light', 'dark']
const MOTIONS: readonly Motion[] = ['off', 'swim']
const GLASSES: readonly Glass[] = ['off', 'clear']
// Clear glass: the panels (the conversation column, the input bar) let the scene show
// through, with no blur. It needs the OS's transparency effects: with them off, the
// desktop paints glass solid over the scene. Over a moving scene it adds GPU load.
const CLEAR_GLASS = { blur: 0, opacity: 0.3 }
const OFF = 'off'
const PANE = 'theme-picker'
const COMMAND = 'themes'
const OS_POLL_MS = 9_000
const SYNC_MS = 3_000
const SCENE_PREFIX = 'tg-'

// Measured on Claude desktop 5.11, with one half of a palette sent at a time (a
// palette giving both halves hid the scene unreliably, so the mod always sends
// the OS's half, or the forced one):
// - dark: gray-900 is painted solid over the scene, so it is left out and the
//   app's own transparent page shows the scene;
// - the bar holding the input is painted with gray-850 (dark) / gray-10 (light);
//   a theme's `dock` colour goes there so the bar sits in the scene's water.
const PAGE_TOKENS: Record<Half, readonly string[]> = { light: [], dark: ['gray-900'] }
const DOCK_TOKEN: Record<Half, string> = { light: 'gray-10', dark: 'gray-850' }

type Inputs = Record<string, `#${string}`>
const notes: string[] = []

function buildHalf(def: ThemeDef, half: Half): ThemeColors {
  const base = makeColors({ ...def.palette, only: half }).theme
  const inputs: Inputs = Object.fromEntries(
    Object.entries(base.inputs[half] ?? {}).filter(([k]) => !PAGE_TOKENS[half].includes(k)),
  ) as Inputs
  const wrap = (i: Inputs): ThemeColors => ({ ...base, inputs: half === 'dark' ? { dark: i } : { light: i } })
  const dock = def.dock?.[half]
  if (dock === undefined) return wrap(inputs)
  const docked = wrap({ ...inputs, [DOCK_TOKEN[half]]: dock })
  // The desktop refuses a whole palette whose text contrast is too low; checkColors
  // says so beforehand, so a dock colour it would refuse is dropped, not the theme.
  const blocking = checkColors(docked).filter(line => line.startsWith("Desktop won't paint"))
  if (blocking.length === 0) return docked
  notes.push(`${def.label}: ${half} dock colour ${dock} ignored (${blocking[0]})`)

  return wrap(inputs)
}

const BUILT = THEMES.map(def => ({ def, light: buildHalf(def, 'light'), dark: buildHalf(def, 'dark') }))
const DEFAULT_THEME = THEMES[0]?.id ?? OFF

// ---------- scenes ----------

// Scene name -> SVG text, read from the plugin folder at start.
const scenes = new Map<string, string>()
const sceneName = (id: string, motion: Motion, half: Half) =>
  `${SCENE_PREFIX}${id}-${motion === 'off' ? 'still' : motion}-${half}`

async function loadScenes($: EngineInterface): Promise<void> {
  for (const { def } of BUILT) {
    for (const half of ['light', 'dark'] as const) {
      const files: [Motion, string | undefined][] = [
        ['off', def.backdrop[half]],
        ['swim', def.motion?.swim[half]],
      ]
      for (const [motion, rel] of files) {
        if (rel === undefined) continue
        try {
          scenes.set(sceneName(def.id, motion, half), await $.fs.read(`${$.plugin.root}/${rel}`))
        } catch (error) {
          notes.push(`cannot read ${rel}: ${String(error)}`)
        }
      }
    }
  }
}

// ---------- the OS: dark mode and reduced motion ----------

let osDark: boolean | undefined
let osReducesMotion: boolean | undefined
let osReducesTransparency: boolean | undefined

async function run($: EngineInterface, argv: string[]): Promise<{ ok: boolean; out: string }> {
  try {
    const r = await $.process.run(argv, { timeoutMs: 5000 })

    return { ok: r.exitCode === 0, out: r.stdout }
  } catch {
    return { ok: false, out: '' }
  }
}

type OsState = { dark?: boolean; reduce?: boolean; opaque?: boolean }

async function readOs($: EngineInterface): Promise<OsState> {
  // Windows
  const theme = await run($, ['reg', 'query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize'])
  if (theme.ok) {
    const dark = /AppsUseLightTheme\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(theme.out)
    const transparency = /EnableTransparency\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(theme.out)
    // UserPreferencesMask byte 4, bit 0x02: "Animate controls and elements inside
    // windows", the bit Chromium reads for prefers-reduced-motion.
    const mask = await run($, ['reg', 'query', 'HKCU\\Control Panel\\Desktop', '/v', 'UserPreferencesMask'])
    const hex = /UserPreferencesMask\s+REG_BINARY\s+([0-9a-f]+)/i.exec(mask.out)?.[1]
    const byte4 = hex !== undefined && hex.length >= 10 ? Number.parseInt(hex.slice(8, 10), 16) : undefined

    return {
      dark: dark?.[1] !== undefined ? Number.parseInt(dark[1], 16) === 0 : undefined,
      reduce: byte4 !== undefined ? (byte4 & 0x02) === 0 : undefined,
      opaque: transparency?.[1] !== undefined ? Number.parseInt(transparency[1], 16) === 0 : undefined,
    }
  }
  // macOS
  const style = await run($, ['defaults', 'read', '-g', 'AppleInterfaceStyle'])
  const motion = await run($, ['defaults', 'read', 'com.apple.universalaccess', 'reduceMotion'])
  const transparency = await run($, ['defaults', 'read', 'com.apple.universalaccess', 'reduceTransparency'])
  if (style.ok || motion.ok || style.out !== '' || motion.out !== '') {
    return {
      dark: style.ok && /dark/i.test(style.out),
      reduce: motion.ok ? motion.out.trim() === '1' : undefined,
      opaque: transparency.ok ? transparency.out.trim() === '1' : undefined,
    }
  }
  // Linux (GNOME and friends)
  const scheme = await run($, ['gsettings', 'get', 'org.gnome.desktop.interface', 'color-scheme'])
  const anim = await run($, ['gsettings', 'get', 'org.gnome.desktop.interface', 'enable-animations'])

  return {
    dark: scheme.ok ? /dark/i.test(scheme.out) : undefined,
    reduce: anim.ok ? /false/i.test(anim.out) : undefined,
  }
}

/** Opens the OS page where the person turns window animations back on. */
async function openMotionSettings($: EngineInterface): Promise<void> {
  const windows = await run($, ['cmd', '/c', 'start', '', 'SystemPropertiesPerformance.exe'])
  if (!windows.ok) {
    await run($, ['open', 'x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Display'])
  }
}

/** Opens the OS page where the person turns transparency effects back on. */
async function openTransparencySettings($: EngineInterface): Promise<void> {
  const windows = await run($, ['cmd', '/c', 'start', '', 'ms-settings:colors'])
  if (!windows.ok) {
    await run($, ['open', 'x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Display'])
  }
}

// ---------- state ----------

let applied = ''
let lastResult = ''

type Choice = { themeId: string; mode: Mode; bar: boolean; motion: Motion; glass: Glass }

async function choice($: EngineInterface): Promise<Choice> {
  const themeId = await $.store.get('theme')
  const mode = await $.store.get('mode')
  const bar = await $.store.get('bar')
  const motion = await $.store.get('motion')
  const glass = await $.store.get('glass')

  return {
    themeId: typeof themeId === 'string' && (themeId === OFF || THEMES.some(t => t.id === themeId)) ? themeId : DEFAULT_THEME,
    mode: MODES.includes(mode as Mode) ? (mode as Mode) : 'auto',
    bar: bar !== false,
    // A value from an older version ("lite") falls back to swim, any other to still.
    motion: motion === 'lite' ? 'swim' : MOTIONS.includes(motion as Motion) ? (motion as Motion) : 'off',
    glass: GLASSES.includes(glass as Glass) ? (glass as Glass) : 'off',
  }
}

// Applies run one at a time: a pick and the sync tick may both ask at once.
let queue: Promise<void> = Promise.resolve()

/** Sets the chosen theme, or clears it when the choice is Off. */
function apply($: EngineInterface, opts: { force?: boolean } = {}): Promise<void> {
  queue = queue.then(() => applyNow($, opts)).catch(() => undefined)

  return queue
}

async function applyNow($: EngineInterface, opts: { force?: boolean }): Promise<void> {
  const { themeId, mode, motion, glass } = await choice($)
  if (themeId === OFF) {
    // Clear only a theme this session set itself (applied holds its key), so a
    // session that starts with Off never wipes another mod's theme.
    if (applied !== '' && applied !== OFF) {
      await $.theme.clear()
    }
    applied = OFF
    lastResult = 'off'

    return
  }
  const built = BUILT.find(b => b.def.id === themeId) ?? BUILT[0]
  if (built === undefined) return
  const dark = mode === 'dark' || (mode === 'auto' && osDark === true)
  const half: Half = dark ? 'dark' : 'light'
  const moving = motion !== 'off' && scenes.has(sceneName(built.def.id, motion, half)) ? motion : 'off'
  const key = `${built.def.id}|${mode}|${dark}|${moving}|${glass}`
  if (key === applied && opts.force !== true) return
  const look: ThemeSetArgs = {
    colors: built[half],
    backdrop: { scene: sceneName(built.def.id, moving, half), glass: glass === 'clear' ? CLEAR_GLASS : false },
  }
  const set = await $.theme.set(look)
  applied = key
  lastResult = set.isDrawn
    ? `${built.def.label} · ${half}${moving === 'off' ? '' : ' · swimming'}${glass === 'clear' ? ' · clear glass' : ''}`
    : `not drawn: ${set.reason}`
  await $.store.set('lastApply', { key, result: lastResult, osDark: osDark ?? null, osReducesMotion: osReducesMotion ?? null, at: Date.now() })
}

type Field = 'theme' | 'mode' | 'bar' | 'motion' | 'glass'

async function pick($: EngineInterface, field: Field, value: string | boolean): Promise<void> {
  await $.store.set(field, value)
  if (field !== 'bar') {
    await apply($)
  }
  $.ui.invalidate('ui.render')
}

const ARGS = [...THEMES.map(t => t.id), OFF, ...MODES, 'motion off|swim', 'glass off|clear', 'bar on|off']

async function runCommand($: EngineInterface, args: string): Promise<{ text: string }> {
  const arg = args.trim().toLowerCase().replace(/\s+/g, ' ')
  if (arg === '') {
    await $.ui.open({ id: PANE, title: 'Themes', focus: true, closeOnEscape: true })

    return { text: 'Theme picker opened.' }
  }
  if (arg === OFF || THEMES.some(t => t.id === arg)) {
    await pick($, 'theme', arg)

    return { text: `Theme: ${lastResult}` }
  }
  if (MODES.includes(arg as Mode)) {
    await pick($, 'mode', arg)

    return { text: `Light/dark: ${arg} (${lastResult})` }
  }
  const [word, value] = arg.split(' ')
  if (word === 'motion' && MOTIONS.includes(value as Motion)) {
    await pick($, 'motion', value as Motion)
    const paused = value !== 'off' && osReducesMotion === true ? ' Paused: the OS asks for reduced motion.' : ''

    return { text: `Motion: ${value} (${lastResult}).${paused}` }
  }
  if (word === 'glass' && GLASSES.includes(value as Glass)) {
    await pick($, 'glass', value as Glass)
    const solid = value !== 'off' && osReducesTransparency === true ? ' Solid: the OS has transparency effects off.' : ''

    return { text: `Glass: ${value} (${lastResult}).${solid}` }
  }
  if (word === 'bar' && (value === 'on' || value === 'off')) {
    await pick($, 'bar', value === 'on')

    return { text: `Theme bar above the input: ${value === 'on' ? 'shown' : 'hidden'}` }
  }

  return { text: `Unknown "${arg}". Use ${ARGS.join(', ')}, or no argument for the picker.` }
}

const THEME_OPTIONS = [...THEMES.map(t => ({ value: t.id, label: t.label })), { value: OFF, label: 'Off (app default)' }]
const modeOptions = () => [
  { value: 'auto', label: `Follow OS (${osDark === undefined ? 'unknown' : osDark ? 'dark' : 'light'})` },
  { value: 'light', label: 'Always light' },
  { value: 'dark', label: 'Always dark' },
]
const MOTION_OPTIONS = [
  { value: 'off', label: 'Still' },
  { value: 'swim', label: 'Swim' },
]
const GLASS_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'clear', label: 'Clear' },
]

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Pick a theme, light/dark (follows your OS) and motion',
      argumentHint: `[${ARGS.join('|')}]`,
      immediate: true,
    })
    await loadScenes($)
    const os = await readOs($)
    osDark = os.dark
    osReducesMotion = os.reduce
    osReducesTransparency = os.opaque
    await apply($, { force: true })
    for (const note of notes) {
      $.ui.toast(`Looksmith: ${note}`)
    }
    // The desktop may ask for the bar before this start has finished and keep that
    // empty answer; with the theme Off nothing changes later, so the bar (the only
    // way back on from this session) would never show. Ask for it again now.
    $.ui.invalidate('ui.render')
    // Every session follows the saved choice: a pick in one session (Off included)
    // reaches the others within SYNC_MS, so no session keeps a moving pond the
    // person turned off elsewhere. The OS is read less often (it spawns processes)
    // and only while a theme is on.
    let ticks = 0
    let busy = false
    $.clock.every(SYNC_MS, () => {
      if (busy) return
      busy = true
      void (async () => {
        try {
          ticks++
          const before = applied
          const { themeId } = await choice($)
          if (themeId !== OFF && ticks % Math.round(OS_POLL_MS / SYNC_MS) === 0) {
            const now = await readOs($)
            const changed = now.reduce !== osReducesMotion || now.opaque !== osReducesTransparency
            osReducesMotion = now.reduce
            osReducesTransparency = now.opaque
            osDark = now.dark
            if (changed) $.ui.invalidate('ui.render')
          }
          await apply($)
          // The first ticks also redraw, for a desktop that attached after the start.
          if (applied !== before || ticks <= 2) $.ui.invalidate('ui.render')
        } finally {
          busy = false
        }
      })()
    })

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    try {
      return await runCommand($, e.args)
    } catch (error) {
      return { text: `Themes: ${String(error)}` }
    }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const source = scenes.get(e.props.scene)
    if (!e.props.scene.startsWith(SCENE_PREFIX) || source === undefined || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={source} alt="A koi pond with lily pads and lotus flowers" />
  })

  // The bar above the input: the dropdowns, always at hand on desktop.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'desktop' || e.props.hasSurvey) {
      return next(e)
    }
    const { themeId, mode, bar, motion, glass } = await choice($)
    if (!bar) {
      return next(e)
    }
    const { Box, Select, Button, Text } = $.ui.resolve(e)
    const hasMotion = THEMES.find(t => t.id === themeId)?.motion !== undefined
    const paused = themeId !== OFF && motion !== 'off' && osReducesMotion === true
    const solid = themeId !== OFF && glass !== 'off' && osReducesTransparency === true

    return (
      <Box flexDirection="row">
        <Select key="bar-theme" label="Theme" options={THEME_OPTIONS} value={themeId} onSelect={value => void pick($, 'theme', value)} />
        {themeId !== OFF && (
          <Box marginLeft={2}>
            <Select key="bar-mode" label="Light / dark" options={modeOptions()} value={mode} onSelect={value => void pick($, 'mode', value)} />
          </Box>
        )}
        {themeId !== OFF && hasMotion && (
          <Box marginLeft={2}>
            <Select key="bar-motion" label="Motion" options={MOTION_OPTIONS} value={motion} onSelect={value => void pick($, 'motion', value)} />
          </Box>
        )}
        {themeId !== OFF && (
          <Box marginLeft={2}>
            <Select key="bar-glass" label="Glass" options={GLASS_OPTIONS} value={glass} onSelect={value => void pick($, 'glass', value)} />
          </Box>
        )}
        {paused && (
          <Box marginLeft={2}>
            <Text dimColor>Paused: OS reduces motion </Text>
            <Button key="bar-fix" label="Turn on…" onPress={() => void openMotionSettings($)} />
          </Box>
        )}
        {solid && (
          <Box marginLeft={2}>
            <Text dimColor>Glass needs transparency </Text>
            <Button key="bar-glass-fix" label="Turn on…" onPress={() => void openTransparencySettings($)} />
          </Box>
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Select, Button } = $.ui.resolve(e)
    const { themeId, mode, bar, motion, glass } = await choice($)
    const paused = themeId !== OFF && motion !== 'off' && osReducesMotion === true
    const solid = themeId !== OFF && glass !== 'off' && osReducesTransparency === true

    return (
      <Box flexDirection="column">
        <Select key="theme" label="Theme" options={THEME_OPTIONS} value={themeId} autoFocus onSelect={value => void pick($, 'theme', value)} />
        <Box marginTop={1}>
          <Select key="mode" label="Light / dark" options={modeOptions()} value={mode} onSelect={value => void pick($, 'mode', value)} />
        </Box>
        <Box marginTop={1}>
          <Select key="motion" label="Motion" options={MOTION_OPTIONS} value={motion} onSelect={value => void pick($, 'motion', value)} />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>
            Swim plays the pond: koi swim, light drifts, ripples spread, lotus sway. It redraws the window every frame:
            on a mid-range laptop it took about 16% CPU and 40-45% GPU, against about 3% for Still.
          </Text>
        </Box>
        {paused && (
          <Box marginTop={1} flexDirection="column">
            <Text>
              The pond is still because the OS asks apps to reduce motion. On Windows, tick "Animate controls and
              elements inside windows" in Performance Options; on macOS, turn off Reduce motion.
            </Text>
            <Button key="fix" label="Open the setting" onPress={() => void openMotionSettings($)} />
          </Box>
        )}
        <Box marginTop={1}>
          <Select key="glass" label="Glass" options={GLASS_OPTIONS} value={glass} onSelect={value => void pick($, 'glass', value)} />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>
            Clear glass lets the pond show through the conversation and the input bar. With Swim it adds GPU load
            (about 56% GPU against 40-45% without glass on a mid-range laptop).
          </Text>
        </Box>
        {solid && (
          <Box marginTop={1} flexDirection="column">
            <Text>
              Glass is solid because the OS has transparency effects off. On Windows, turn on Transparency effects
              in Personalization, Colors; on macOS, turn off Reduce transparency.
            </Text>
            <Button key="glass-fix" label="Open the setting" onPress={() => void openTransparencySettings($)} />
          </Box>
        )}
        <Box marginTop={1}>
          <Select
            key="bar"
            label="Bar above the input"
            options={[
              { value: 'on', label: 'Show' },
              { value: 'off', label: 'Hide' },
            ]}
            value={bar ? 'on' : 'off'}
            onSelect={value => void pick($, 'bar', value === 'on')}
          />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>{themeId === OFF ? 'Using the app default look.' : `Showing: ${lastResult}`}</Text>
        </Box>
      </Box>
    )
  })
}
