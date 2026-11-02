# UX laws: the design rules every build follows

**Used by:** Studio's Designer (directions), Builder (code) and Auditor (checks), and /lab. Added 1 November 2026 from Henry's list. Most of these are collected in Jon Yablonski's *Laws of UX* (lawsofux.com). They're well-established rules of thumb from psychology and HCI research, not exact formulas. Where a number is given, it's a starting point to test.

Each law has: **what it means** · **the rule for our builds** · **how the Auditor checks it**.

## Looks and first impressions

**1. Aesthetic-Usability Effect.** People see attractive designs as easier to use and forgive small problems in them.
- **Rule:** polish matters, but it never hides a usability problem. Test with the real flow, not just screenshots.
- **Check:** the Auditor tests the main task (book, buy, contact) even when the design looks finished.

**2. Visual hierarchy.** Size, weight, color, contrast and position tell people what to look at first.
- **Rule:** each screen has one clear first thing (the headline), one second thing (the main CTA) and then everything else. One `h1` per page, with headings in order.
- **Check:** a squint or blur test on the screenshot: the headline and CTA still stand out. Headings are in order (axe).

**3. Von Restorff Effect (isolation effect).** The one item that looks different is the one people remember.
- **Rule:** this is why the accent color works (`accent-palettes.md`). Use it on one thing per screen. If everything stands out, nothing does. Never rely on color alone: add size, shape or a label.
- **Check:** the accent appears on the main CTA and at most one or two highlights.

## Choices and memory

**4. Hick's Law.** The more options there are, the longer it takes to decide.
- **Rule:** one main CTA per screen. A top menu of about 5–7 items. Long lists get grouped, searched or filtered. Highlight a recommended option (e.g. the middle package).
- **Check:** count the main nav items and the CTAs in each hero.

**5. Miller's Law.** People hold only a few items in working memory at once (often quoted as 7 ± 2; later research suggests closer to 4).
- **Rule:** chunk information: phone numbers in groups, forms in short sections, features in groups of 3–5. Don't read it as "menus must have 7 items"; that's a common misuse.
- **Check:** no block of more than about 5 ungrouped items or fields.

**6. Recognition over recall.** Seeing an option is easier than remembering it.
- **Rule:** visible labels on icons, visible menus (no hidden menus on desktop), placeholder text never used as the only label, recently used items shown, and helpful defaults filled in.
- **Check:** every icon button has a visible label or tooltip and an accessible name (axe).

**7. Serial Position Effect.** People remember the first and last items in a list best.
- **Rule:** put the most important nav items first and last (e.g. Home first, Contact or the CTA last). Open and close each page with the key message.
- **Check:** the CTA appears in the hero and again at the end of the page.

**8. Progressive Disclosure.** Show only what's needed now; reveal the rest when asked.
- **Rule:** advanced options, long details and FAQs go in expandable sections or later steps. Never hide what most visitors need (price, contact, hours).
- **Check:** expandable sections use `<details>` or proper buttons with `aria-expanded`, and work with a keyboard.

## Layout and grouping (Gestalt)

**9. Law of Proximity.** Things close together look related.
- **Rule:** labels sit closer to their own field than to the next one. Space between groups is bigger than space within them. Use a consistent spacing scale.
- **Check:** spacing comes from the token scale, not one-off values.

**10. Law of Similarity.** Things that look alike seem to work alike.
- **Rule:** every link looks like a link, every button of the same type looks the same, and things that act differently look different.
- **Check:** one style for each kind of button, and links are underlined or otherwise clearly marked.

**11. Common Region.** Things inside the same border or background feel like a group.
- **Rule:** use cards, panels and background bands to group related content (this is what the bento wireframes W7 and W9 rely on). Don't box everything, or the boxes stop meaning anything.
- **Check:** each card contains one topic.

## Interaction and speed

**12. Fitts's Law.** The time to hit a target depends on its size and distance.
- **Rule:** big tap targets (at least 44 × 44 px for main controls; WCAG 2.2's minimum is 24 × 24), the main CTA near where the eye already is, and room between targets so people don't hit the wrong one. On phones, important actions within thumb reach.
- **Check:** Playwright measures the main CTA and nav targets at 375 px.

**13. Doherty Threshold.** People stay engaged when the system responds in under about 400 milliseconds.
- **Rule:** respond to every tap at once: a pressed state, a spinner or an optimistic update within 400 ms, even if the real work takes longer. This is the same idea as the fast-startup playbook.
- **Check:** Lighthouse's interaction measure (INP) stays under 200 ms. Any action taking over 1 second shows progress.

**14. Feedback loops.** Every action should get a visible, clear response.
- **Rule:** buttons show hover, focus and pressed states; forms say what went wrong next to the field and how to fix it; success is confirmed in words. Status messages are announced to screen readers (`aria-live`).
- **Check:** submit the form empty and with valid data; both give clear feedback.

**15. Goal-Gradient Effect.** People speed up as they get closer to a goal.
- **Rule:** multi-step flows (booking, checkout, onboarding) show progress ("Step 2 of 3") and can start partway done (e.g. details already filled in).
- **Check:** any flow with more than one step shows where the person is.

**16. Peak-End Rule.** People judge an experience by its best or worst moment and by how it ended.
- **Rule:** design the peak (the signature moment) and the end (a warm confirmation page after booking or contact, with what happens next). Make error states kind.
- **Check:** the confirmation page exists and says what happens next.

## Familiarity and simplicity

**17. Jakob's Law.** People spend most of their time on other sites, so they expect yours to work the same way.
- **Rule:** logo top-left links home, nav at the top, cart or CTA top-right, contact details in the footer. Be original in the look, not in the basic controls.
- **Check:** the logo links home; the nav is where people expect it.

**18. Tesler's Law (conservation of complexity).** Every system has some complexity that can't be removed, only moved.
- **Rule:** move it to the system, not the visitor: auto-format phone numbers, detect the city, prefill what we know. Be honest about the work this adds to the build.
- **Check:** forms ask only for what's needed and do the formatting themselves.

**19. Postel's Law.** Accept a wide range of input; be strict and consistent in what you output.
- **Rule:** forms accept "+66 81 234 5678", "081-234-5678" and "0812345678" and store one format. Accept spaces and capitals in emails. Show results in one consistent format. Validate on the server too.
- **Check:** a test enters each common format and gets the same stored value.

**20. Occam's Razor.** Of solutions that work equally well, choose the simplest.
- **Rule:** remove anything that doesn't help the visitor's task: extra sections, extra libraries, extra animation. This matches the $0 stack and the "one signature moment" rule.
- **Check:** for each section and dependency, the Auditor asks "what breaks if we delete this?" and lists anything that could go.

## How the agents use this file

- **Designer:** each DESIGN.md has a short "UX laws" line naming the 3–5 laws that shaped the direction most (e.g. "Hick: one CTA; Von Restorff: accent on Book now; Peak-end: confirmation page").
- **Builder:** follows the rules while writing code; checks 6, 8, 12, 13, 14 and 19 are written as tests where possible.
- **Auditor:** runs every check above before gate 3 and lists failures in `audit.md`, ranked by how much they hurt the main task.
- **When laws conflict** (e.g. Progressive Disclosure vs Recognition), the visitor's main task wins: never hide what most visitors need.
