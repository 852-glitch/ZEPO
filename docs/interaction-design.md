# Interaction design: public site

Scope: the Hebrew RTL public pages. The admin area keeps its own simpler behavior. All motion is
CSS-only and respects `prefers-reduced-motion`. Nothing relies on hover for information: hover
effects are decoration, and the same content is always visible.

## Principles

- Motion explains change (a page arriving, a row being chosen, where you are). It never loops.
- Durations: micro 150 ms, state change 250–450 ms, entrance 380–900 ms. One easing family.
- Reduced motion: no transforms or fades; state changes become instant color or underline changes.
- No inline styles anywhere (CSP). Delays come from `nth-child` rules, not style attributes.

## Transitions

| Transition | Trigger | Motion | Duration / easing | Reduced motion |
|---|---|---|---|---|
| Page enter | Route change or first load | Content fades in and rises 14 px | 380 ms, `cubic-bezier(.2,.7,.1,1)` | None |
| Hero headline | First load | Each line slides up from a mask, staggered 90 ms | 900 ms, same easing | None |
| Hero curve | Scroll 0 to 70% viewport | Bottom corners round progressively | Scroll-linked | Fixed gentle curve |
| Scroll progress | Page scroll | Thin accent bar fills across the top | Scroll-linked | Hidden |
| Scroll reveal | Element enters viewport | Fade and rise 2 rem | Scroll-linked, first 40% of entry | Visible, static |
| Index row | Hover or keyboard focus | Ink fill sweeps from the start edge, text inverts, arrow nudges, preview image tilts in | 450 ms fill, 300 ms others | Instant color change only |
| Section bar | Section scrolls into view | Active label turns ink and bold, accent underline draws | 250 ms | Instant |
| Links | Hover or focus | Underline draws from the start edge | 250 ms | Instant |
| Buttons | Hover, press | Fill darkens on hover, press scales to 0.98 | 150 ms | Instant, no scale |

## State matrix: index row (product link)

| State | Background | Text | Arrow | Preview image | Cursor |
|---|---|---|---|---|---|
| Rest | Transparent | Ink, description muted | Static | Hidden | Pointer |
| Hover | Ink fill sweeps in | Paper, description light | Nudges toward the end | Tilts in, visible | Pointer |
| Keyboard focus | Same as hover, plus 3 px focus ring | Paper | Nudged | Visible | n/a |
| Pressed | Ink | Paper | Nudged | Visible | Pointer |
| Loading | Skeleton rows, no motion | n/a | n/a | n/a | Default |
| Error | Replaced by the route error screen with a retry button | n/a | n/a | n/a | Default |
| Empty | "Products will appear here soon" message | n/a | n/a | n/a | Default |
| Disabled (demo only) | Same visuals, not a link, `aria-disabled` | Same | Same | Same | Default |

Transition diagram:

```
[Rest] <-> [Hover] -> [Pressed] -> (navigation, page enter)
   |
[Focus] -> [Pressed]
```

## State matrix: button

| State | Background | Border | Text | Notes |
|---|---|---|---|---|
| Rest | Accent | Accent | White | Pill shape |
| Hover | Darker accent | Darker accent | White | 150 ms |
| Focus | Same | 3 px ring | White | Ring is ink, or white on dark |
| Pressed | Darker accent | Same | White | Scale 0.98 |
| Disabled | Accent at 60% | Same | White | `cursor: not-allowed` |

## Accessibility checklist

- [x] Focus ring on every interactive element, high contrast on paper and on ink.
- [x] Keyboard order matches reading order: masthead, hero, section bar, products, disclosure, contact, footer. On the product page the ticket (button and disclosure) comes before the review.
- [x] Section bar uses `aria-current="true"` for the section in view. The live region is the link itself, so nothing extra is announced while scrolling.
- [x] Decorative elements (progress bar, arrows, preview images beside the name, big footer wordmark) are `aria-hidden` or empty-alt.
- [x] Text contrast at least 4.5:1 (ink on paper about 16:1, muted on paper about 6:1, white on accent about 5.6:1). The bright accent on ink is used only for very large display text.
- [x] Touch targets at least 44 px tall on mobile for rows, buttons, and the section bar.
- [x] No motion without a reduced-motion fallback. Nothing auto-plays or loops.

## Responsive behavior

- Desktop (1024 px and up): products show a sticky heading beside the index, row preview images appear on hover or focus, section bar sits under the hero.
- Tablet (768–1023 px): single column, sticky heading becomes a normal heading, previews stay hidden.
- Mobile (under 768 px): rows stack the name over the description, arrows stay, previews hidden, masthead keeps the wordmark and the contact pill only.

## Content constraints

- Product name: up to 120 characters, wraps (never truncated). Description: wraps, up to 2000 characters stored, rows show all of it.
- Hebrew text can grow 30–50% in translation, so rows use flexible grid columns, not fixed widths.
- Numbers use tabular figures. Dates use `he-IL`, Asia/Jerusalem time zone.
