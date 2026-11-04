# Skills and tools guide

> Source of truth: this file in the agent-lab repo. The claude.ai doc that used to mirror it was archived on Nov 4, 2026.

Of the roughly 45 items on your list, 13 are worth installing or using now, 6 are worth adding later and the rest should be skipped. Several of the "skills" are commands already built into Claude Code. Screen everything with SkillSpector before installing, because a skill is code and instructions that run with your permissions. Research checked on October 16, 2026. The install commands come from each project's docs or from reviews, so confirm them against the official README.

## Install safely: do this for every item

1. **Check the source:** who wrote it, the last update, the license and the stars on GitHub.
2. **Scan it:** `skillspector scan https://github.com/<owner>/<repo> --no-llm`. Don't install anything with a critical or high finding.
3. **Install per project** in `.claude/skills/`, unless it's a general tool you'll use everywhere.
4. **Record it:** add the name and version to the README.
5. **Measure it:** run `/doctor` and `/context` after installing. Remove anything you haven't used in 2 weeks, since every installed skill costs some context.

## Already built into Claude Code

These need no install. Several lists sell them as skills.

| Command | What it does | When to use it |
| --- | --- | --- |
| `/doctor` | Checks your Claude Code setup and lists unused plugins | After installing anything |
| `/rewind` | Rolls back to an earlier checkpoint | Right after Claude makes a mistake you don't want to build on |
| `/compact` | Summarizes the conversation to free up context. It resets the prompt cache, so use it at natural breaks | Long sessions, between phases or Studio roles |
| `/mcp` | Shows connected MCP servers and their status | When a tool isn't showing up |
| `/status` | Shows your remaining plan usage | Before starting a Studio build |
| `/security-review` | Built-in security review | Auditor step, before every gate 3 |
| `/code-review` | Built-in code review | Before merging a phase |
| `/agents`, `/plugin`, `/memory`, `/resume` | Manage subagents, plugins, memory and past sessions | Setting up Studio |

I couldn't find `/handoff` or `/ponytail` in Claude Code's docs, so they're probably third-party skills. Treat them like any other install.

## Install now: the Studio toolkit

| Tool | What it does | Install | How to use it | Studio role |
| --- | --- | --- | --- | --- |
| [Impeccable](https://github.com/pbakaus/impeccable) (Paul Bakaus) | Design skill with 23 commands that catch common AI design flaws. **You have this.** | Download the ZIP from impeccable.style, then `cp -r dist/claude-code/.claude your-project/` | `/impeccable audit`, `/impeccable critique hero`, `/impeccable polish`, `/impeccable typeset` | Designer, Auditor |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) (Leonxlnx) | Better layout, type, motion and spacing, with style variants (soft, minimalist, brutalist) and dials. **You have this.** | `npx skills add https://github.com/Leonxlnx/taste-skill` | "Use the soft-skill variant, low motion, airy density" | Designer |
| frontend-design (Anthropic) | Anthropic's own skill for distinctive, non-template UI | From Anthropic's official skills repo, [github.com/anthropics/skills](https://github.com/anthropics/skills) | "Use frontend-design to propose 3 aesthetic directions for this brief" | Designer |
| [web-design-guidelines](https://skillselion.com/guides/web-design-guidelines-skill-claude-code) (Vercel) | Audits UI code against Vercel's interface guidelines: focus, keyboard, touch targets, motion, forms, loading and error states | `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines` | "Review this UI against the web interface guidelines." Needs internet | Auditor |
| [playwright-cli](https://www.webfuse.com/blog/playwright-mcp-vs-playwright-cli) (Microsoft) | Browser actions as shell commands. Much cheaper in tokens than Playwright MCP, and Microsoft recommends it for coding agents | Package `@playwright/cli`. Check the README, then run `playwright-cli --help` | `npx playwright screenshot --viewport-size=1280,720 <url> out.png` at 375, 768 and 1280 widths | Strategist (crawl), Designer (mockup screenshots), Auditor (screenshots) |
| [web-asset-generator](https://claudeskills.info/skill/web-asset-generator/) (alonw0) | Favicons, app icons and social share images (1200×630 and more) from a logo or text | `npx skills add alonw0/web-asset-generator --skill web-asset-generator --agent claude-code`, then `pip install Pillow` | "Generate favicons and OG images from logo.png" | Builder |
| [marketingskills](https://claudefa.st/blog/tools/skills/claude-code-marketing-skills) (Corey Haines) | 33 marketing skills: copywriting, CRO, SEO, positioning | Clone into `~/.claude/marketing`, run `npm install`, and add one line to your CLAUDE.md (see source). Check the license first | "Write hero copy for this brief", "Run a CRO audit on this URL" | Copywriter |
| [Archify](https://instagit.com/tt-a1i/archify/integrating-archify-with-claude-code-codex-cli-and-opencode/) | Architecture diagrams as self-contained HTML | `npx skills add tt-a1i/archify -g`, or unzip into `.claude/skills/` | Your three prompts: high-level system, data flow, one component | Build journal, /lab/how-it-works |
| [Graphify](https://rajeevpentyala.com/2026/06/28/graphify-quick-start-reduce-token-usage-in-coding-agents/) (safishamsi) | Builds a knowledge graph of a codebase so Claude queries it instead of reading every file | `uv tool install graphifyy`, then the Claude install step from the README, then `/graphify .` | Open `graphify-out/graph.html` to explore. The "70% fewer tokens" claims I found weren't measured, so test with `/context` before and after | Every role, on large repos |
| karpathy-guidelines ([forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills), as far as I can tell; written by others from Andrej Karpathy's public observations, not by Karpathy himself) | One markdown file of coding guidelines: think before coding, simplicity first, surgical changes, goal-driven execution. No scripts, hooks or dependencies. **You have this** (installed Nov 1, 2026) | Copied by hand to `~/.claude/skills/karpathy-guidelines/SKILL.md`, byte-identical to the repo at commit `2c60614`, read before installing. It doesn't auto-update: to upgrade, read the new version and copy it again. For other machines or Claude Code on the web, commit a copy to `agent-lab/.claude/skills/karpathy-guidelines/` after checking the repo's license allows it | Loads when writing, reviewing or refactoring code, or with `/karpathy-guidelines`. CLAUDE.md ("Before you write code", step 5) tells every session to apply it | Every coding role: Builder and Auditor, and Agent Lab build sessions |
| [SkillSpector](https://docs.nvidia.com/skills/scanning-agent-skills) (NVIDIA) | Scans skills for prompt injection, data exfiltration, supply-chain risk and 65 other patterns | `git clone https://github.com/NVIDIA/SkillSpector.git`, then `make install` in a Python venv | `skillspector scan <repo-or-folder> --no-llm` | Gatekeeper for every install |
| [Firecrawl MCP](https://docs.firecrawl.dev/mcp-server) | Scrapes and searches websites into clean text. A keyless tier does search, scrape and parse within daily limits | Add the remote server `https://mcp.firecrawl.dev/v2/mcp-oauth` | "Scrape the homepage and about page of <lead site>" | Strategist |
| [Awesome Design.md](https://github.com/voltagent/awesome-design-md) (VoltAgent) | A collection of about 70 `DESIGN.md` files, each describing a real website's design system (colors, type, spacing, components) in plain text for AI agents to follow. MIT license. Not a skill: there's nothing to install | Copy the format, not a brand. The repo says "We do not claim ownership of any site's visual identity", so a demo built from Apple's or Stripe's file would copy someone else's identity. Read 2–3 files once to learn the format; the Designer writes a fresh DESIGN.md for each direction | "Write this direction as a DESIGN.md in the same structure as the examples" | Designer |
| [img2threejs](https://github.com/img2threejs/img2threejs) | A skill that turns one reference image into a code-built Three.js model, as a TypeScript function. Apache 2.0 license. Core scripts need Python 3.10+ and no API key | `npx --yes img2threejs@latest install --dry-run` first to see what it changes, then `install`, then `doctor`. Install in the **showpieces** repo, not every project. Skip the optional plugins: img2glb sends your image to a hosted service, and the environment plugin is private | `/img2threejs` with a reference photo. The README is honest that one image can't show hidden sides, so expect stylized results | Designer (approved 3D moments), Showpieces |

## Testing tools (npm dev dependencies, not skills)

These aren't Claude skills. They're ordinary packages installed in the repo with `npm install --save-dev`, and they run the checks in `docs/DONE_CHECKS.md` and `docs/EVALS.md`. They don't need a SkillSpector scan, but Dependabot watches them, and you check each one's license on its GitHub page before installing.

| Tool | Package | What it checks | When it's added |
| --- | --- | --- | --- |
| Vitest | `vitest` | Unit tests, leak test, eval metrics | Day 0 (walking skeleton) |
| Playwright Test | `@playwright/test` | /lab in a real browser: states, keyboard, reduced motion | Phase 4 |
| axe-core for Playwright | `@axe-core/playwright` | Automated accessibility rules inside the Playwright tests | Phase 4 |
| Lighthouse CI | `@lhci/cli` | Performance, accessibility, best practices and SEO scores on each preview | Phase 4 |
| promptfoo | `promptfoo` | Side-by-side prompt version comparison and AI-graded draft scores. Set the grader to a free-tier Gemini model; its default with a Google key is `gemini-2.5-pro` ([docs](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/llm-rubric/)) | Phase 6 |

`playwright-cli` (in the table above) is for Claude to take screenshots while building. `@playwright/test` is for automated tests in CI. They're different packages from the same project.

## Motion sources (not skills)

| Source | What it is (checked Oct 18, 2026) | Use for | Watch out |
| --- | --- | --- | --- |
| [transitions.dev](https://transitions.dev/) | 43+ UI transitions in HTML/CSS and React, copy-and-paste, plus a Builder and a Motion Skill for coding agents. Some free, some Pro (paid) | Page, menu, modal and list transitions in demos | Free items only. License and client-use terms weren't on the homepage; read its Terms page before the first client build. If you install its Motion Skill, scan it with SkillSpector first |
| [animos](https://animos.app/) | Browser-based motion templates (25) that turn screenshots or videos into MP4/WebM showcase videos | Showcase videos of finished demos for pitches, LinkedIn and your portfolio | Not website code. Pricing and commercial terms weren't on its homepage; check before using in a pitch |
| [SiteReel.ai](https://sitereel.ai/) | Website design gallery with copyable AI prompts (portfolio, product, luxury, landing pages) | Layout and section ideas for a direction | Pricing and terms not visible; check before use. Borrow structure, never copy a design |
| [Anime.js](https://animejs.com/) | MIT animation library (v4): timelines, scroll-linked animation, SVG path effects | Simple motion in demos where GSAP is more than needed | One animation library per demo. Wrap every animation in a `prefers-reduced-motion` check |
| [React Bits](https://reactbits.dev/) ([GitHub](https://github.com/DavidHDev/react-bits)) | Animated React components (text effects, backgrounds, cards, micro-interactions) installed as source you own: `npx shadcn@latest add @react-bits/<Component>-TS-TW` or copy from the Code tab | Signature moments in Next.js demos | License MIT + Commons Clause: free for commercial use; read LICENSE.md before client work. Check each component's dependencies (some use WebGL) and Lighthouse impact. Works in /lab too, which is React (ADR-0013) |

## The Designer's skill check (for Phase 12)

When the Designer subagent file (`.claude/agents/designer.md` in hju-studio) is written in Phase 12, it starts with this block. It makes the Designer ask you about skills instead of silently picking them.

```markdown
## Skill check (do this first, every task)
Before drafting anything, tell Henry in a short table:
- which of these you plan to use, and why, for THIS brief:
  Taste, Impeccable, playwright-cli, the DESIGN.md format, img2threejs
- which you're skipping, and why
- any you'd need that isn't installed yet (check `.claude/skills/`)
Then wait for Henry's OK.

Defaults: Taste, Impeccable, playwright-cli (375/768/1280 screenshots)
and the DESIGN.md format are used on every task.
Motion sources: for each direction, name the moments that need motion and
ask Henry to browse for them, then wait for his links:
- transitions.dev for UI transitions (page, menu, modal, list). Free items
  only; Pro items cost money. Check its Terms before the first client build.
- animos.app for showcase videos of a finished demo (MP4/WebM), used in
  pitches and portfolio posts. Not for code inside the site.
Every transition must respect prefers-reduced-motion.
img2threejs: suggest it ONLY if a direction needs a 3D object as its one
signature moment. Never use it without Henry's OK. The demo must still meet
Lighthouse mobile performance >= 90 and respect prefers-reduced-motion.
Awesome Design.md brand files: study them for principles only. Never copy a
real brand's colors, type or identity into a demo.

Mid-task: if a problem comes up that one of these skills handles better,
stop and suggest it ("This direction would benefit from X because Y.
Add it?") instead of improvising.
```

Check it works in Phase 12: run one design task and confirm the Designer shows the table and waits before drafting.

## Add later, when there's a reason

| Tool | Add it when | Note |
| --- | --- | --- |
| UI/UX Pro Max (nextlevelbuilder) | Demos start looking alike | A design database (styles, palettes, font pairs). Overlaps with Taste and Impeccable. Needs Python |
| Playwright MCP | You need long, exploratory QA sessions | One user measured about 28,000 tokens of tool definitions alone. Use playwright-cli by default |
| claude-mem (thedotmack) | You keep re-explaining context between sessions | CLAUDE.md and the build journal already do most of this job |
| Context Mode / Headroom | You hit your plan's usage limits | Token savers. Measure before and after |
| skill-creator (Anthropic) | Phase 12, writing hju-studio's own skills | Official |
| Jobs-to-be-done skills (wondelai) | The Strategist's briefs feel thin | I couldn't verify this repo |

## Skip

| Item | Why |
| --- | --- |
| Perplexity MCP | Needs a Perplexity API key; its pricing wasn't checked against Perplexity's own page. Skip regardless: Claude Code already has web search |
| Chrome MCP | You already have Claude in Chrome |
| Huashu Design | Free for personal use only. Client demos are commercial, so it would need a license |
| 21st.dev Magic MCP | Needs an API key, and I couldn't confirm a free tier. You can copy components from 21st.dev by hand |
| Manus | A separate AI builder that builds and hosts sites itself. Building uses credits and hosting is usage-based beyond small monthly allowances (its docs, checked Nov 1, 2026), so it isn't reliably $0. Code export and ownership weren't clear. And a site Manus built doesn't show your skills |
| Haikei, Motion Primitives, Watermelon UI | A website and component libraries. Use them in the browser when needed; there's nothing to install |
| Obsidian, Mem Palace | You dropped the second-brain idea |
| Security Sweep | Use the built-in `/security-review` instead |
| Glyph MCP, Image to Code, Claude Video, Text Observer, Task-observer, Manifest, skill-bus, AgentSkills, claude-code-setup, explain-code, ponytail, handoff | I couldn't verify these, or they overlap with built-in commands. If you still want one, scan it with SkillSpector first |

Your list linked two Instagram posts: "Workflow to Learn About (Overall Picture for Power Users)" and "More Skills". I can't open Instagram, so if either names specific tools or repos, type the names out and I'll check them.

## Sources

- [Claude Code docs map](https://code.claude.com/docs/en/claude_code_docs_map.md): built-in commands, skills, plugins, MCP, subagents
- [Use Claude Code with your Pro or Max plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)
- [NVIDIA: scanning agent skills (SkillSpector)](https://docs.nvidia.com/skills/scanning-agent-skills)
- [Top Claude Code front-end skills (The AI Leverage)](https://theaileverage.beehiiv.com/p/top-5-claude-code-front-end-skills): Impeccable, Taste, UI/UX Pro Max, Huashu
- [Vercel web-design-guidelines skill guide](https://skillselion.com/guides/web-design-guidelines-skill-claude-code)
- [Playwright MCP vs CLI (Webfuse)](https://www.webfuse.com/blog/playwright-mcp-vs-playwright-cli)
- [Graphify quick start](https://rajeevpentyala.com/2026/06/28/graphify-quick-start-reduce-token-usage-in-coding-agents/)
- [web-asset-generator](https://claudeskills.info/skill/web-asset-generator/)
- [Marketing skills for Claude Code (claudefa.st)](https://claudefa.st/blog/tools/skills/claude-code-marketing-skills)
- [Firecrawl MCP docs](https://docs.firecrawl.dev/mcp-server)
- [Awesome Design.md on GitHub](https://github.com/voltagent/awesome-design-md)
- [img2threejs on GitHub](https://github.com/img2threejs/img2threejs)
- [Archify setup guide](https://instagit.com/tt-a1i/archify/integrating-archify-with-claude-code-codex-cli-and-opencode/)
