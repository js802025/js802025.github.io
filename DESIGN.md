---
name: Jack Adee
description: A portfolio read like a departures board, every project a scheduled line with a live number.
colors:
  board: "#0e0e10"
  panel: "#161618"
  led-black: "#000000"
  rule: "#2b2b2f"
  signage-white: "#f4f2ec"
  dim: "#a29d93"
  amber: "#ffb31a"
  led-off: "#241d10"
  led-low: "#5c3f09"
  led-mid: "#9c6c10"
  led-high: "#dc9814"
  line-calc: "#3fbf4f"
  line-sideflick: "#ff5da2"
  line-gtbus: "#f2552c"
  line-skilldule: "#3a86ef"
  line-batcher: "#1fb8b2"
  line-doomlearner: "#5b50f5"
typography:
  display:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3.25rem, 1.4rem + 8vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 3vw, 4rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.375rem, 1rem + 1.5vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1rem + 0.9vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Overpass, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.9375rem)"
    fontWeight: 600
    lineHeight: 1.5
  led:
    fontFamily: "Doto, Overpass Mono, monospace"
    fontWeight: 900
    letterSpacing: "0.02em"
    fontFeature: "tnum"
rounded:
  tip: "4px"
  panel: "10px"
  pill: "999px"
  bullet: "50%"
spacing:
  margin: "clamp(16px, 3vw, 48px)"
  row-gap: "24px"
  section: "clamp(88px, 11vw, 168px)"
components:
  button-primary:
    backgroundColor: "{colors.signage-white}"
    textColor: "{colors.board}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.2em 1.3em 0"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.board}"
  line-bullet:
    textColor: "{colors.board}"
    rounded: "{rounded.bullet}"
    size: "2em"
  led-panel:
    backgroundColor: "{colors.led-black}"
    rounded: "{rounded.panel}"
    padding: "clamp(16px, 2.2vw, 32px)"
  side-card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "clamp(20px, 2.4vw, 36px)"
  tooltip:
    backgroundColor: "{colors.signage-white}"
    textColor: "{colors.board}"
    typography: "{typography.label}"
    rounded: "{rounded.tip}"
    padding: "6px 10px 4px"
---

# Design System: Jack Adee

## Overview

**Creative North Star: "The Departures Board"**

The home page is a transit departures board at night. Board black ground, signage-white grotesk names, and amber dot-matrix LEDs for every live figure. Each project is a scheduled line with its own transit colour, read in one glance as a row of the board, then ridden down as a strip map to its demo, terminating at Tech Tower. Nothing is decorative that a station would not carry: there are no glows, no gradients, and no ornamental greys.

Density is high at the board and generous everywhere else: rows are tight and tabular, sections breathe on a long section gap. Motion is signage motion. The board refreshes by cycling characters before they settle row by row, the contributions panel lights from unlit to full amber, and the closing photo arrives as LED dots that shrink and warm into true colour.

**Key Characteristics:**
- One dark ground, one white, one amber, two greys; colour beyond that belongs to a project's line.
- Live numbers are always LED: dot-matrix face, amber, tabular figures.
- One label grid for every project row: bullet, name and kind, live figure, destination.
- A project's line colour lives in its round bullet and its route stroke (the strip-map line and the 6px section top rule), nowhere else.
- Pill buttons in signage white that light amber on hover.

## Colors

A blacked-out station palette: near-black board, warm signage white, a single LED amber, and six saturated line colours that each belong to exactly one project.

### Primary
- **LED Amber** (`amber`): every live figure (row status, download count, clock, year, contribution total), the hover state of buttons and links, focus rings, and text selection. It is the only accent that is not a line.
- **LED Ramp** (`led-off`, `led-low`, `led-mid`, `led-high`, then `amber`): unlit-to-lit steps of the same LED, used only for the contribution dot grid's intensity levels.

### Secondary: Line Colours
One per project, never mixed, never used as fill beyond the bullet or as text:
- **Line Green** (`line-calc`): CalcMod.
- **Line Pink** (`line-sideflick`): SideFlick.
- **Line Vermilion** (`line-gtbus`): GTBus.
- **Line Blue** (`line-skilldule`): Skilldule AI.
- **Line Teal** (`line-batcher`): Batcher, also its OCR outline and scan bar inside the drawing.
- **Line Indigo** (`line-doomlearner`): DoomLearner, taken from its own brand indigo.
- CalcMod Updater runs on Line Green as a CalcMod branch line, and that green is the final stroke that runs into Tech Tower.
- **Tech Tower dots** (scoped exception): the closing photo arrives as a full-colour LED board drawn in Minecraft chat colours (picked by hue, owner preference, 2026-11-18), then warms into the photo. These colours live only on that canvas, never in the UI.

### Neutral
- **Board Black** (`board`): page ground, sticky top strip, the contact card, and the dark ink on white and coloured fills.
- **LED Black** (`led-black`): true black behind lit surfaces only: the contributions panel, the CalcMod screen, the contact photo well.
- **Panel** (`panel`): the one raised tone, for side cards and image wells.
- **Rule** (`rule`): 1px row dividers, the strip's bottom edge, image hairlines, scrollbar.
- **Signage White** (`signage-white`): names, headings, body, primary buttons, tooltip fill.
- **Dim** (`dim`): secondary copy, column labels, nav at rest, destinations.

### Named Rules
**The One Line Rule.** Each project owns one line colour, set as `--line` on its row, section, or stop. It appears in the bullet and the route stroke only; two line colours never share a component.

**The Lit Means Live Rule.** Amber is reserved for live data and interaction feedback. A static label is never amber.

**The Two Greys Rule.** Dim and Rule are the only greys. Panel is a surface, not a text colour.

## Typography

**Display Font:** Overpass (with Helvetica Neue, Arial)
**Label/Mono Font:** Doto (with Overpass Mono, monospace), weight 900

**Character:** Overpass is highway signage, heavy and tightly tracked for names; Doto is the dot-matrix LED, used only for numbers and short status words.

### Hierarchy
- **Display** (800, clamp 3.25rem to 6rem, 0.9): the name in the hero only.
- **Headline** (800, clamp 2rem to 4rem, 1): line section titles, stop titles, the contact heading, footer menu links.
- **Title** (800, clamp 1.375rem to 2.25rem, 1.05): project names on board rows.
- **Lead** (400, clamp 1.25rem to 1.75rem, 1.3): the hero line and section one-liners, held to about 28 to 30ch.
- **Body** (400, clamp 1rem to 1.125rem, 1.5): running copy and buttons (600).
- **Label** (600, clamp 0.8125rem to 0.9375rem): nav, column heads, tooltips, captions.
- **LED** (Doto 900, tabular): live figures at any size, from the 1.375rem clock to the clamp 4.5rem to 8.5rem download figure.

### Named Rules
**The Signage Weight Rule.** Headings are Overpass 800 with negative tracking (-0.01em to -0.035em); there are no light or italic display styles.

**The Dots Are Data Rule.** Doto sets numbers and status only (`3.49M DL`, `LIVE`, `RUNNING`, the clock, the year). Never set names or sentences in it.

## Layout

A full-bleed board with a fluid side margin (`spacing.margin`) and a long section gap (`spacing.section`) between lines. The sticky top strip is a three-column grid: wordmark, centred LED clock, nav. The board is a four-column label grid (`auto 1fr 12rem 10rem`, gap 24px) under a 2px signage-white header rule, rows divided by 1px Rule lines. Line sections open with a bullet-plus-headline header grid. The "more lines" section is a strip map: a 6px vertical line in each stop's colour runs from its 48px bullet down to the next stop, and the last runs into the contact section. SideFlick uses a 12-column grid with 24px gutters.

Below 900px: the nav hides, the board drops its destination column, side-by-side grids stack, images move above stop text, and the contact card pulls up over the photo.

## Elevation & Depth

Flat by default. Depth is tonal: Board, then Panel for raised wells, then LED Black for anything lit. Shadows exist in two places only, both over imagery or floating data: the contributions tooltip and the contact card that sits on the Tech Tower photo. Image wells use a 1px Rule ring rather than a shadow.

### Shadow Vocabulary
- **Tip lift** (`box-shadow: 0 8px 24px rgba(0, 0, 0, .45)`): the floating day tooltip over the dot grid.
- **Card over photo** (`box-shadow: 0 24px 60px rgba(0, 0, 0, .5)`): the contact card on the Tech Tower photo.
- **Hairline ring** (`box-shadow: 0 0 0 1px #2b2b2f`): image wells on the strip map.

### Named Rules
**The No Glow Rule.** LEDs are lit by colour alone. No text-shadow, no blur halos, no gradients.

## Shapes

Three corners and a circle. Panels, screens, and image wells take a 10px radius; tooltips 4px; buttons are full pills; line bullets and LED cells are true circles. Route strokes are 6px solid bars, square-ended. Dividers are 1px (2px under the board header).

## Components

### Buttons
- **Shape:** full pill (`rounded.pill`), minimum 48px tall.
- **Primary:** signage-white fill, board-black text, Overpass 600 at body size; the top padding is biased to seat Overpass optically.
- **Hover / Focus:** fill turns amber over 200ms; press scales to 0.97. Focus is the global 2px amber outline at 3px offset.
- **Text link:** signage white, 600, turns amber on hover.

### Line Bullet
A circle in the project's line colour holding its single board-black capital letter (Overpass 800). 2em at body or lead size on the board and section heads, 48px on the strip map. Scales to 1.15 when its row is hovered.

### Departure Row
The signature component. One label grid per project: bullet, name (Title) with kind in Dim beside it, live status in LED, destination in Dim. Hover or focus slides the row 12px right and brightens the destination to white. On first view, every name and status cycles through `A-Z0-9.` and settles character by character, rows staggered 90ms apart; reduced motion skips it.

### LED Panel
True black, 10px radius, holding a large LED year, the contribution total, and a dot grid of round cells. Cells sit at `led-off` and light to their level along the LED ramp with an 8ms per-cell stagger; hovering a day scales its dot to 1.5 and shows the white tooltip.

### Side Card
Panel fill, 10px radius, holding a giant LED figure with its unit at 0.45em, a caption, and actions pinned to the bottom.

### Navigation
The sticky top strip: board fill, 1px Rule bottom edge, wordmark in Overpass 800, nav links in Dim label size turning white on hover. The footer menu repeats it at Headline size, dimming siblings on hover and sliding the hovered link 10px right in amber.

### Scoped exception: SideFlick in Midnight Matinee
The SideFlick section is a brand commitment, not part of this palette. It is scoped by its own `--sf-*` tokens (velvet ground `#1b0c17`, card `#27121f`, surface `#321a2a`, cream text `#fff4e4`, muted `#dcc3cf`, popcorn `#ffc83d`, mint `#3fe3b0`, bubblegum `#ff5da2`, sky `#5cc6ff`, tomato `#ff6247`, radius 0.9rem) and sets its heading in Bagel Fat One. Only its 6px top rule in `line-sideflick` ties it to the board. These tokens never leak outside `.sideflick`.

### Content fidelity, not system
The CalcMod chat overlay uses Minecraft's own chat colours and translucent black bars because it reproduces the game UI. The Batcher slip uses paper white, ink, and remit red because it is a drawn document. Neither palette is available to other components.

## Do's and Don'ts

### Do:
- **Do** give every new project one line colour and use it only in its bullet and route stroke.
- **Do** set every live number in Doto 900 amber with tabular figures.
- **Do** keep every project row on the same label grid: bullet, name and kind, live figure, destination.
- **Do** put lit content (dot grids, screens, LED figures) on true black (`led-black`) and raised wells on Panel.
- **Do** honour `prefers-reduced-motion`: settle text instantly, light the grid without stagger, show the photo without the dot resolve.

### Don't:
- **Don't** add glows, text shadows, or gradients to LEDs or anything else.
- **Don't** introduce a third grey or tint the white.
- **Don't** mix two line colours in one component, or use a line colour for body text.
- **Don't** set names or sentences in the dot-matrix face.
- **Don't** let SideFlick's Midnight Matinee tokens or the Minecraft chat colours appear outside their own sections.
- **Don't** use Georgia Tech gold and navy as a palette.
