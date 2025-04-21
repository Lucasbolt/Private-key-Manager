# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Implemented a retry strategy for `fetchRemoteCredentials` in `GoogleDriveBackup` to handle network errors with clean error messages.
- Extended the `BackupProvider` interface to include `uploadBackup` and `downloadBackup` methods.
- Dynamically fetch the latest version for the CLI `version` command using the `getLatestVersion` utility function.
- Created a utility function `getLatestVersion` in `version.ts` to read the version from `package.json`.

### Fixed
- Explicitly declared `GoogleDriveBackup` implements the `BackupProvider` interface to resolve TypeScript errors.

### Changed
- Updated the CLI `version` command to dynamically fetch the latest version.