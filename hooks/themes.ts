import type { makeColors } from './make-colors.js'

// One entry per theme. To add a theme: put its two scenes under themes/<id>/
// (SVG with a viewBox and preserveAspectRatio="xMidYMid slice", at most 131072
// characters, no script or external files) and add an entry here.
export type ThemeDef = {
  /** Stable id, stored as the person's choice: letters, digits and '-'. */
  id: string
  /** What the picker shows. */
  label: string
  /** What the scene shows, for screen readers. */
  alt: string
  /** Seeds for makeColors: give both `light` and `dark`. */
  palette: Parameters<typeof makeColors>[0]
  /** The SVG scenes behind the conversation, relative to the plugin folder. */
  backdrop: { light: string; dark: string }
  /**
   * The colour of the bar holding the input, per mode: pick the scene's water near
   * its bottom edge so the bar sits in the scene. A colour the desktop would refuse
   * for contrast is dropped (with a toast) and the palette's own is kept.
   */
  dock?: { light?: `#${string}`; dark?: `#${string}` }
  /**
   * Animated scenes, per mode: SVGs whose CSS/SMIL animation the browser plays
   * itself (art/make-koi-scene.mjs or art/make-eva-scene.mjs with a `.anim.svg`
   * out path). Absent, the theme stays still. The person's choice is stored as
   * `swim` for every theme; `label` names it in the Motion dropdown, `status` in
   * the "Showing" line, and `about` says what moves and what it costs.
   */
  motion?: { swim: Record<'light' | 'dark', string>; label: string; status: string; about: string }
}

export const THEMES: readonly ThemeDef[] = [
  {
    id: 'koi-pond',
    label: 'Koi Pond',
    alt: 'A koi pond with lily pads and lotus flowers',
    palette: {
      label: 'Koi Pond',
      roles: { accent: '#1d7a80', danger: '#c0392b', success: '#4f9a3c', warning: '#c9921e', pro: '#c4507e' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#cfe8e3',
            'surface-1': '#ddefeb',
            'surface-2': '#eaf6f3',
            'text-primary': '#0f2e2b',
            'text-secondary': '#2a4d49',
            'text-muted': '#45655f',
          },
        },
      },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#0c2a33',
            'surface-1': '#11323d',
            'surface-2': '#153a46',
            'surface-3': '#18404d',
            'text-primary': '#e4f3f3',
            'text-secondary': '#bcd8db',
            'text-muted': '#93b6bb',
          },
        },
      },
    },
    backdrop: { light: 'themes/koi-pond/day.svg', dark: 'themes/koi-pond/night.svg' },
    dock: { light: '#8cc6b9', dark: '#1a454c' },
    motion: {
      swim: { light: 'themes/koi-pond/swim-day.svg', dark: 'themes/koi-pond/swim-night.svg' },
      label: 'Swim',
      status: 'swimming',
      about:
        'Swim plays the pond: koi swim, light drifts, ripples spread, lotus sway. It redraws the window every frame: on a mid-range laptop it took about 16% CPU and 40-45% GPU, against about 3% for Still.',
    },
  },
  {
    id: 'eva-01',
    label: 'EVA-01',
    alt: 'A purple mecha head with a horn and glowing eyes over a city skyline',
    palette: {
      label: 'EVA-01',
      roles: { accent: '#7b4fc0', danger: '#d0342c', success: '#5f9e2e', warning: '#d99a1c', pro: '#615aaa' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#e7e0f4',
            'surface-1': '#efe9f8',
            'surface-2': '#f6f2fb',
            'text-primary': '#1d1028',
            'text-secondary': '#3c2a4f',
            'text-muted': '#5a4870',
          },
        },
      },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#140b19',
            'surface-1': '#1b0f21',
            'surface-2': '#22132a',
            'surface-3': '#291833',
            'text-primary': '#f1eaf8',
            'text-secondary': '#d0c3e0',
            'text-muted': '#a898bc',
          },
        },
      },
    },
    backdrop: { light: 'themes/eva-01/day.svg', dark: 'themes/eva-01/night.svg' },
    dock: { light: '#b9addf', dark: '#1b0d22' },
    motion: {
      swim: { light: 'themes/eva-01/blink-day.svg', dark: 'themes/eva-01/blink-night.svg' },
      label: 'Blink',
      status: 'eyes blinking',
      about:
        'Blink lights the eyes: every 5 seconds they flicker off, then flare back with a halo and a streak of light. Between blinks nothing animates, so it should cost less than the koi; not measured yet.',
    },
  },
  {
    // Five colours only: white, yellow #ecc41e, purple #6b4f93, navy #0c1442,
    // dark purple #42305a, and tints of them.
    id: 'eva-sticker',
    label: 'EVA Sticker',
    alt: 'A flat purple mecha head with a horn, yellow swirl clouds, the word 天使 and four eyes',
    palette: {
      label: 'EVA Sticker',
      roles: { accent: '#6b4f93', danger: '#c0392b', success: '#3f8a4a', warning: '#a3850c', pro: '#42305a' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#e4dfec',
            'surface-1': '#eae6f0',
            'surface-2': '#f8f6fa',
            'text-primary': '#0c1442',
            'text-secondary': '#2c2550',
            'text-muted': '#4f4670',
          },
        },
      },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#0c1442',
            'surface-1': '#121a4a',
            'surface-2': '#1b224d',
            'surface-3': '#242c55',
            'text-primary': '#f8f6fa',
            'text-secondary': '#d6cee1',
            'text-muted': '#a99cc2',
          },
        },
      },
    },
    backdrop: { light: 'themes/eva-sticker/day.svg', dark: 'themes/eva-sticker/night.svg' },
    dock: { light: '#d6cee1', dark: '#27224e' },
    motion: {
      swim: { light: 'themes/eva-sticker/blink-day.svg', dark: 'themes/eva-sticker/blink-night.svg' },
      label: 'Blink',
      status: 'eyes blinking',
      about:
        'Blink closes the four eyes one after another every 6 seconds. Nothing else moves; cost not measured yet.',
    },
  },
]
