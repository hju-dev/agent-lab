# Hero wireframes: ten layouts to start from

**Used by:** Studio's Designer (choosing each direction's hero) and Builder (building it), alongside the PRD's "Hero layouts" menu and `accent-palettes.md`. Added November 1, 2026 from wireframes Henry saved: W1–W5 are from an Instagram post by @iggykos, W6–W10 from a second post with no visible credit. They're structure only. Borrow the arrangement, never a finished design.

**Terms.** *Micro item* is the wireframes' "microritm" (read here as "micro item"): a small label such as a scroll cue, a location, a rating, "Open today", or a short social-proof line. *Background shape* is a decorative CSS or SVG shape, hidden from screen readers. *CTA* is the call to action.

## The wireframes

Each sketch is desktop width. **Phone order** is the order the blocks stack in at 375 px.

### W1 · Corner caption (a Full-Bleed variant)
```
[ HEADER                                   ]
[                IMAGE (full)               ]
[ TEXT block      ]             [ micro    ]
```
- **What it is:** one big image; headline and short text in a solid block bottom-left; one micro item bottom-right.
- **Fits:** venues, restaurants, hotels, physical products.
- **Phone order:** header, image, text block, micro item.

### W2 · Two text blocks (Full-Bleed, asymmetric)
```
[ HEADER                                   ]
[        IMAGE                  [ micro   ] ]
[ [TEXT]               [ TEXT (larger)    ] ]
```
- **What it is:** a short line bottom-left (a tag or location) and the main message bottom-right, with a micro item above it.
- **Fits:** services that want a calm, editorial feel.
- **Phone order:** header, image, main text, micro item, short text.

### W3 · Banner headline (between Full-Bleed and Wordmark)
```
[ HEADER                                   ]
[ ========== TEXT (full-width band) ======= ]
[                IMAGE                      ]
[ [micro]                         [micro]   ]
```
- **What it is:** the headline as a full-width band near the top, the image below or behind it, and micro items in both bottom corners.
- **Fits:** events, launches, short punchy brand names.
- **Phone order:** header, band, image, micro items side by side.

### W4 · Staggered text (Full-Bleed, scattered)
```
[ HEADER                                   ]
[ [ TEXT  ]          IMAGE                  ]
[            [TEXT]                         ]
[ [micro]                         [micro]   ]
```
- **What it is:** headline top-left, a second block offset lower toward the center, micro items in the bottom corners. It feels designed rather than templated.
- **Fits:** creative studios, fashion, portfolios.
- **Phone order:** headline, image, second text, micro items. Drop the offset on phones.

### W5 · Text and filmstrip (Gallery or Split)
```
[ HEADER                                   ]
[ [ TEXT      ] [ IMG ] [img][img][im…→     ]
[ [micro]                         [micro]   ]
```
- **What it is:** text on the left; one tall image, then a row of smaller images that runs off the right edge to suggest more.
- **Fits:** portfolios, agencies, salons, real estate, menus.
- **Phone order:** text, then the strip as a horizontal scroller.
- **Rules:** the scroller works with keyboard and touch. No autoplay unless there's a pause button.

### W6 · Centered with a stepped shape
```
[ NAVIGATION                               ]
[ ######        Title / Subtitle     ###### ]
[ ########         [ CTA ]        ######### ]
[ ##############              ############# ]
```
- **What it is:** centered title, subtitle and one CTA. A stepped "pixel staircase" background shape forms a V that points the eye down to the CTA.
- **Fits:** SaaS, apps, games, playful or retro brands.
- **Phone order:** unchanged. Simplify the steps to two.

### W7 · Bento grid
```
[ NAVIGATION                               ]
[ [ Title  ] [               ] [ Card ]     ]
[ [ Media ]  [    IMAGE      ] [ Text ]     ]
[ [ Text  ]  [               ] [ CTA  ]     ]
```
- **What it is:** a grid of boxes in different sizes: title, media and text on the left, a big image in the middle, and card, text and CTA on the right.
- **Fits:** AI tools, SaaS with several features, dashboards, agencies.
- **Phone order:** title, image, CTA, then the rest.
- **Rule:** the grid collapses to one column; the CTA must not end up below the fold.

### W8 · Product showcase (Split, for shops)
```
[ Logo      [ Navigation ]       Icon [CTA] ]
[ |slider|  [            ]    [Badge]       ]
[ [Media ]  [ PRODUCT IMG]    [  Title    ] ]
[           [            ]    [Price][CTA ] ]
```
- **What it is:** a tall product image in the center; a slider indicator and a secondary media box on the left; badge, title, price and CTA on the right.
- **Fits:** single products, online shops, menus with one hero item.
- **Phone order:** image, title, price, CTA, then media.
- **Rule:** the price is real text.

### W9 · Organic bento (puzzle panels)
```
[ Logo              [ Navigation ]   [CTA]  ]
[ [ Title         ] /  IMAGE (blue)       ] ]
[ [Thumb][Text][B][B]                     / ]
[ \ IMAGE (green)                 /Product/ ]
```
- **What it is:** a bento grid with angled, rounded panels that lock together like puzzle pieces. A title panel with a thumbnail, text and two buttons; two big image panels; a product corner.
- **Fits:** lifestyle brands, food, travel, creators.
- **Phone order:** title panel, images, product.
- **Rule:** shapes are made with `clip-path` or SVG, and become simple rounded rectangles on phones.

### W10 · Centered arc
```
[ Logo        [ Navigation ]          Icon  ]
[  \\                                  //   ]
[    \\       [   TITLE   ]          //     ]
[             [   Text    ]                 ]
[           [ CTA ]  [ CTA ]                ]
[                 small text                ]
```
- **What it is:** a large arc background shape framing a huge centered title, one line of text, two CTAs and a small line underneath (a trust line or a note).
- **Fits:** Wordmark-style brands, events, apps, nonprofits.
- **Phone order:** unchanged. Narrow the arc.

## How they map to the five hero styles (PRD)

| Hero style | Wireframes |
| --- | --- |
| Split | W5, W8 |
| Full-Bleed | W1, W2, W3, W4 |
| Orbit | None directly. W5's filmstrip or W9's panels can be arranged around a centered title |
| Gallery | W5, W7 |
| Wordmark | W3, W10 |
| **New: Bento** | W7, W9 |
| **New: Centered with a shape** | W6, W10 |

## Rules for every wireframe

1. **The Designer names the wireframe** (e.g. "W7 Bento") and the hero style in each direction's DESIGN.md, with one line on why it fits the client. Across a demo's directions, use at least two different wireframes.
2. **Write the phone order down** in DESIGN.md, then check the build at 375, 768 and 1280 px against it.
3. **One main CTA in the accent color** (see `accent-palettes.md`). Where a wireframe shows two CTAs (W9, W10), the second is plain or outlined, never a second accent.
4. **Text over images sits in a solid or tinted block** (W1–W4) with contrast of at least 4.5:1, checked by script.
5. **Micro items are real, useful content** (location, hours, rating, scroll cue). Skip them rather than fill them with filler. They must not crowd the CTA on phones.
6. **Background shapes are decoration only:** CSS or SVG, `aria-hidden`, no images, and with no effect on the page's largest element.
7. **Headings are real HTML headings,** never text inside an image.
8. **Motion** (a scrolling filmstrip, shapes drifting) counts as the demo's one signature moment, respects `prefers-reduced-motion`, and keeps Lighthouse mobile performance at 90 or above.
