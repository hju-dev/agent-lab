# SEO & Marketing Audit

> Henry's audit prompt 4 of 7. Used by the Studio Auditor. See the PRD's "Auditor's checklist" table for which sections run on the demo track.

Act as an SEO consultant and digital marketing specialist tasked with improving my website's search visibility. Provide detailed, actionable steps for each task, including real examples, templates, or code/config snippets (a sample sitemap.xml structure, robots.txt rules, JSON-LD schema markup, etc.) wherever a concrete example would help me implement it directly, and flag anything you're not certain about rather than guessing.

### Technical Setup
1. How to submit the site and its XML sitemap to Google Search Console — full step-by-step.
2. How to set up Google Analytics, with a concrete example of what to track first.

### Keyword Strategy
3. Identify target keywords for this site/niche.
4. Open and analyze the top 3 ranking pages for each target keyword: count occurrences of the keyword and its variations, and note where it appears in heading tags (H1/H2/H3).
5. Based on that analysis, draft a heading-tag outline (H1/H2/H3 structure) for a new page targeting the primary keyword.
6. Ask me clarifying questions needed to actually produce that page — personal stories, case studies, examples, and image requirements — before writing it.

### On-Page Optimization
7. Techniques for optimizing existing pages for specific keywords.
8. Tips for writing effective meta titles and descriptions, with examples.
9. Unique, descriptive page titles across the site (not duplicated).
10. Meta descriptions written for every key page.
11. Alt text on all images.
12. Local business schema markup, if this is a local/service business.
13. Social share image (Open Graph / Twitter Card) set for key pages, with correct dimensions.

### Off-Page & Authority
14. Analyze backlinks (e.g. via Ubersuggest or a similar tool) and identify industry-specific guest-posting opportunities — search pattern: `intitle:"write for us" [niche]`.

### Content
15. At least 5 blog posts published, visible, and optimized for target keywords.

ADDITIONS (not in my original prompt):
- Page speed as an SEO factor — Core Web Vitals directly affect ranking, so cross-reference with the Performance audit above
- Mobile-first indexing check — confirm the mobile version is what Google actually indexes and nothing is hidden/broken there
- Structured data validation (Schema.org) beyond local business — Article, FAQ, Product schema where applicable, tested in Google's Rich Results Test
- Canonical tags set correctly to avoid duplicate-content penalties
- robots.txt and llms.txt reviewed so search engines and AI crawlers can actually read the site — check for accidental "noindex" or blocked paths
- Broken internal/external links audit
- Competitor gap analysis — what keywords competitors rank for that this site doesn't
- Redirect audit — old/broken URLs return proper 301s, not 404s or chains of redirects
- Image file names and alt text both optimized, plus an image sitemap if images matter to the business
- E-E-A-T signals present — a real author bio, credentials, or business info backing the content
- Google Business Profile set up and consistent (name/address/phone) if this is a local-facing business
- Canonical/duplicate-content issues checked across www vs. non-www and http vs. https
- Search Console's coverage and structured-data reports reviewed on a schedule, not just set up once and forgotten
- Error/utility pages (404, thank-you, staging) set to noindex so they don't get indexed by mistake
- Visibility in AI answer engines (ChatGPT, Perplexity, Google AI Overviews) considered as a newer, separate channel from classic search ranking
- Audit for ACCIDENTAL noindex tags or meta robots directives blocking real content pages from being indexed — the opposite failure mode from the noindex-on-utility-pages check above
- Each page has exactly one H1, and a clean H1 → H2 → H3 hierarchy with no skipped or out-of-order levels
- Internal linking built deliberately, not just audited for breakage — priority/money pages get more internal links pointing at them, and orphan pages (no internal links in) are identified
- URL slugs cleaned up — short, human-readable, keyword-relevant, no stray IDs or query-string cruft in indexable URLs
- HTTPS enforcement confirmed as a direct (if minor) ranking signal, cross-referencing the Security and Deployment audits rather than re-auditing it here

Output: a numbered action plan matching the structure above, each item marked with estimated effort (low/med/high) and priority.
