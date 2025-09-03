# Release & Publishing Guide

This document outlines the automated release system for the CWP Open Terminal Emulator, designed to streamline development and provide clear release channels for users. The system uses GitHub Actions to manage versioning and publishing to the npm registry.

## Overview of Release Channels

Our project utilizes a three-tier release system, each serving a different purpose and user base:

1.  **Nightly Development Release**: The most up-to-date version, automatically built and published from the `main` branch. Ideal for developers who need the absolute latest changes.
2.  **Stable Release (`@latest`)**: The official, production-ready version. This is the default release for most users.
3.  **Long-Term Support (`@lts`)**: A specific major version line that receives critical bug fixes for an extended period, providing maximum stability for large or legacy projects.

### Prerequisite: NPM Token

All workflows require a secret token to authenticate with the npm registry. This must be configured in the repository settings:

1.  Navigate to the repository's **Settings** > **Secrets and variables** > **Actions**.
2.  Create a **New repository secret**.
3.  Set the **Name** to `NPM_TOKEN`.
4.  Paste in a valid **npm access token** with "Automation" or "Publish" permissions.

---

## 1. Nightly Development Release

This workflow ensures that the latest code from the `main` branch is always available for testing.

*   **Tag on npm**: `@dev`
*   **Trigger**: Runs automatically on every `git push` to the `main` branch.
*   **Workflow file**: `.github/workflows/publish.yml`
*   **Versioning**: Generates a unique version by combining the latest version with the commit hash (e.g., `4.0.7-dev.a1b2c3d`).

### Installing the Nightly Version

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

---

## 2. Stable Release (`@latest`)

This workflow provides a controlled process for publishing official, stable releases to the public.

*   **Tag on npm**: `@latest`
*   **Trigger**: Must be run manually from the repository's "Actions" tab against the `main` branch.
*   **Workflow file**: `.github/workflows/release.yml`
*   **Versioning**: Asks for a `patch`, `minor`, or `major` bump. It then automatically increments the version, creates a Git tag (e.g., `v4.1.0`), and pushes the changes back to `main`.

### How to Publish a Stable Release

1.  Ensure the `main` branch is up-to-date and ready for release.
2.  Navigate to the **Actions** tab and select the **"Release Stable Version"** workflow.
3.  Click **"Run workflow"**, choose the version bump, and run the action.

---

## 3. Long-Term Support (LTS) Release

The LTS channel is for providing critical bug fixes to a previous major version, without introducing new features or breaking changes.

*   **Tag on npm**: `@lts`
*   **Trigger**: Must be run manually from the "Actions" tab against a dedicated LTS branch (e.g., `release/v4`).
*   **Workflow file**: `.github/workflows/lts-release.yml`
*   **Versioning**: Automatically performs a `patch` bump on the current version of the LTS branch.

### How to Manage and Publish an LTS Release

**A. Setting up a new LTS Branch:**

When a new MAJOR version is released (e.g., `v5.0.0`), the previous major line (v4) can become an LTS line.

1.  From the `main` branch at the point of the last v4 release, create a new branch:
    ```bash
    git checkout -b release/v4 <last_v4_commit_hash>
    git push origin release/v4
    ```

**B. Backporting a Bug Fix:**

1.  First, commit the bug fix to the `main` branch as usual.
2.  Switch to the LTS branch: `git checkout release/v4`.
3.  Use `git cherry-pick <commit_hash_of_fix>` to apply just that fix to the LTS branch.
4.  Push the cherry-picked commit: `git push`.

**C. Publishing the LTS Patch:**

1.  Navigate to the **Actions** tab and select the **"Release LTS Version"** workflow.
2.  Click the **"Run workflow"** dropdown.
3.  **Crucially, select the correct LTS branch** (e.g., `release/v4`) from the branch dropdown.
4.  Run the workflow. It will publish the new patch (e.g., `v4.1.9`) to npm with the `@lts` tag.

### Installing the LTS Version

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
```
