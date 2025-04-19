# Private Key Manager

Private Key Manager is a secure and efficient CLI tool for managing private keys. It provides features like adding, retrieving, deleting, backing up, and restoring keys securely.

## Features

### CLI Features
- **Add Key**: Add a new private key securely.
- **List Keys**: List all stored private keys.
- **Get Key**: Retrieve a specific private key.
- **Delete Key**: Delete a stored private key.
- **Backup Keys**: Backup all stored private keys to a local file or cloud storage.
- **Restore Keys**: Restore private keys from a backup file.

## Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Install the Package
```bash
npm install -g private-key-manager
```

This will install the Private Key Manager globally, making the `pkm-cli` command available system-wide.

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
- `backup`: Backup all keys.
- `restore`: Restore keys from a backup.


## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.