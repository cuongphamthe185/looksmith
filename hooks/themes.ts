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
  /** Seeds for makeColors: give both `light` and `dark` (only `dark` for a `fixed` theme). */
  palette: Parameters<typeof makeColors>[0]
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
   * `swim` for every theme and shown as Animated; `status` names it in the
   * "Showing" line, and `about` says what moves and what it costs. A `fixed`
   * theme gives only `dark`.
   */
  motion?: {
    swim: Record<'light' | 'dark', string> | { light?: undefined; dark: string }
    status: string
    about: string
  }
} & (
  | {
      fixed?: undefined
      /** The SVG scenes behind the conversation, relative to the plugin folder. */
      backdrop: { light: string; dark: string }
    }
  | {
      /**
       * One look only: the theme always shows its dark half, whatever the OS or the Mode
       * choice, and that dropdown is hidden while it is picked. No light palette or scene.
       */
      fixed: 'dark'
      backdrop: { light?: undefined; dark: string }
    }
)

// Ids a theme had before it was renamed: a person's saved choice may still hold one.
export const LEGACY_IDS: Readonly<Record<string, string>> = { uchiha: 'itachi' }

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
      status: 'swimming',
      about:
        'Animated plays the pond: koi swim, light drifts, ripples spread, lotus sway. It redraws the window every frame: on a mid-range laptop it took about 16% CPU and 40-45% GPU, against about 3% for Still.',
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
            // half a step greyer than the near-white of 0.4.0-dev.6, to sit with the
            // grey-lavender day scene; checkColors reports no new pair below its bar
            'surface-0': '#dfdae7',
            'surface-1': '#e5e1eb',
            'surface-2': '#eeebf2',
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
      status: 'eyes blinking',
      about:
        'Animated keeps the four eyes alive on a 10-second loop: they blink alone, twice or in a ripple, and every 10 seconds the visor flickers, the eyes snap shut together and open with yellow irises, a scan line runs down them and the visor flares with a turning star. Only 11 small parts move, but any motion redraws the window every frame: measured on a laptop with integrated graphics and clear glass, about 55% of one CPU core in the GPU process and 70% GPU, against near idle for Still.',
    },
  },
  {
    // One dark look, colours sampled from the fan art it is drawn from: black #030303,
    // greys, red #f30404 and white. Scenes: art/make-itachi-scene.mjs (outside this repo).
    // Called Uchiha (id `uchiha`) until 0.5.0-dev.4: see LEGACY_IDS.
    id: 'itachi',
    label: 'Itachi',
    alt: "Itachi's red Sharingan eyes under a forehead protector with the leaf symbol, the left eye weeping blood, on black",
    fixed: 'dark',
    palette: {
      label: 'Itachi',
      // danger leans orange so it stays apart from the blood-red accent
      roles: { accent: '#f30404', danger: '#ff7a5c', success: '#5fb36b', warning: '#e0b040', pro: '#b8b8b8' },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#070707',
            'surface-1': '#0d0d0d',
            'surface-2': '#151515',
            'text-primary': '#ededed',
            'text-secondary': '#bdbdbd',
            'text-muted': '#8c8c8c',
          },
        },
      },
    },
    backdrop: { dark: 'themes/itachi/still.svg' },
    dock: { dark: '#050505' },
    motion: {
      swim: { dark: 'themes/itachi/sharingan.svg' },
      status: 'Sharingan awakening',
      about:
        'Animated plays an 18-second loop in both eyes: one tomoe, then a second and a third slide out along the ring, then the tomoe spin away into the Mangekyo with a red flash, which holds for four seconds before the eyes return to one tomoe; drops of blood run down the tears from the left eye. Only 13 small parts move, but any motion redraws the window every frame; cost not measured on a real machine yet (a much simpler scene than Koi Pond, so expect less than Animated on Koi Pond).',
    },
  },
  {
    // Pharaoh black and gold, colours sampled from the fan art it is drawn from: black, nemes
    // stripe #21180f, star brown #5b3617, bronze #a88752, old gold #caa768, Pharaoh gold #efc463,
    // cream #e7c686, white #f4f3f3; by day the same art on papyrus #efe2c0. Scenes (the emblem
    // traced from one image, its face from another): art/make-exodia-scene.mjs; the animated
    // ones add the sparkle burst and the smoke on top of the still ones:
    // art/make-exodia-anim.mjs --ship (both outside this repo).
    id: 'exodia',
    label: 'Exodia',
    alt: 'A faint gold Exodia emblem in the middle: a nemes headdress fanned into curved petals and two black-and-gold striped wings in front of a brown five-pointed star, with a detailed face: a cobra rising from the brow, slanted horn-like brows, glaring pale eyes, a grin of big square teeth and a pendant with two scrolls under the chin',
    palette: {
      label: 'Exodia',
      light: {
        gray: {
          anchors: {
            'surface-0': '#efe2c0',
            'surface-1': '#f5ebd2',
            'surface-2': '#fbf6e9',
            'text-primary': '#21180f',
            'text-secondary': '#5b3617',
            'text-muted': '#6e4a10',
          },
        },
        roles: {
          accent: { seed: '#7a5313', stops: { 400: '#8a6220', 450: '#7a5313', 600: '#6b480f' } },
          danger: '#b8321f',
          success: '#1f7a63',
          // the stock warning fill is a pale stop (200) that vanishes on papyrus: use the seed's 450
          warning: { seed: '#b8661a', fillShade: 450 },
          pro: '#5b7fd1',
        },
        // the stock git colours are too light on papyrus and the cream input bar: earthier, darker
        git: { added: '#2a6b2f', removed: '#962615', modified: '#7a5200', merged: '#5a3fa0', closed: '#962615', conflicting: '#8a4300', draft: '#5e4a2e' },
      },
      dark: {
        gray: {
          anchors: {
            'surface-0': '#0a0705',
            'surface-1': '#110c07',
            'surface-2': '#18110a',
            'surface-3': '#21180f',
            'text-primary': '#f4f3f3',
            'text-secondary': '#e7c686',
            'text-muted': '#a88752',
          },
        },
        roles: {
          // a seed alone gives a dull #977300 fill: the gold the art uses is set by hand on the
          // stops the dark half reads (300 text, 400 hover, 450 fill)
          accent: { seed: '#efc463', stops: { 300: '#fad473', 400: '#f5cd6b', 450: '#efc463' } },
          danger: '#e5533d',
          success: '#3aa88f',
          warning: '#e08a2c',
          pro: '#5b7fd1',
        },
      },
    },
    backdrop: { light: 'themes/exodia/day.svg', dark: 'themes/exodia/night.svg' },
    dock: { light: '#e7c686', dark: '#21180f' },
    motion: {
      swim: { light: 'themes/exodia/breath-day.svg', dark: 'themes/exodia/breath-night.svg' },
      status: 'exhaling smoke',
      about:
        'Animated plays a 16-second loop over the still scene: the eight gold sparkles twinkle one after another in a single burst, and two streams of smoke roll out of the mouth and drift up beside the face; after about 7.5 seconds nothing moves for the remaining 8.5 seconds. The face itself does not move. Measured in a separate Chrome window at 2760 x 1792, not yet in the desktop app: about 3-4% CPU drawn inline (still: ~2%, Animated on Koi Pond: ~14%), 7-8% as an image; GPU 2-3% inline and ~13% as an image, against ~16% for Animated on Koi Pond in the same run (another app was using the GPU heavily at the time, so treat the GPU figures as rough).',
    },
  },
]
