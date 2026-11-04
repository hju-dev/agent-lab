# Accent palettes: two base colors and one surprise accent

**Used by:** Studio's Designer (proposing directions) and Builder (writing the color tokens). Added November 1, 2026 from design advice Henry collected: "One accent color that catches you off guard."

## 1. The approved combinations

Henry keeps these as good starting points. **The names are his; the hex values are Claude's best guesses** at what each name means, apart from the ones marked CSS, which are standard CSS named colors. Henry adjusts any hex before a client sees it.

| # | Base 1 | Base 2 | Accent | Suits (starting guess) |
| --- | --- | --- | --- | --- |
| 1 | Sky blue `#87CEEB` (CSS skyblue) | White `#FFFFFF` | Hot pink `#FF69B4` (CSS hotpink) | Friendly consumer apps, kids' and family services, events |
| 2 | Midnight black `#0B0D12` | Electric blue `#1F51FF` | Cantaloupe orange `#FFA62F` | SaaS, dev tools, tech products |
| 3 | Deep blue `#0B2D6B` | White `#FFFFFF` | Bubblegum pink `#FF8FC7` | Fintech, education, nonprofits that want warmth |
| 4 | Charcoal black `#232629` | Royal blue `#4169E1` (CSS royalblue) | Tangerine orange `#F28500` | Agencies, B2B services, sport |
| 5 | Marshmallow white `#F8F5F0` | Galactic violet `#5B2A86` | Bubblegum pink `#FF8FC7` | Beauty, wellness, creators |
| 6 | Aqua jade `#3FB8A0` | Midnight abyss `#0A1A2F` | Baby pink `#F4C2C2` | Clinics, spas, health and care |
| 7 | Mandarin orange `#F37A1F` | Forest green `#228B22` (CSS forestgreen) | Crest yellow `#F9D648` | Food, cafés, outdoor, farms and markets |
| 8 | Onyx black `#353839` | Electric indigo `#6F00FF` | Tropical mint `#6FE3B0` | AI tools, gaming, nightlife |
| 9 | Seal blue `#1E3A5F` | Navy blue `#000080` (CSS navy) | Crimson pink `#E0245E` | Law, finance, consulting with some personality |

The "Suits" column is Claude's suggestion, not part of the original advice. Test it with the client's audience.

## 2. Why they work

Measured with a script on the hex values above (hue angle on the color wheel, WCAG contrast ratio):

1. **The base is calm and does most of the work.** Each pair is either a neutral plus one strong hue (white and sky blue; charcoal and royal blue), or two colors from the same family (seal blue and navy). Calm bases make the page feel unified, so there's nothing for the accent to compete with.
2. **The accent sits on the other side of the color wheel.** In 7 of the 9, the accent is 100–180° away from the base's main hue: blue against orange (about 170°), jade against pink (about 170°), blue against pink (110–135°). Opposite hues make each other look more intense. That's what "catches you off guard" means.
3. **The accent flips the temperature.** In 8 of the 9, the base is cool (blue, violet, jade, indigo) and the accent is warm (pink, orange, yellow). Warm colors seem to come forward and cool ones to sit back, so the eye goes to the accent first.
4. **The accent is the brightest, most saturated thing on the page.** Every accent is fully or highly saturated (67–100%) and in the mid-to-light range. Bright on top of deep or muted is a contrast of lightness, which still works for people with color-vision differences.
5. **It's used sparingly.** The surprise only works if it's rare. A common rule of thumb (from interior design, not a law) is about 60% main base, 30% second base and 10% accent.

**The two exceptions, and why they still work:**
- **#7 Mandarin / forest / yellow** is warm on warm: the yellow is only about 20° from the orange. It works because the yellow is much lighter than both bases, and forest green provides the opposite-temperature contrast. It's the least "surprising" of the set and reads as earthy and cohesive instead.
- **#8 Onyx / indigo / mint** has a cool accent on a cool base. It works because the mint is about 110° from the indigo and much lighter, so the jump in hue and lightness does what warmth does in the others.
- **#5 Marshmallow / violet / pink** is the softest: pink is only about 60° from violet. The surprise comes from the temperature flip (cool violet to warm pink), not distance.

## 3. What the numbers warn about (contrast)

- **No accent can be body text on white.** Against white, the accents range from 1.4:1 to 2.7:1, well under the 4.5:1 that normal text needs. Crimson pink (#9) is the only exception, at 4.6:1, which just passes.
- **On dark bases, accents pass easily** (cantaloupe on midnight 10:1, baby pink on midnight abyss 11:1, mint on onyx 7.5:1). Dark-base palettes can use the accent for links and highlights.
- **Text on an accent button should be dark.** Every accent scores 4.6–14.7:1 against black, and 1.4–4.6:1 against white.
- **Several base pairs are too close in lightness for text on each other:** sky blue/white 1.7, onyx/indigo 1.8, mandarin/forest 1.6, seal/navy 1.4. Use those pairs for areas and sections, not text on top of each other.
- **Pink and red accents (#1, #3, #5, #9) look like error colors.** Error messages need an icon and words, not color alone, and a red that's clearly different from the accent.

## 4. Rules for the Designer and Builder

1. **Three brand colors, plus text neutrals.** Every direction has `--base-1`, `--base-2` and `--accent`. Text uses a near-black and a near-white tinted toward the base hue (`--ink`, `--paper`). Lighter and darker tints of the bases are allowed for borders and hover states. No fourth hue.
2. **Pick from this file first.** If none fits the client's brand, build a new set with the same recipe: a calm base pair (neutral + one hue, or one hue family), an accent 100–180° away on the color wheel, opposite in temperature, and the most saturated color in the set. Say in DESIGN.md which recipe step the new accent satisfies.
3. **The accent goes on one job per screen:** the main call-to-action button, plus at most one or two small highlights (a key number, an underline, the active nav item). Never large backgrounds, never body text on light bases, never decoration everywhere. Aim for about 10% of the screen at most.
4. **Check contrast with a script, not by eye.** Before gate 2, the Designer lists every text and background pair in DESIGN.md with its WCAG ratio: at least 4.5:1 for normal text, 3:1 for large text and for buttons and icons against their background. Any pair that fails is changed before Henry sees it.
5. **Dark text on accent buttons** unless the script shows white passes.
6. **Status colors are separate.** Error, success and warning use muted colors with an icon and words, and must not be confused with the accent.
7. **Dark mode:** swap the base roles (dark base becomes the background), and keep the accent. Re-run the contrast check.
8. **One palette per direction.** Across a demo's 2–3 directions, use at least two different palettes, and say in one line why each suits the client.
9. **The Auditor checks** the token file has only the three brand hues plus neutrals, the accent appears on the main call to action, and the contrast table matches the built page (axe-core's color-contrast rule).
