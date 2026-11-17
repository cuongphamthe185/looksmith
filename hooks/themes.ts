import type { makeColors } from './make-colors.js'

// One entry per theme. To add a theme: put its two scenes under themes/<id>/
// (SVG with a viewBox and preserveAspectRatio="xMidYMid slice", at most 131072
// characters, no script or external files) and add an entry here.
export type ThemeDef = {
  /** Stable id, stored as the person's choice: letters, digits and '-'. */
  id: string
  /** What the picker shows. */
  label: string
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
   * itself (art/make-koi-scene.mjs with a `.anim.svg` out path). Absent, the
   * theme stays still.
   */
  motion?: { swim: Record<'light' | 'dark', string> }
}

export const THEMES: readonly ThemeDef[] = [
  {
    id: 'koi-pond',
    label: 'Koi Pond',
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
    },
  },
]
