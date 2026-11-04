# UI/UX & Design Audit

> Henry's audit prompt 2 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as a seasoned senior product/graphic designer conducting a visual and UX audit of my website/app. Be blunt — I'd rather hear what's wrong than have it softened.

PART A — GENERIC "AI SLOP" / TEMPLATED-DESIGN AUDIT
For each item below: (1) identify whether it's present, with the specific location, (2) explain briefly why it reads as poor/generic, (3) suggest a concrete improvement.
- Harsh gradients
- Lucide icons (or any other obviously default icon set)
- Pure white background
- Rainbow coloring
- Drop shadow on everything
- Exactly 3 feature cards in a row
- Emojis used as UI elements
- "Liquid glass" / glassmorphism overuse
- Em dashes in copy
- Inter / Geist / Space Grotesk used as the only font (generic AI-default typography)
- Colored left stripe on cards
- Fake testimonials
- Bento grids
- Terminal-window motif used decoratively without purpose
- "It's not X, it's Y" copywriting pattern
- Checkmark bullet lists
- Exactly 3 pricing tiers
- No real product demos or screenshots
- Soft corner radius on everything (uniform border-radius with no variation)
- Purple-and-black color schemes
- No skeleton loaders
- Radial background orbs
- Dot-grid backgrounds
- Sparkle icons
- Animated arrows
- Hover animations on everything
- Neon colors
- Basic pastel colors with no distinct point of view

PART B — SITE STRUCTURE & TRUST ELEMENTS
Check for presence and quality of each, with placement/design recommendations:
- Custom 404 page
- Clear calls-to-action above the fold
- Internal linking between related content
- Thank-you page after form submission/inquiry
- Breadcrumbs
- Case study section (template/structure)
- At least 5 FAQs
- A stated response-time promise
- Sticky mobile call-to-action
- Unique, descriptive page titles
- Real customer reviews (how to collect and display them)
- Maps and directions where relevant
- Real team photo, not stock imagery
- Rich tooltips for navigation aids
- Site favicon present and correct
- Tap-to-call phone number works on mobile
- Clear, visible form error messages
- Opening hours displayed clearly (if applicable)
- About page tells an actual story, not boilerplate

PART C — INTERACTION & PERCEIVED PERFORMANCE
- Optimistic UI updates on buttons that wait on the server
- Skeleton screens instead of blank screens/spinners during load
- Preloading, cached last-state, and background refresh instead of opening to an empty screen
- Tap/press animations that make interactions feel responsive
- Offline support — actions queue and replay when the connection returns

PART D — CHATBOT / CONVERSATIONAL UI (if applicable)
Act as a graphic designer refining the chatbot's appearance. Given a supplied wireframe/notes image (attach when running this):
- Green-highlighted components = visual elements to design — list them out
- Yellow-highlighted components = phrases that should cycle with a fade effect alongside the visual element — suggest additional short phrases in the same tone as "ask me anything", "do you have a question?", "ask a question...", "need help?", "i'm here for you...", "let's chat!", "what's up?"
- Orange-highlighted components = instructions for how elements behave (e.g. a connecting line between the chatbot and the phrase should be translucent and softly floating, anchored to a point on the circle) — describe the animation precisely
Output: list of visual elements → list of phrases (including your additions) → description of animations.

ADDITIONS (not in my original prompts):
- Dark mode / light mode support and whether it's implemented consistently, not just inverted colors
- Color contrast checked against WCAG AA minimums, not just "looks fine"
- Touch target sizing on mobile (minimum ~44x44px tap targets)
- Consistent spacing/type scale — flag arbitrary one-off font sizes and margins instead of a defined scale
- Empty states designed intentionally (first-use, zero-results, cleared-data) not just "no data" text
- Focus states visible for keyboard navigation, not just mouse hover
- Motion respects `prefers-reduced-motion`
- Copy tone audit — is the microcopy (button labels, error messages, empty states) consistent in voice across the whole product, or does it shift page to page
- Onboarding flow for a first-time user — can they reach real value without instructions or a tour?
- Favicon and app icons present across sizes (apple-touch-icon, manifest icons), not just a single favicon.ico
- Form inputs use correct mobile keyboard types (email, tel, number) and support browser autofill
- Destructive actions (delete, cancel, remove) require confirmation, and offer undo where feasible
- Navigation/information architecture — can a new visitor find what they need in three clicks or fewer?
- Localization readiness if non-English visitors are expected — hardcoded strings vs. extractable copy
- Cross-browser testing beyond Chrome/mobile — Safari and older browsers checked for layout-breaking bugs
- Session-timeout warning shown before a user gets logged out mid-task, rather than silently dropping them
- Distinct error pages for 404 vs. 500 vs. permission-denied, each with a way back
- Analytics or a heatmap tool in place so design changes are validated against real behavior, not just opinion
- Icon set and visual language consistent site-wide — no mixing of icon libraries or styles

Output: a findings report per part above, with the worst 3-5 offenders called out first as priority fixes.
