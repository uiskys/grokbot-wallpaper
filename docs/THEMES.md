# Themes

The dashboard's default is the office: white studio light, the building as shipped, graphite cards. That path runs when no theme is selected. A theme is an optional dress on top of it. Bots, floors, usage, chat links and the topic fragment are not part of a theme.

## Choosing one

The topic stays in the fragment (`#<topic>`, optionally `&ntfy=`). A theme never moves into the hash. `?theme=` stays in the query.

| Source | When it wins |
|---|---|
| `?theme=<id>` | This visit. `office` and `default` mean no theme. An unknown id is ignored and the saved choice is used instead. |
| `localStorage` key `bothq.theme` | When the query has no `theme`. The Theme menu in the top bar writes it and reloads. |
| Neither | The office, unchanged. |

`?time=` still drives the clock and beats a theme's fixed dusk. Wallpaper mode (`?mode=wallpaper`) reads the same query and the same saved choice; it has no menu.

```text
https://uiskys.github.io/grokbot-wallpaper/office/?theme=kyoto-dusk#<topic>
https://uiskys.github.io/grokbot-wallpaper/office/?mode=wallpaper&theme=kyoto-dusk#<topic>
```

The landing page's dashboard link and a `#gbw-…` visit open the office with `?theme=kyoto-dusk`. `/office/` with no query is still the plain office.

## Shape of a theme

`web/theme/themes.js` is the registry. The office is the absence of a theme, not an entry. To add one: a module, a `CATALOG` row, and a loader. The module is imported only when that theme is selected.

```js
{
  id: 'kyoto-dusk',             // ?theme=kyoto-dusk, also <html data-theme="kyoto-dusk">
  label: '京都暮色',            // menu text, duplicated in CATALOG so the menu does not load the module
  loading: '暮色渐起…',
  themeColor: '#C9A0D8',        // meta theme-color, optional
  css: new URL('./kyoto-dusk.css', import.meta.url).href,
  fontHref: 'https://fonts.googleapis.com/css2?family=…',
  sky: { centre, radii, stops, shadow, layers? },
  light: { night, lamps, windows, sunI, sunEl, sunAz, sunC, hemiI, hemiSky, hemiGnd, fillI, fillC, envI, exposure, shadow },
  lightPhase: 'dusk',
  restyle(templates) {},
  mount({ scene }) {
    return { update() {} };
  },
}
```

Every field is optional. Hooks that are absent are not called.

`sky` is applied in `bootTheme`, before the studio pass is built (`setStudioBackdrop`). `light` is handed to `daylight.setLook`, which fills any field the theme leaves out (`bake`, `tint`, glass, the sun on the baked floor, and a low sun angle) from the `lightPhase` preset. With no theme, the pass keeps the `STUDIO` backdrop and the light stays noon.

`mount` should put props on **layer 1** and enable layer 1 on existing lights (leave layer 0 on). The camera is shown layer 1 only when `mount` exists. The aura silhouette is rendered with the camera masked to layer 0, so garden props do not become one giant shadow. Do not add a ground plane large enough to cover the whole orthographic frame if the dusk backdrop should remain visible.

`restyle` sees the template roots (`floor_open`, `floor_closed`, `roof`, `elevator_shaft`, `elevator_cabin`) after the glTF materials are prepared. Tinting `material.color` on a baked lightmap multiplies it. `floor_open` is left alone: open floors belong to an interior. Wall screens replace their material later, so task text is left alone. Blobs are not in the templates.

Keep a theme's geometry, textures and CSS in its own files under `web/theme/`. No copyrighted images. No new hosts: three.js stays on jsDelivr, fonts on Google Fonts, and bot data stays on the feed you already configured. Procedural geometry is enough, and it should stay cheap enough to sit behind a wallpaper (shared materials, no per-frame texture work).

`landing/assemble.mjs` copies `web/theme/` to `office/theme/` for the assembled site (`.js` and `.css`, including subfolders).

## 京都暮色

`web/theme/kyoto-dusk.js` and `kyoto-dusk.css`. Blue-hour Kyoto: a warm paper pool (`#FFD4A8`) in the open sky (the tower would hide a low centre), lilac (`#C9A0D8`) through the middle, deep violet (`#5A4A88`) in the far corners. The tower shell is cool grey–lilac. Lamps and glass read as paper-lantern amber. Around the pad: a short gravel and moss ellipse, a few maples, two or three stone tōrō, rocks, and a couple of bamboo clumps. The sky stays visible behind them. Cards are frosted lilac glass; the CTA and the selected floor are paper-warm. Status hues stay distinct. Shippori Mincho is loaded only for the Theme control; the rest of the chrome stays Nunito.

## Floor interiors

The exterior (sky, light, ground, scenery, and the closed shell of the tower) is still the one theme above. Each floor can dress its own interior: floor and wall tint, furniture colour, a few procedural props, the glass band of that floor when it is closed, and an accent on that floor's button and team card.

A floor's name is the label from the `groups` message, used as written. There is no built-in list of team names. A bot with no label is on a floor called `Unassigned`.

### Keyword guess

`FLOOR_THEME_RULES` in `web/theme/floor-theme-rules.js` is the only table. Add a row there to extend it. The first matching row wins. Matching is case-insensitive. A keyword of three or more letters matches as a substring. A shorter keyword matches only as a whole token.

| Keywords | Interior id | Look |
|---|---|---|
| kyoto, japan, washi, zen, 和, 暮色 | `kyoto-dusk` | Washi: tatami-warm floor, paper walls, a miniature tōrō, ikebana, a slim shoji panel |

A name that matches nothing follows the exterior theme.

### What wins

For each floor, first hit wins:

1. **This browser**, `localStorage` key `bothq.floorThemes`, a map of floor name → interior id. The Theme menu writes it. `office` forces the plain interior. An empty value (Auto) removes the key.
2. **The feed**, a message `{"floor_themes":{"Kyoto":"office"}}`. Keys are floor names, matched case-insensitively. Keys merge across messages; `"auto"` or `""` clears one key. A saved choice for that floor wins over the feed.
3. **The keyword table** above. A guess of `office` stops here, as the plain interior.
4. **The exterior theme**, when its id is also an interior. Washi is registered as `kyoto-dusk`, so unresolved floors inherit paper-warm rooms when the building is Kyoto dusk. `Unassigned` reaches this step.
5. **The plain office.**

An unknown id is ignored and the next step runs.

The menu is the Theme button in the top bar: Building reloads the page (the sky and the shell change), each floor's select does not. Wallpaper mode has no menu; it still applies the saved choices, the feed, and the keyword table.

Adding an interior is a module under `web/theme/interiors/` plus a row in `interiors.js`. It exports `{ id, label, accent, ink, glass, tint, createProps }`. `tint` is `{ floor, wall, wood, metal, fabric, glass }` and recolors that floor's own materials. `createProps()` returns a cloneable group parked at the back-right of the room, clear of the desks and the left-wall screens. Props stay on layer 0. Do not add lights or per-frame work.
