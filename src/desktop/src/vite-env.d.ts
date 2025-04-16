/// <reference types="vite/client" />

interface ElectronAPI {
  performAction: (args: string) => Promise<string>;
  setupMasterPassword: (password: string) => Promise<string>;
  loadEncryptionKey: (password: string) => Promise<string>;
  verifyAuthorizationDataExists: () => Promise<boolean>;
}

interface Window {
  electronAPI: ElectronAPI;
}
