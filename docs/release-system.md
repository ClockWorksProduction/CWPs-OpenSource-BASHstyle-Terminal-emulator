# Release & Publishing System

This project uses a four-tier automated release system powered by GitHub Actions. Each tier serves a different purpose and is published to npm under a specific dist-tag.

## Release Channels

| Channel | npm Tag | Source Branch | Trigger | Current Version |
|---|---|---|---|---|
| **Dev** | `@dev` | `main` | Every push | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/dev.svg) |
| **Nightly** | `@nightly`| `main` | Bi-weekly schedule | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/nightly.svg) |
| **Stable** | `@latest` | `main` | Manual dispatch | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/latest.svg) |
| **LTS** | `@lts` | `release/vX` | Manual dispatch | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/lts.svg) |

---

## Workflow Details

### 1. Dev (`@dev`)
- **Workflow File:** `.github/workflows/dev-release.yml`
- **Trigger:** On every push to the `main` branch.
- **Action:** Builds the project and publishes to npm with the `@dev` tag.
- **Versioning:** `(package.json version)-dev.(git-sha)` (e.g., `5.1.0-dev.a1b2c3d`).

### 2. Nightly (`@nightly`)
- **Workflow File:** `.github/workflows/nightly-release.yml`
- **Trigger:** Runs on a schedule (e.g., every two weeks).
- **Action:** Builds the project from the latest `main` branch and publishes with the `@nightly` tag.
- **Versioning:** `(package.json version)-nightly.(yyyymmdd)` (e.g., `5.1.0-nightly.20250915`).

### 3. Stable (`@latest`)
- **Workflow File:** `.github/workflows/release.yml`
- **Trigger:** Manually from the GitHub Actions tab.
- **Action:** Prompts for a version bump (major, minor, patch), runs tests, creates a GitHub Release, and publishes to npm with the `@latest` tag.
- **Versioning:** Standard SemVer (e.g., `5.1.0`).

### 4. Long-Term Support (`@lts`)
- **Workflow File:** `.github/workflows/lts-release.yml`
- **Trigger:** Manually from the GitHub Actions tab, targeting a specific `release/vX` branch.
- **Action:** Publishes critical bug fixes for a previous major version.
- **Versioning:** Patch-only SemVer (e.g., `4.5.1`).
