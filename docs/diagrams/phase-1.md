# Phase 1: database core

Who can reach what in the `lab` schema after migrations 001 and 002. Solid arrows are allowed; the dotted arrow is refused.

```mermaid
flowchart LR
  subgraph roles["Database roles (each has its own login)"]
    pub["lab_public<br/>(visitors, via the snapshot)"]
    agent["lab_agent<br/>(Site Doctor, Lead Scout)"]
    admin["lab_admin<br/>(Henry, /lab/admin)"]
  end

  subgraph views["Public views: safe columns only"]
    ps["public_state<br/>agents + latest run"]
    pe["public_events<br/>latest 50 with public_text"]
  end

  subgraph tables["Tables: RLS on, every one"]
    agents["agents"]
    runs["runs"]
    events["events"]
    sites["sites"]
    checks["site_checks"]
  end

  pub -->|read| ps
  pub -->|read| pe
  pub -.->|"permission denied"| tables

  agent -->|insert| runs
  agent -->|insert| events
  agent -->|insert| checks
  agent -->|read| agents
  agent -->|read| sites

  admin -->|read| tables
  admin -->|update| sites

  ps -. "runs as the view's owner" .-> agents
  ps -.-> runs
  pe -.-> events
```

How it's proved: `tests/db/roles.test.ts` connects as `lab_public`, lists every table in `lab` and checks that each one has RLS on and refuses it, and that both views answer. CI runs it on a throwaway Postgres 18.6 for every pull request; Henry ran it once on the Neon dev branch (4 Nov 2026).

Sites are added by `scripts/seed-sites.ts` from the git-ignored `private/sites.json`, so client names never enter the repo.
