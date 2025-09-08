# Release & Publishing Guide

This document outlines the automated release system for the CWP Open Terminal Emulator. The system uses GitHub Actions to manage versioning and publishing to the npm registry, providing clear and distinct release channels for different user needs.

## Overview of Release Channels

Our project utilizes a four-tier release system:

1.  **Dev Release (`@dev`)**: The most unstable, bleeding-edge version. A new version is published with every single commit to the `main` branch.
2.  **Nightly Release (`@nightly`)**: A stable pre-release version, published bi-weekly. This is ideal for developers who want to test upcoming features without being on the commit-by-commit bleeding edge.
3.  **Stable Release (`@latest`)**: The official, production-ready version. This is the default release for most users.
4.  **Long-Term Support (`@lts`)**: A specific major version line that only receives critical bug fixes, providing maximum stability for large or legacy projects.

### Prerequisite: NPM Token

All workflows require a secret token to authenticate with the npm registry. This must be configured in the repository settings:

1.  Navigate to the repository's **Settings** > **Secrets and variables** > **Actions**.
2.  Create a **New repository secret**.
3.  Set the **Name** to `NPM_TOKEN`.
4.  Paste in a valid **npm access token** with "Automation" or "Publish" permissions.

---

## 1. Dev Release (`@dev`)

This workflow ensures that the absolute latest code from the `main` branch is always available for immediate testing.

*   **Tag on npm**: `@dev`
*   **Trigger**: Runs automatically on every `git push` to the `main` branch.
*   **Workflow file**: `.github/workflows/dev-release.yml`
*   **Versioning**: Generates a unique version by combining the latest version with the commit hash (e.g., `5.0.1-dev.a1b2c3d`).

### Installing the Dev Version

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

---

## 2. Nightly Release (`@nightly`)

This workflow provides a regularly scheduled, more stable pre-release for testing.

*   **Tag on npm**: `@nightly`
*   **Trigger**: Runs on a schedule (bi-weekly at 03:00 UTC on the 1st and 15th of the month). It can also be triggered manually.
*   **Workflow file**: `.github/workflows/nightly-release.yml`
*   **Versioning**: Appends the release date to the current version (e.g., `5.0.1-nightly.20250905`). This provides a clear timestamp without incrementing the package version.

### Installing the Nightly Version

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@nightly
```

---

## 3. Stable Release (`@latest`)

This workflow provides a controlled process for publishing official, stable releases.

*   **Tag on npm**: `@latest`
*   **Trigger**: Must be run manually from the repository's "Actions" tab against the `main` branch.
*   **Workflow file**: `.github/workflows/release.yml`
*   **Versioning**: Asks for a `patch`, `minor`, or `major` bump. It then automatically increments the version and creates a Git tag (e.g., `v5.0.1`).

---

## 4. Long-Term Support (LTS) Release (`@lts`)

The LTS channel is for providing critical bug fixes to a previous major version.

*   **Tag on npm**: `@lts`
*   **Trigger**: Must be run manually against a dedicated LTS branch (e.g., `release/v4`).
*   **Workflow file**: `.github/workflows/lts-release.yml`
*   **Versioning**: Automatically performs a `patch` bump on the current version of the LTS branch.

### How to Manage and Publish an LTS Release

For detailed instructions on setting up LTS branches and backporting fixes, please refer to the workflow comments in the `.github/workflows/lts-release.yml` file.

### Installing the LTS Version

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
```
