# Looksmith

[Tiếng Việt](README.md) · **English**

Themes for the Claude desktop app. Pick a theme from a dropdown; light and dark follow your operating system (Windows, macOS, GNOME), or can be pinned to one.

Ships with **Koi Pond**: a flat-vector koi pond with lily pads and lotus flowers. Light mode shows a sunlit day pond, dark mode a moonlit night pond with fireflies, and the whole app takes a matching teal palette. With motion on, three koi swim, the light drifts, ripples spread by the lotus, the lotus sway and the fireflies pulse.

## Install

In a Claude Code session, run:

```
/plugin install looksmith --marketplace cuongphamthe185/looksmith
```

Answer `y` to add the marketplace, then pick a scope. Start a new session (or restart Claude) and the theme bar appears above the input.

Requires a Claude desktop build that draws mod themes (tested on Claude desktop 5.11 for Windows). The terminal and editor extensions draw no themes.

## Use

- A bar above the input holds a **Theme** dropdown (or *Off* for the app default), a **Light / dark** dropdown (*Follow OS*, *Always light*, *Always dark*) and a **Motion** dropdown (*Still*, *Swim*).
- `/themes` opens the same choices in a pane, plus whether to show the bar.
- `/themes koi-pond`, `/themes off`, `/themes auto|light|dark`, `/themes motion off|swim`, `/themes bar on|off` do the same by typing.

The choice is remembered across sessions. With *Follow OS*, the theme switches within about ten seconds of the OS switching.

## Motion

The scene's own CSS/SMIL animation plays in the browser at the display's frame rate, so the koi swim smoothly and the theme keeps its colours.

The desktop pauses the backdrop when the OS asks apps to reduce motion. On Windows, that is **"Animate controls and elements inside windows"** in Performance Options (`SystemPropertiesPerformance.exe`), which "Adjust for best performance" turns off. On macOS, it is **Reduce motion**. While motion is chosen but paused, the bar says so and offers a button that opens that setting; the plugin never changes it itself.

Cost, measured on a mid-range laptop (i7-1065G7, integrated graphics, a 2760 × 1792 window): any motion redraws the whole window every frame, so the cost follows the scene's detail, not how much moves.

| Motion | What moves | CPU | GPU |
| --- | --- | --- | --- |
| Still | nothing | ~3% | ~3% |
| Swim | three koi, drifting light, ripples, swaying lotus, fireflies at night | ~16% | ~40–45% |

## Limits (measured on Claude desktop 5.11)

- The scene shows only behind the conversation column; the sidebars take the theme's colours instead.
- Glass (frosted panels) is not used: with the OS's transparency effects off, the desktop paints glass solid over the scene.
- The mouse does not reach the scene.
- After a switch the desktop takes a few seconds to paint the scene.
- The terminal and editor extensions draw no themes.

## Add a theme

1. Put two still SVG scenes in `themes/<id>/`, one for light and one for dark. Each needs a `viewBox` and `preserveAspectRatio="xMidYMid slice"`, at most 131,072 characters, and no scripts or external files. Keep the busiest art away from the middle, where the text sits.
2. Add an entry to `hooks/themes.ts` with an `id`, a `label`, palette seeds for `light` and `dark`, the two scene paths, and optionally a `dock` colour per mode for the bar holding the input (pick the scene's water near its bottom edge).
3. Optionally add `motion.swim`: an animated SVG for light and one for dark. Animate with CSS or SMIL inside the SVG, and avoid blur filters, which are redrawn every frame.

The palette goes through `makeColors`, which checks contrast. The plugin leaves out the dark palette's page colour itself, so the scene shows through, and drops a `dock` colour the desktop would refuse for contrast (with a toast) rather than lose the whole palette.

## License

MIT, see [LICENSE](LICENSE).
