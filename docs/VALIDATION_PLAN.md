# Validation plan: checking the plan with people outside it

Everything else in these docs is checked by tests or by reading primary sources. These questions can only be answered by talking to people. Do them during the two-week break, in parallel with building.

## How to ask: the Mom Test

The Mom Test (from Rob Fitzpatrick's book of the same name) is a way of asking questions so people can't just be polite to you. Three rules:

1. **Ask about their life, not your idea.** Not "Would you use this?" but "How did you hire your last junior developer?"
2. **Ask about specific past events, not opinions about the future.** "What happened last time?" beats "Would you ever…?"
3. **Talk less, listen more.** Don't pitch Agent Lab until the end, if at all.

**Bad signals** (compliments, "sounds cool", "I'd definitely use that") are worth nothing. **Good signals** are facts about the past, money or time already spent, and a next step they offer you (an intro, a referral, a follow-up call).

Write notes within an hour of each conversation, in `docs/validation/` (git-ignored; it holds names).

---

## Conversation A · Recruiters (3 people)

**Who:** recruiters who place developers or support/solutions engineers in Bangkok or remote APAC. LinkedIn search: "technical recruiter Bangkok", or agency recruiters behind postings like J8 and J9 in ROLES_MATRIX.md.

**Ask:** "I'm a developer moving into tech in Bangkok and trying to understand how hiring works. Could I ask you 5 questions in a 15-minute call or by message?"

**Questions:**
1. Think of the last junior or mid-level candidate you placed in a technical role. What made them stand out from the others?
2. When you look at a candidate with no formal tech job yet, what do you actually look at first? What do you skip?
3. Tell me about a time a portfolio project helped someone get an interview. Or a time it didn't help.
4. For roles that ask for Thai, how often do they hire someone without it? What happened the last time?
5. For roles that ask for X years of experience, what has counted as experience in practice? Does freelance work count?
6. (Last, only if there's time) Here's a 60-second look at something I built. What would a hiring manager ask me about it?

**What would change the plan:**
- If 2 or 3 say projects don't matter without paid experience → freelance work moves up in priority (still pending the lawyer).
- If they say Thai is a hard filter for most Bangkok roles → focus on remote APAC roles (J1, J3, J5, J6) and say so in ROLES_MATRIX.
- If they mention a skill the matrix missed → add it to the matrix (not as a new feature).

---

## Conversation B · Small businesses (3–5 people)

**Important:** these are learning conversations, not sales. Don't offer work, prices or a pitch, because pitches are on hold until the lawyer confirms your status. If someone asks to hire you, say you'll follow up and note it.

**Who:** owners or managers of small businesses in the segments you plan to test. People you already know, or Memory Matters' contacts, are fine.

**Questions:**
1. Tell me about your website. Who made it, and when was it last changed?
2. When did something last go wrong with it? What happened, and how did you find out?
3. What did you do about it? What did that cost in time or money?
4. Have you ever paid anyone to work on it? How did you find them? What made you pick them?
5. Has anyone ever cold-emailed you offering website work? What did you do with that email?
6. Think about the last time you paid for something for the business that cost more than a few hundred dollars. Who else had to agree? What did you need to see before you said yes?
7. What made that decision feel safe? What were you worried could go wrong?
8. Have you ever said no to someone offering a service you actually needed? What made you say no?
9. (Last) If you got a short, honest report on what's wrong with your site, what would make you trust it, and what would make you delete it?

**What would change the plan:**
- If most never noticed their site broke → Site Doctor-style monitoring is a real selling point for client work.
- If most delete cold emails unread → the pitch format changes (referral-first through Memory Matters), not the agent.
- If they mention a problem Lead Scout doesn't check → note it for after full launch. No new features before then.
- Questions 6–8 fill in the segment's offer sheet in `docs/OFFERS.md` (Move 1): who decides, who else approves, what feels safe, what risk they avoid. Two or more people in a segment naming the same worry is a pattern worth building the offer around; one is an anecdote.

---

## Lawyer

The questions are personal, so they live in `private/LAWYER_QUESTIONS.md`, which is git-ignored and never committed. In short, the answers decide when `pitches_enabled` can be turned on and how LinkedIn and /lab are worded.

---

## Senior developer review

**Who:** a developer with 5+ years of experience. A former colleague, someone from a local meetup, or a mentor community. Send them the repo link and ARCHITECTURE.md; ask for 30–45 minutes.

**Questions:**
1. Read ARCHITECTURE.md and the ADRs. Which decision would you have made differently, and why?
2. Look at THREAT_MODEL.md. What attack or failure did I miss?
3. Is the hand-written agent loop (ADR-0001) a strength in an interview, or would you rather see a framework?
4. Are the eval thresholds in EVALS.md reasonable for a first version? What would you measure instead?
5. Looking at the code from Phase 1–3, what would you flag in a code review?
6. If you were hiring for a junior or support engineer role, what would you ask me about this project?
7. What should I cut?

**What would change the plan:** anything they flag in the threat model gets a row; anything they'd cut gets compared with ROLES_MATRIX before cutting.
