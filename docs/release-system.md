# Release & Publishing Guide

This document outlines the automated release system for the CWP Open Terminal Emulator, designed to streamline both development and stable release cycles. The system uses GitHub Actions to manage versioning and publishing to the npm registry.

## Overview

Our project utilizes a dual-workflow system for releases:

1.  **Automated Development Releases**: A new development version is automatically published to npm every time code is pushed to the `main` branch.
2.  **Manual Stable Releases**: A new stable, public version is published only when manually triggered by a team member through the GitHub Actions interface.

### Prerequisite: NPM Token

Both workflows require a secret token to authenticate with the npm registry. This must be configured in the repository settings:

1.  Navigate to the repository's **Settings** > **Secrets and variables** > **Actions**.
2.  Create a **New repository secret**.
3.  Set the **Name** to `NPM_TOKEN`.
4.  Paste in a valid **npm access token** with "Automation" or "Publish" permissions.

---

## 1. Automated Development Releases

This workflow ensures that the latest code from the `main` branch is always available for testing.

### How it Works

*   **Trigger**: The workflow runs automatically on every `git push` to the `main` branch.
*   **Workflow file**: `.github/workflows/publish.yml`
*   **Versioning**: It generates a unique development version by combining the latest stable version number with the short hash of the latest commit (e.g., `4.0.7-dev.a1b2c3d`).
*   **Publishing**: The new version is published to npm with the `dev` tag.

### Installing the Development Version

To install the most recent development build for testing purposes, use the following npm command:

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

---

## 2. Manual Stable Releases

This workflow provides a controlled process for publishing official, stable releases to the public.

### How it Works

*   **Trigger**: This workflow must be run manually from the repository's "Actions" tab.
*   **Workflow file**: `.github/workflows/release.yml`
*   **Versioning**: When triggered, it asks you to choose the release type (`patch`, `minor`, or `major`). It then automatically:
    *   Increments the version in `package.json`.
    *   Creates a new Git commit with the version bump.
    *   Creates a Git tag for the new version (e.g., `v4.1.0`).
    *   Pushes the commit and tag back to the repository.
*   **Publishing**: The new, stable version is published to npm with the `latest` tag, making it the default version for anyone who runs `npm install`.

### How to Publish a Stable Release

Follow these steps to publish a new stable version:

1.  Ensure the `main` branch is up-to-date and contains all the code you want to release.
2.  Navigate to the **Actions** tab in the GitHub repository.
3.  Select the **"Release Stable Version"** workflow from the list on the left.
4.  Click the **"Run workflow"** dropdown button.
5.  In the dropdown, choose the appropriate version bump: **patch**, **minor**, or **major**, according to [Semantic Versioning](https://semver.org/) rules.
6.  Click the green **"Run workflow"** button to start the release process.

The action will handle all the steps automatically. Once it completes, the new version will be live on npm and the repository will be updated with the new version tag.
