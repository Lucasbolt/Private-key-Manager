# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dynamically fetch the latest version for the CLI `version` command using the `getLatestVersion` utility function.
- Created a utility function `getLatestVersion` in `version.ts` to read the version from `package.json`.

### Fixed
- Explicitly declared `GoogleDriveBackup` implements the `BackupProvider` interface to resolve TypeScript errors.

### Changed
- Updated the CLI `version` command to dynamically fetch the latest version.
- Made cloud backup optional in the application.

## [2.0.0] - 2025-04-29

### Added
- Master password update feature: Allows users to change their master password. Changing the password generates a new encryption key, which is used to re-encrypt all stored keys data in the database.

### Changed
- Backup data now includes the salt used in generating the encryption key for encrypting backup data. This ensures that backup data can always be restored, even if the master password is changed, as long as the user remembers the password used during the backup process.

### Breaking Changes
- The inclusion of salt in backup data is a backward-incompatible change. Backups created in previous versions (which do not include the salt) cannot be restored using this version.