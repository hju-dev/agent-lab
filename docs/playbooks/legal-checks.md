# Legal checks: common legal mistakes in quickly built ("vibe-coded") apps

**Used by:** Studio's Strategist (records the facts), Builder (safe defaults) and Auditor (checks, alongside `docs/audits/05-compliance-legal.md`). Also applies to hju-dev and /lab. Added 1 November 2026 from Henry's list, expanded and checked against sources.

**This is not legal advice.** It flags risk so Henry can fix the obvious problems and know what to ask a lawyer. Privacy and consumer law changes fast; every law named here was checked on the date above, and anything marked *verify* needs checking against the official source before relying on it. Which laws apply depends on **where visitors and customers are**, not where Henry is.

## Step 1 · The Strategist records these facts in `brief.md`

Every client build starts by answering these. Most of the checks below depend on them.

1. **Where are the visitors and customers?** (US, which states; EU/UK; Thailand; elsewhere)
2. **Could children use it, or is it aimed at them?** Does it sell or advertise anything age-restricted (alcohol, vapes, gambling, adult content, some supplements)?
3. **What personal data does it collect?** Forms, accounts, photos, location, payment, health.
4. **Which third-party scripts and services load?** Fonts, analytics, session replay, chat, maps, video embeds, pixels, email tools, payment.
5. **Does it take payments, and are any recurring?**
6. **Does it send email, and is any of it marketing?**
7. **Does it use AI** that talks to visitors (a chatbot) or analyzes their photos?

Unknown answers are marked `[CONFIRM]` and asked of the client before gate 1.

## Step 2 · The seven common mistakes, expanded

### 1. No age check
- **Why it matters:**
  - **US COPPA:** needs verifiable parental consent before collecting personal data from children under 13, for sites aimed at children or that know a user is under 13.
  - **GDPR:** children's consent to online services is valid only from 16 by default (member states can lower it to 13).
  - **UK Children's Code:** applies to services likely to be used by children.
  - **Thailand PDPA:** has extra consent rules for minors; Thailand's age of majority is 20 (*verify the PDPA age bands with the lawyer*).
  - **Age-restricted products:** these need an age gate regardless, and Thai law restricts alcohol advertising heavily.
- **Builder:**
  - If the brief says children could use it, don't collect any personal data from them without a design approved by Henry and the client.
  - Age-restricted products get an age gate before the content, and an age check at checkout.
  - Never collect a full date of birth when "Are you 18 or over?" is enough (data minimisation).
- **Auditor:** checks that the age gate shows before restricted content and can't be skipped by going straight to a URL.

### 2. Google Fonts loaded from Google's servers
- **Why it matters:** loading fonts from `fonts.googleapis.com` sends each visitor's IP address to Google. In January 2022 a Munich court (LG München I, 3 O 17493/20) ordered a site owner to pay damages for doing this without consent. It's an EU case, but it's the clearest example.
- **Builder:**
  - Self-host every font. In Next.js, `next/font/google` downloads the font at build time and serves it from the site itself, so no request reaches Google.
  - In plain HTML, download the `.woff2` files and use `@font-face`.
  - The same applies to icon fonts, and to font requests made by CDNs.
- **Auditor:** loads the page with the network tab recorded (Playwright) and fails it on any request to `fonts.googleapis.com` or `fonts.gstatic.com`.
- **hju-dev has this now:** `index.html` loads Inter and JetBrains Mono from Google. Fix: self-host both. That's about 30 minutes, and it doesn't touch the frozen plan's code.

### 3. Session-replay tools recording passwords and personal data
- **Why it matters:** tools like Hotjar, Microsoft Clarity, FullStory and LogRocket record what visitors type and see. Misconfigured ones have captured passwords, card numbers and health details; a 2017 Princeton study found this happening across many sites. Recording without consent is also a tracking-consent problem (see #7).
- **Builder:**
  - Default: no session replay (STACK.md already skips it).
  - If a client insists, load it only after consent.
  - Mask all inputs and any personal text, using the tool's masking setting plus explicit suppression attributes.
  - Never load it on login, checkout, account or form pages.
  - Name the tool in the privacy policy.
- **Auditor:** fails the build if replay is present without masking or consent, or if it runs on a login or checkout page.

### 4. Waitlist and marketing email with no unsubscribe
- **Why it matters:**
  - **US CAN-SPAM:** commercial email needs a working unsubscribe, honoured within 10 business days, plus a valid postal address.
  - **EU/UK:** marketing email generally needs opt-in consent first.
  - **Gmail and Yahoo (since 2024):** bulk senders must offer one-click unsubscribe and authenticate their domain (SPF, DKIM, DMARC).
  - A waitlist that later sends marketing is marketing email.
- **Builder:**
  - Signup forms say what people will receive.
  - Use double opt-in: confirm by email.
  - The consent checkbox is unticked by default.
  - Store when and how each person consented.
  - Every marketing email has a one-click unsubscribe link and the sender's postal address.
  - Send through a proper email service on the client's verified domain, never a personal Gmail.
- **Auditor:** signs up with a test address and checks the confirmation email, the unsubscribe link and that unsubscribing works.

### 5. Subscription "Pay" buttons with no renewal terms
- **Why it matters:**
  - **US ROSCA:** online subscriptions must clearly disclose terms before billing, get express informed consent, and offer a simple way to cancel.
  - **The FTC's "Click-to-Cancel" rule** was struck down by the Eighth Circuit in July 2025, but ROSCA and state auto-renewal laws (California's is the strictest) still apply.
  - **EU:** consumers generally get a 14-day right to withdraw from online purchases, with exceptions.
  - Applies to any provider: Paystack, Stripe, PayPal.
- **Builder:**
  - Next to the pay button, show the price, the billing period, that it renews automatically, when the next charge is, and how to cancel.
  - If there's a free trial, say what it converts to and when.
  - Add a consent checkbox for recurring billing.
  - Send a receipt email that repeats the terms.
  - Cancelling online must be as easy as signing up.
  - Use the provider's hosted checkout, so card data never touches the client's server (keeps PCI scope small).
  - Link the refund policy from checkout.
- **Auditor:** checks each item on the checkout page and in the test receipt.

### 6. Profile photos and "biometric data"
- **The claim needs a correction.** Storing a profile photo is personal data, but it is **not** biometric data on its own. It becomes biometric data when it's processed to identify someone:
  - face recognition or face matching
  - "verify it's you" selfie checks
  - AI that measures facial features
- **Why it matters when it is:**
  - **Illinois BIPA:** needs written consent, a public retention and deletion policy, and no selling. It lets individuals sue, and the damages have been very large.
  - Texas and Washington have similar laws.
  - **GDPR:** treats biometric data used to identify people as special-category data (Article 9).
- **Builder:**
  - Default: no face recognition or face analysis.
  - Strip EXIF metadata (including GPS location) from uploaded photos.
  - Let users delete their photo.
  - Cover photos in the privacy policy.
  - If face features are ever required, stop: it needs Henry's OK, a written consent flow, a published retention policy, and a lawyer.
- **Auditor:**
  - Uploads a photo containing GPS data and checks the served copy has no location.
  - Checks that the delete function works.
  - Searches the code for face-recognition libraries or APIs.

### 7. No cookie banner, or a fake one
- **Why it matters:**
  - **EU (ePrivacy + GDPR) and the UK (PECR):** consent is needed **before** non-essential cookies and trackers load. That includes analytics like GA4, ad pixels and session replay.
  - Regulators (France's CNIL, for example) have fined sites where rejecting was harder than accepting.
  - **Thailand's PDPA:** generally needs consent for non-essential cookies too (*verify current PDPC guidance*).
  - **US:** mostly no banner required, but California's CCPA/CPRA requires a "Do Not Sell or Share" opt-out for businesses over its thresholds, and pixels can count as "sharing".
- **Builder:**
  - Load no analytics, pixel or replay script until the visitor accepts.
  - Put "Accept" and "Reject" side by side and equally easy.
  - Let visitors change their choice later (a footer link).
  - Strictly necessary cookies (login sessions, the cart) need no consent.
  - With GA4, use Google Consent Mode with the default set to denied.
  - Better still for small sites: skip non-essential cookies altogether, and then no banner is needed.
- **Auditor:**
  - Loads the page in a fresh browser and fails it if any analytics or pixel request fires before consent.
  - Clicks Reject and checks nothing fires afterwards.
  - Checks the footer link reopens the choice.
- **hju-dev and /lab:** if GA4 is loaded on them, the same rule applies, because recruiters may visit from the EU. Either add a consent banner with Consent Mode set to denied by default, or switch to a cookieless setup. Decide before /lab launches (on the Later list until then).

## Step 3 · Further common mistakes the Auditor also checks

| # | Mistake | Why it matters | Fix |
| --- | --- | --- | --- |
| 8 | No privacy policy, or one copied from a template that doesn't match | GDPR, CCPA, Thai PDPA and app stores require an accurate one | Generate it from the brief's data list: what's collected, why, which third parties, how long it's kept, how to request deletion, a contact. The client confirms it; Henry doesn't invent the legal wording |
| 9 | No terms of service on sites that sell, take accounts or host user content | Sets refunds, liability, acceptable use | A client-approved terms page linked from the footer and checkout |
| 10 | An AI chatbot that doesn't say it's AI | **EU AI Act Article 50:** people must be told they're talking to an AI system. It applies from 2 August 2026 (*verify which parts are in force*). Also a trust issue everywhere | The chat window says it's an AI, what happens to messages, and offers a human contact. Don't send personal data to an AI provider without saying so in the privacy policy |
| 11 | Fake or invented reviews and testimonials | The FTC's 2024 rule bans fake reviews and testimonials, with penalties per violation | The Copywriter never invents them (existing `[CONFIRM]` rule). Real ones only, with permission |
| 12 | Inaccessible site | US ADA web lawsuits are common. The **European Accessibility Act** has applied to many e-commerce sites since 28 June 2025 (small businesses partly exempt; *verify*) | Already covered: axe-core, keyboard and contrast checks, and an accessibility statement |
| 13 | Images, fonts or code without a licence | Copyright claims and takedowns | Every asset's licence is noted in the build folder. Stock from licensed sources only. No copying real brands (existing rule) |
| 14 | Secrets or customer data exposed | Breach notification duties under GDPR (72 hours) and Thai PDPA; liability | Already covered: secrets in environment variables, row-level security, `/security-review` |
| 15 | No way to delete an account or data | GDPR and PDPA rights to deletion and access | An account deletion option, or a documented email process answered within the legal timeframe |
| 16 | Contact form sends data with no notice | It's still personal data | A one-line notice under the form linking to the privacy policy; a honeypot or rate limit against spam |
| 17 | Third-party embeds (YouTube, Maps, social widgets) set cookies on load | Same consent problem as #7 | Click-to-load placeholders, or the privacy-friendly embed (`youtube-nocookie.com`), after consent |

## Step 4 · How each agent uses this file

- **Strategist:** answers Step 1 in `brief.md` and lists which of the 17 checks apply.
- **Builder:** applies the defaults above on every client build: self-hosted fonts, no trackers before consent, no session replay, double opt-in, full renewal terms, EXIF stripped, no face recognition, AI disclosed, a deletion route. Anything the client asks for that conflicts goes to Henry before building.
- **Auditor:** runs every applicable check before gate 3 and writes a "Legal checks" section in `audit.md`: pass, fail or not applicable, with evidence (network log, screenshot, test email). Any fail on 1–7 fails the audit. The section ends with "Questions for a lawyer" for anything marked *verify* or unclear.
- **Henry:** the client approves the legal pages and is responsible for the final wording, which their lawyer should check. Henry builds and flags; he doesn't give legal advice (part of the client contract, on the Later list).
