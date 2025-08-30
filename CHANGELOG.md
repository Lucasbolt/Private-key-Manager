## 2025-08-30
### 🚀 Features
- Refactor backup and restore commands (60d7c9c)
- Implement key export functionality and enhance backup processes (6652844)
- Enhance FastCLI option handling with value name and validation checks (5d8c1e3)
- Refactor CLI to use FastCLI for command parsing and execution (20f217f)






### 🔹 Other
- 2.0.1 (3979d51)
- fix (42c6305)
- updated readme and changelog files (667db63)
- 2.0.0 (4d9d407)
- fixed bugs (ab09097)
- added password updating feature (8e60976)
- 1.0.8 (b812fbf)
- hot fix (fb59ad7)
- 1.0.7 (4f90466)
- hot fix (9315568)
- 1.0.6 (ccb49bd)
- update (792f356)
- fixed oauth issues (ee4145a)
- 1.0.5 (cb58b78)
- hot fix (a690d87)
- 1.0.4 (70ddf54)
- hot fix (639e491)
- 1.0.3 (d1c3acc)
- update readme (fffc63e)
- 1.0.2 (c8c121a)
- patched logger error (733d4f4)
- 1.0.1 (7d2639d)
- hot fix (a8addfb)
- update readme (dc0d88a)
- hot fix (8f30c46)
- ready to publish (37d9733)
- update (853a535)
- update (a690c48)
- improve credentials handling (88b4625)
- update (500824d)
- update (a3ade0d)
- update (3bfb768)
- updated logging system (75af637)
- update (529a4a7)
- update (5060d96)
- added extra method to googleprovider class (59557fa)
- implemented google oauth and drive api integration (71f50ca)
- clean up (510faa5)
- cleaned up (07732b7)
- removed .env and node_modules (27ef7fa)
- added backup services (c59bbef)
- updated files (ee2c0b3)
- updated .gitignore (f3ccdaf)
- first commit (ea564dd)
- Initial commit (99af2d4)


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