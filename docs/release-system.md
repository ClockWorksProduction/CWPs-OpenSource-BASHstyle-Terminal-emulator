# Release & Publishing System

This project uses a four-tier automated release system powered by GitHub Actions. The version number in `package.json` on the `main` branch serves as the single source of truth for the upcoming Stable release.

All pre-release channels (Dev, Nightly, LTS) are derived from this base version at build time and do not create commits in the repository.

## Release Channels

| Channel | npm Tag | Source Branch | Trigger | Version Format | Current Version |
|---|---|---|---|---|---|
| **Dev** | `@dev` | `main` | Every push | `{base-version}-dev.{git-sha}` | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/dev.svg) |
| **Nightly** | `@nightly`| `main` | Scheduled | `{base-version}-nightly.{yyyymmdd}` | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/nightly.svg) |
| **Stable** | `@latest` | `main` | Manual | `{base-version}` | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/latest.svg) |
| **LTS** | `@lts` | `main`| Manual | `{base-version}-lts.{yyyymm}` | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/lts.svg) |

---

## Workflow Details

### 1. Dev (`@dev`)
- **Workflow File:** `.github/workflows/dev-release.yml`
- **Trigger:** On every push to the `main` branch.
- **Action:** Appends the `-dev.{git-sha}` suffix to the base version at build time and publishes to npm.

### 2. Bi-Weekly (`@nightly`)
- **Workflow File:** `.github/workflows/nightly-release.yml`
- **Trigger:** Runs on a bi-weekly schedule from the `main` branch.
- **Action:** Appends the `-bwk.{yyyymmdd}` suffix to the base version at build time and publishes to npm.

### 3. Stable (`@latest`)
- **Workflow File:** `.github/workflows/release.yml`
- **Trigger:** Manually from the GitHub Actions tab on the `main` branch.
- **Action:** Publishes the exact version from `package.json` to npm and creates a full GitHub Release.

### 4. Long-Term Support (`@lts`)
- **Workflow File:** `.github/workflows/lts-release.yml`
- **Trigger:** Manually from the GitHub Actions tab on the `main` branch.
- **Action:** Appends the `-lts.{yyyymm}` suffix to the base version at build time and publishes to npm as a pre-release.
