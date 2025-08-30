# Private Key Manager

Private Key Manager is a secure and efficient CLI tool for managing private keys. It supports essential operations such as adding, retrieving, deleting, backing up, restoring, and exporting keys. Backups can be stored locally or securely synced with supported cloud storage providers, ensuring your keys are always accessible and protected.


## Features

### CLI Features
- **Add Key**: Add a new private key securely.
- **List Keys**: List all stored private keys.
- **Get Key**: Retrieve a specific private key.
- **Delete Key**: Delete a stored private key.
- **Backup Keys**: Backup all stored private keys to a local file or cloud storage.
- **Restore Keys**: Restore private keys from a backup file.
- **Export Keys**: Export backup files securely.
- **Update Master Password**: Change the master password securely. This generates a new encryption key and re-encrypts all stored keys data in the database.

## Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Install the Package Globally
```bash
npm install -g private-key-manager
```

This will install the Private Key Manager globally, making the `pkm-cli` command available system-wide.

### Run Without Global Installation
If you prefer not to install the tool globally, you can use `npx` to run it directly:
```bash
npx private-key-manager
```

Alternatively, you can clone the repository and run the CLI locally:
```bash
git clone https://github.com/your-repo/private-key-manager.git
cd private-key-manager
npm install
node src/cli/index.js
```

## Usage

### CLI

#### Run the CLI
```bash
pkm-cli
```

#### Available Commands
- `add`: Add a new private key.
- `list`: List all stored keys.
- `get`: Retrieve a specific key.
- `delete`: Delete a stored key.
- `backup`: Backup all keys locally or to cloud storage.
- `restore`: Restore keys from a backup file.
- `export`: Export backup files securely.
- `update-password`: Update the master password securely.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.