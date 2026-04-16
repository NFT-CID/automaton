# Codex Docs

This directory is the canonical home for Codex-authored project documentation.

## What Lives Here

- Audits and architecture investigations
- Technical specifications
- PRDs
- FIX documents
- Focused implementation notes

## Naming Convention

- `audit-<topic>.md`
- `spec-<topic>.md`
- `prd-<topic>.md`
- `fix-<topic>.md`
- `note-<topic>.md`

Examples:

- `audit-project-overview.md`
- `spec-child-lifecycle-hardening.md`
- `prd-local-windows-support.md`
- `fix-path-resolution-on-windows.md`

## Authoring Rules

- Prefer facts from code over claims from older docs.
- Call out uncertainty directly.
- Include concrete file paths for important claims.
- Separate "implemented", "documented", and "not verified".
- Keep one document focused on one concern. Link related files instead of building one giant catch-all note.

## Current Index

- `audit-project-overview.md`: repository-wide architecture and findings
- `audit-module-inventory.md`: subsystem-by-subsystem code map
- `note-testing-and-operations.md`: CI, scripts, local verification status, and operational notes
