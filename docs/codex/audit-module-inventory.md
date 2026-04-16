# Module Inventory

## Root

- `src/index.ts`: runtime CLI, bootstrap, heartbeat startup, main loop
- `src/config.ts`: config load/save/default merge and `~` path resolution
- `src/types.ts`: shared type contracts across the entire project
- `src/state/schema.ts`: schema definition and migrations through version 11
- `src/state/database.ts`: database helpers for nearly every domain

## Runtime Domains

### `src/agent/`

Purpose: reasoning loop, context assembly, prompt construction, tool execution, policy enforcement.

Key files:

- `loop.ts`: main ReAct cycle plus optional orchestration bootstrap
- `tools.ts`: built-in tools and tool execution adapter
- `system-prompt.ts`: constitutions, operating rules, colony instructions, wakeup prompt
- `context.ts`: older context builder, token estimation, summarization
- `policy-engine.ts`: central rule evaluation
- `spend-tracker.ts`: financial rate windows
- `policy-rules/*.ts`: authority, command safety, financial, path, rate-limit, validation checks

Notes:

- This domain is the primary behavioral surface of the runtime.
- It is tightly coupled to types, database, Conway client, and memory.

### `src/conway/`

Purpose: Conway Cloud integration.

Key files:

- `client.ts`: sandbox, credits, files, domains, model listing
- `inference.ts`: main chat client used by the runtime
- `http-client.ts`: retries, timeouts, circuit breaker
- `credits.ts`: survival-tier utilities
- `topup.ts`: credit topup flows
- `x402.ts`: x402 and USDC balance/payment utilities

### `src/inference/`

Purpose: newer provider/routing layer on top of basic chat calls.

Key files:

- `registry.ts`: DB-backed model registry
- `router.ts`: task and survival-tier routing
- `budget.ts`: cost ceilings and budget tracking
- `provider-registry.ts`: provider configuration and model resolution
- `inference-client.ts`: unified inference abstraction for orchestration/local workers
- `types.ts`: routing matrix and model metadata defaults

Notes:

- This is a second inference layer, not a replacement of `src/conway/inference.ts`.

### `src/memory/`

Purpose: retrieval, storage, summarization, context compression, knowledge persistence.

Key files:

- `working.ts`
- `episodic.ts`
- `semantic.ts`
- `procedural.ts`
- `relationship.ts`
- `knowledge-store.ts`
- `retrieval.ts`
- `enhanced-retriever.ts`
- `ingestion.ts`
- `context-manager.ts`
- `compression-engine.ts`
- `event-stream.ts`
- `agent-context-aggregator.ts`
- `tools.ts`

Notes:

- This is one of the largest and most sophisticated domains in the repo.
- It supports both single-agent recall and colony-level context shaping.

### `src/orchestration/`

Purpose: goal planning, decomposition, worker assignment, colony messaging, task tracking, workspaces.

Key files:

- `orchestrator.ts`: execution-phase state machine
- `planner.ts`: plan generation and validation prompt
- `plan-mode.ts`: plan approval and replan control
- `task-graph.ts`: goals, tasks, dependencies, completion/failure handling
- `attention.ts`: todo attention generation
- `messaging.ts`: local DB-backed colony messaging
- `local-worker.ts`: in-process worker pool
- `health-monitor.ts`: worker health and healing actions
- `workspace.ts`: per-goal workspace helpers
- `simple-tracker.ts`: simple agent tracking and funding protocol

Notes:

- This is a major expansion beyond the original runtime framing.
- The parent agent can now act as a coordinator for local or sandboxed workers.

### `src/heartbeat/`

Purpose: scheduled background activity while the main agent sleeps.

Key files:

- `daemon.ts`: lifecycle wrapper
- `scheduler.ts`: durable scheduler with leases and history
- `tasks.ts`: built-in heartbeat tasks
- `config.ts`: heartbeat config file and DB sync
- `tick-context.ts`: per-tick resource and tier snapshot

### `src/identity/`

Purpose: chain-aware identity management and provisioning.

Key files:

- `wallet.ts`: EVM and Solana wallet generation/loading
- `chain.ts`: address validation and chain abstractions
- `provision.ts`: API key provisioning and parent registration
- `siws.ts`: signed sign-in message helpers

### `src/replication/`

Purpose: child creation and child lifecycle management.

Key files:

- `spawn.ts`: sandbox bootstrap and child startup
- `lifecycle.ts`: state transition guardrails
- `health.ts`: child health monitoring
- `constitution.ts`: constitution propagation and verification
- `genesis.ts`: genesis generation and validation
- `lineage.ts`: ancestry and pruning
- `messaging.ts`: parent-child messaging helpers
- `cleanup.ts`: sandbox cleanup

### `src/registry/`

Purpose: on-chain identity and agent discovery.

Key files:

- `erc8004.ts`: registry interactions
- `agent-card.ts`: card generation/hosting
- `discovery.ts`: agent-card retrieval and validation

### `src/social/`

Purpose: signed relay messaging between agents.

Key files:

- `client.ts`
- `protocol.ts`
- `signing.ts`
- `validation.ts`

### `src/soul/`

Purpose: evolving identity stored as `SOUL.md`.

Key files:

- `model.ts`: parse/write/default/load
- `validator.ts`: constraints and sanitization
- `reflection.ts`: reflective updates
- `tools.ts`: runtime tools for soul access and updates

### `src/self-mod/`

Purpose: controlled self-modification and upstream management.

Key files:

- `code.ts`: protected-file logic and edits
- `audit-log.ts`: modification logging and reporting
- `tools-manager.ts`: package and MCP install/remove
- `upstream.ts`: upstream repo inspection

### `src/git/`

Purpose: git-backed state tracking and exposed git tools.

Key files:

- `state-versioning.ts`
- `tools.ts`

### `src/observability/`

Purpose: structured logging, metrics, alerts, pretty sink.

Key files:

- `logger.ts`
- `metrics.ts`
- `alerts.ts`
- `pretty-sink.ts`

### `src/setup/`

Purpose: first-run setup, configure flows, prompts, defaults, model picker.

Key files:

- `wizard.ts`
- `configure.ts`
- `model-picker.ts`
- `defaults.ts`
- `environment.ts`
- `prompts.ts`
- `banner.ts`

### `src/skills/`

Purpose: parse, load, create, install, remove, and list skills.

Key files:

- `format.ts`
- `loader.ts`
- `registry.ts`

### `src/survival/`

Purpose: funding strategies, low-compute mode, resource monitoring.

Key files:

- `funding.ts`
- `low-compute.ts`
- `monitor.ts`

## Workspace Package

### `packages/cli/`

Purpose: creator-facing CLI commands for status, logs, fund, and send.

Commands:

- `status`
- `logs`
- `fund`
- `send`

Notes:

- The CLI depends on the root runtime package through workspace linking.
- The send command explicitly signs outbound relay messages.

## Operations Files

- `.github/workflows/ci.yml`: typecheck plus tests on Node 20 and 22, with timeout handling for hung Vitest processes
- `.github/workflows/release.yml`: typecheck, test, build on tag push
- `scripts/automaton.sh`: install/update and run
- `scripts/backup-restore.sh`: SQLite backup, restore, verify
- `scripts/soak-test.sh`: long-running soak test harness

## High-Coupling Hotspots

These files deserve extra care during future changes:

- `src/types.ts`
- `src/state/database.ts`
- `src/agent/tools.ts`
- `src/agent/system-prompt.ts`
- `src/agent/loop.ts`

Any SPEC, PRD, or FIX touching these files should document downstream effects in `docs/codex/`.
