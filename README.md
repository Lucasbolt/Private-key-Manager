# Private Key Manager

Private Key Manager is a secure and efficient tool for managing private keys. It provides both a Command Line Interface (CLI) and a desktop application for managing private keys, including features like adding, retrieving, deleting, backing up, and restoring keys.

## Features

### CLI Features
- **Add Key**: Add a new private key securely.
- **List Keys**: List all stored private keys.
- **Get Key**: Retrieve a specific private key.
- **Delete Key**: Delete a stored private key.
- **Backup Keys**: Backup all stored private keys to a local file or cloud storage.
- **Restore Keys**: Restore private keys from a backup file.

### Desktop Application Features
- User-friendly React-based interface.
- Secure master password setup and vault unlocking.
- Manage private keys with the same features as the CLI.

## Installation

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Electron (for the desktop app)

### Clone the Repository
```bash
git clone https://github.com/your-repo/private-key-manager.git
cd private-key-manager
```

### Install Dependencies
```bash
npm install
```

## Usage

### CLI

#### Run the CLI
```bash
npm run start
```

#### Available Commands
- `add`: Add a new private key.
- `list`: List all stored keys.
- `get`: Retrieve a specific key.
- `delete`: Delete a stored key.
- `backup`: Backup all keys.
- `restore`: Restore keys from a backup.

### Desktop Application

#### Development Mode
```bash
cd src/desktop
npm run dev
```

#### Build the Application
```bash
npm run build
```

#### Start the Application
```bash
npm run start
```

## Configuration

The application uses environment-specific configurations. Key paths and directories are defined in `src/config.ts`.

## Testing

Run tests using Jest:
```bash
npm run test
```

## Code Structure

### CLI
- Located in `src/cli/`
- Commands are implemented in `src/cli/commands/`

### Desktop Application
- Located in `src/desktop/`
- React components are in `src/desktop/src/components/`

### Services
- Located in `src/services/`
- Includes authentication, encryption, storage, and backup services.

### Utilities
- Located in `src/utils/`
- Includes helper functions for logging, file management, and CLI feedback.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.