# CODEX

This file is the entry point for Codex and human collaborators working in this repository.

## Current Snapshot

- Project type: TypeScript ESM runtime plus one workspace CLI package.
- Runtime entry point: `src/index.ts`
- Shared contracts: `src/types.ts`
- Persistence core: `src/state/schema.ts` and `src/state/database.ts`
- Production source size: 110 TypeScript files, about 32,248 lines
- Test suite size: 56 TypeScript test files, about 22,161 lines
- Tool surface: 77 distinct tool names declared in `src/agent/tools.ts`
- Database schema version: 11
- Current documentation status: useful, but partially stale relative to the codebase

## Documentation Rule

All future deep project documentation belongs in `docs/codex/*.md`.

Use these prefixes consistently:

- `audit-<topic>.md` for repository investigations and architecture reviews
- `spec-<topic>.md` for technical specifications
- `prd-<topic>.md` for product requirement documents
- `fix-<topic>.md` for bug analyses and implementation plans
- `note-<topic>.md` for smaller working notes or focused writeups

Keep `CODEX.md` short. Put detailed analysis, specs, PRDs, and FIX documents under `docs/codex/`.

## Start Here

- `docs/codex/README.md`
- `docs/codex/audit-project-overview.md`
- `docs/codex/audit-module-inventory.md`
- `docs/codex/note-testing-and-operations.md`

## Working Rules

- Verify claims against the current code, not only against `README.md`, `ARCHITECTURE.md`, or `DOCUMENTATION.md`.
- When behavior changed, document both the implemented reality and any visible documentation drift.
- Reference concrete files and modules when describing architecture.
- If build or test verification could not be executed because the environment is missing tooling, state that explicitly.
- Treat `src/types.ts`, `src/state/database.ts`, and `src/agent/tools.ts` as high-impact files because they centralize contracts, persistence, and capabilities.
