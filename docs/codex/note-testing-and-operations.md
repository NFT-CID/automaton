# Testing And Operations Notes

## CI And Build Expectations

From `.github/workflows/ci.yml` and `.github/workflows/release.yml`:

- CI runs on Ubuntu
- Node versions targeted in CI: 20 and 22
- Package manager expected by CI: `pnpm`
- Standard gates:
  - install with frozen lockfile
  - typecheck
  - test
- CI has explicit timeout wrappers because Vitest may hang after test completion

## Local Verification Status During This Audit

Verification was limited by the current shell environment.

Observed facts:

- `node` was not available
- `pnpm` was not available
- `corepack` was not available
- `node_modules/` was not present

Result:

- I could not run `pnpm run typecheck`
- I could not run `pnpm test`
- This documentation is based on code inspection rather than executed verification

## Test Suite Shape

- Test root: `src/__tests__/`
- Test file count: 56
- Coverage config lives in `vitest.config.ts`
- Coverage thresholds:
  - statements: 60
  - branches: 50
  - functions: 55
  - lines: 60

Representative test areas:

- policy and command safety
- database behavior and transactions
- heartbeat scheduling
- inference routing and provider behavior
- memory retrieval and compression
- orchestration planning and workers
- replication lifecycle
- social messaging and signing
- soul validation and updates

## Operations Scripts

### `scripts/automaton.sh`

- POSIX shell installer
- clones or updates the repo
- enables `pnpm` through `corepack` when available
- builds and runs the runtime

### `scripts/backup-restore.sh`

- manages SQLite backup, restore, and integrity verification
- handles WAL checkpointing and companion files

### `scripts/soak-test.sh`

- long-running monitoring harness
- tracks RSS, DB growth, WAL growth, and error count
- expects Linux-like tooling

## Platform Notes

The implementation currently reads as Linux-first.

Evidence:

- many modules use `process.env.HOME || "/root"`
- sandbox commands assume `/root`
- clean scripts use `rm -rf`
- operational scripts are shell scripts
- environment detection checks Linux/container paths such as `/etc/conway/sandbox.json` and `/.dockerenv`

Implication:

- future work that claims Windows support should get its own spec or fix document in this directory
- path handling and script portability are worth treating as explicit engineering concerns, not incidental cleanup
