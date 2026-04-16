# Project Audit Overview

## Scope

This audit was produced by reading the repository structure, the main runtime entrypoints, the workspace CLI, schema and database layers, major subsystem exports, operational scripts, CI configuration, and the existing top-level documentation.

## Repository Snapshot

- Root package: `@conway/automaton`
- Workspace package: `packages/cli`
- Language/runtime target: Node.js 20+, TypeScript, ESM
- Package manager of record: `pnpm`
- Additional lockfile present: `package-lock.json`
- Runtime source: 110 non-test TypeScript files
- Tests: 56 test files under `src/__tests__/`
- Approximate test call count by grep: 1478 `it(...)` or `test(...)` occurrences
- Built-in tool declarations found in `src/agent/tools.ts`: 77 distinct names

## What The Project Actually Is

The repository is not only a "single sovereign agent runtime". It is a layered autonomous-agent platform with two architectural generations living side-by-side:

1. A classic ReAct-style runtime centered on `src/agent/loop.ts`, `src/agent/system-prompt.ts`, and `src/agent/tools.ts`
2. A newer colony/orchestration stack centered on `src/orchestration/*`, `src/memory/*`, `src/inference/*`, and extra schema tables added through later migrations

The main process in `src/index.ts` boots both worlds. It always starts the runtime, database, Conway client, heartbeat, policy engine, and spend tracker. It conditionally activates orchestration features inside the agent loop when the newer schema tables exist.

## Runtime Flow

Observed boot flow from `src/index.ts`:

1. Parse CLI flags such as `--run`, `--setup`, `--configure`, `--status`, `--init`, and `--provision`
2. Load or create config via `src/config.ts`
3. Load wallet and chain identity via `src/identity/wallet.ts`
4. Open SQLite and apply schema/migrations via `src/state/database.ts`
5. Register automaton identity with Conway if needed
6. Build inference client and model registry
7. Load heartbeat config and sync it into the database
8. Load skills from disk
9. Initialize state git repo
10. Attempt a bootstrap topup
11. Start the heartbeat daemon
12. Enter the long-running `runAgentLoop(...)` cycle

Observed loop behavior from `src/agent/loop.ts`:

- Build full tool surface from built-ins plus installed tools
- Build prompt and context
- Route inference through tier-aware model selection
- Sanitize inbox and wake inputs
- Execute tools under policy control
- Persist turns, tool calls, memory, and event data
- Sleep and wake through DB-backed wake events
- Optionally bootstrap orchestration, local workers, messaging, and context compression when newer tables are present

## Major Subsystems

### Agent Runtime

Files: `src/agent/*`

- `loop.ts` is the operational center of the runtime
- `tools.ts` exposes filesystem, Conway, git, registry, survival, memory, soul, and orchestration-facing capabilities
- `system-prompt.ts` is large and behaviorally important; it now embeds orchestrator guidance, todo attention, memory/compression expectations, and upstream/self-improvement behavior
- `policy-engine.ts`, `spend-tracker.ts`, and `policy-rules/*` gate dangerous actions
- `context.ts` and the newer `memory/context-manager.ts` both participate in context assembly, which is a sign of layered evolution rather than a single clean rewrite

### Persistence

Files: `src/state/schema.ts`, `src/state/database.ts`

- SQLite is the central data backbone
- Schema version is `11`
- The database holds identity, turns, tools, heartbeat state, policy decisions, spend tracking, inbox, skills, children, registry, reputation, soul history, memory tiers, inference costs, orchestration state, event streams, knowledge store, lifecycle events, on-chain transactions, and metrics snapshots
- `src/state/database.ts` is a very large service module that centralizes CRUD logic for nearly every subsystem

### Inference

Files: `src/conway/inference.ts`, `src/inference/*`

- There are two inference layers
- The older layer wraps Conway/OpenAI-compatible chat completions for the main loop
- The newer layer adds provider registries, budget tracking, routing matrices, unified inference, and local worker support
- The coexistence is functional, but it increases conceptual load for maintainers

### Memory

Files: `src/memory/*`

- This is no longer a small helper system
- It implements working, episodic, semantic, procedural, relationship, and knowledge-store layers
- It also contains ingestion, retrieval, context assembly, compression, event streaming, and agent-context aggregation
- The memory stack is one of the largest domains in the repo

### Orchestration

Files: `src/orchestration/*`

- Adds goals, task graphs, planning, replanning, attention generation, local worker pools, messaging, health monitoring, plan mode control, and workspaces
- The system aims to let the parent agent act as a colony coordinator instead of doing all work inline
- This is a major architectural expansion beyond the README summary

### Identity, Registry, Social, Replication, Soul

- `src/identity/*`: EVM plus Solana identity support, provisioning, SIWS/SIWE-like flows
- `src/registry/*`: agent-card generation, discovery, ERC-8004 registration and lookups
- `src/social/*`: signed relay messaging
- `src/replication/*`: child spawn, constitution propagation, health, lifecycle, lineage, parent-child messaging
- `src/soul/*`: `SOUL.md` parsing, validation, history, and reflection

### Operations and Developer Surface

- Root CLI in `src/index.ts`
- Creator CLI in `packages/cli`
- POSIX shell scripts in `scripts/`
- GitHub Actions in `.github/workflows/`

## Important Findings

### 1. The top-level docs are partly stale

Examples of drift:

- `ARCHITECTURE.md` still describes schema migrations "v1 -> v8", while `src/state/schema.ts` is at version 11
- `ARCHITECTURE.md` still says "57 tools", while `src/agent/tools.ts` currently declares 77 distinct tool names
- `README.md` project structure omits major implemented areas such as `inference/`, `memory/`, `observability/`, `ollama/`, `orchestration/`, and `soul/`
- `DOCUMENTATION.md` says "Run all 897 tests", but the current repo contains 56 test files and far more than 897 `it/test` call sites by simple grep

Conclusion: the existing docs are directionally helpful, but they should not be treated as the source of truth.

### 2. The codebase has clear architectural layering, but also visible accretion

The repository appears to have grown by adding major new capabilities onto an already substantial runtime. That is not inherently bad, but it means maintainers need to understand both the original runtime model and the newer orchestration/memory/inference additions.

High-centrality files:

- `src/types.ts`
- `src/state/database.ts`
- `src/agent/tools.ts`
- `src/agent/system-prompt.ts`
- `src/agent/loop.ts`

These files carry a lot of coupling and will affect many subsystems when changed.

### 3. The project is strongly coupled to Conway-hosted infrastructure

The runtime expects Conway services for:

- sandbox operations
- credits
- model discovery
- topups
- domains
- identity registration

The project can run locally in some modes, but the product design is clearly Conway-first rather than purely local-first.

### 4. Windows support looks weak in the current implementation

Concrete indicators:

- `src/identity/wallet.ts`, `src/config.ts`, `src/soul/*`, `src/skills/*`, and other modules default heavily to `process.env.HOME || "/root"`
- `src/agent/tools.ts` and replication logic assume `/root` as the operative home inside sandboxes
- root and CLI `clean` scripts use `rm -rf`
- operational scripts are POSIX shell scripts
- environment detection checks `/etc/conway/sandbox.json` and `/.dockerenv`

Interpretation: the runtime is designed primarily for Linux or Linux-like sandboxes. Windows development is possible at the repo level, but platform behavior should be treated carefully.

### 5. Local verification was not possible in the current environment

Observed limits during this audit:

- `node` not installed in the current shell environment
- `pnpm` not installed in the current shell environment
- `corepack` not installed in the current shell environment
- `node_modules/` absent

Because of that, this audit is code-read-based rather than execution-verified.

## Recommended Maintenance Posture

Short-term:

- Treat `docs/codex/` as the canonical place for living project knowledge
- Update old top-level docs only after verifying against code
- Keep future specs and fix plans tightly linked to source files

Medium-term:

- Decide whether the newer orchestration/memory stack is now first-class or still experimental, then reflect that consistently in user-facing docs
- Reduce documentation drift around tool count, schema version, and module map
- Consider documenting platform assumptions explicitly, especially Linux versus Windows behavior
