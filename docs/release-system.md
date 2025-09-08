# Release & Publishing Guide

This document outlines the automated release system for the CWP Open Terminal Emulator. The system uses GitHub Actions to manage versioning and publishing to the npm registry, providing clear and distinct release channels for different user needs.

## Release Channels Overview

Our project utilizes a four-tier release system. The following table provides a quick summary of each channel:

| Channel | npm Tag | Source Branch | Trigger | Versioning Example |
|---|---|---|---|---|
| **Dev** | `@dev` | `main` | Every push | `5.0.1-dev.a1b2c3d` |
| **Nightly** | `@nightly`| `main` | Bi-weekly schedule | `5.0.1-nightly.20250905` |
| **Stable** | `@latest` | `main` | Manual dispatch | `5.1.0` |
| **LTS** | `@lts` | `release/vX` | Manual dispatch | `4.5.1` (Patch only) |

### Prerequisite: NPM Token

All publishing workflows require a secret token to authenticate with the npm registry. This must be configured in the repository settings:

1.  Navigate to the repository's **Settings** > **Secrets and variables** > **Actions**.
2.  Create a **New repository secret**.
3.  Set the **Name** to `NPM_TOKEN`.
4.  Paste in a valid **npm access token** with "Automation" or "Publish" permissions.

---

## 1. Dev Release (`@dev`)

This workflow ensures that the absolute latest code from the `main` branch is always available for immediate testing.

*   **Use Case**: Ideal for contributors who need to test their changes immediately after they are merged.
*   **Trigger**: Runs automatically on every `git push` to the `main` branch.
*   **Workflow**: `.github/workflows/dev-release.yml`
*   **Versioning**: Generates a unique version by combining the latest version with the commit hash (e.g., `5.0.1-dev.a1b2c3d`).

**To install the dev version:**
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

---

## 2. Nightly Release (`@nightly`)

This workflow provides a regularly scheduled, more stable pre-release for developers who want to test upcoming features.

*   **Use Case**: For developers who want to test new features on a regular cadence without being on the commit-by-commit bleeding edge.
*   **Trigger**: Runs on a schedule (bi-weekly at 03:00 UTC on the 1st and 15th of the month). It can also be triggered manually.
*   **Workflow**: `.github/workflows/nightly-release.yml`
*   **Versioning**: Appends the release date to the current version (e.g., `5.0.1-nightly.20250905`).

**To install the nightly version:**
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@nightly
```

---

## 3. Stable Release (`@latest`)

This is the official, production-ready version intended for most users.

*   **Use Case**: General-purpose, stable use.
*   **Trigger**: Must be run manually from the repository's "Actions" tab against the `main` branch. This is a deliberate action to ensure releases are controlled.
*   **Workflow**: `.github/workflows/release.yml`
*   **Versioning**: Prompts for a `patch`, `minor`, or `major` version bump according to Semantic Versioning. It then increments the version and creates a Git tag (e.g., `v5.1.0`).

**To install the stable version:**
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@latest
```

---

## 4. Long-Term Support (LTS) Release (`@lts`)

The LTS channel provides critical bug fixes to a previous major version for users who require maximum stability.

*   **Use Case**: For large or legacy projects that cannot upgrade to the latest major version but still need critical bug fixes.
*   **Trigger**: Must be run manually against a dedicated LTS branch (e.g., `release/v4`).
*   **Workflow**: `.github/workflows/lts-release.yml`
*   **Versioning**: Automatically performs a `patch` bump on the current version of the LTS branch.

**To install the LTS version:**
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
```
