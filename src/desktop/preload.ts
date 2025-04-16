import { contextBridge } from 'electron';
import * as authService from '../services/auth';
import * as storageService from '../services/storage';
import * as backupService from '../services/backup/backup';

console.log(__dirname)
try {

  contextBridge.exposeInMainWorld('electronAPI', {
    setupMasterPassword: async (password: string) => {
      return await authService.setupMasterPassword(password);
    },
    loadEncryptionKey: async (password: string) => {
      return await authService.loadEncryptionKey(password);
    },
    verifyAuthorizationDataExists: async () => {
      return await authService.verifyAuthorizationDataExists()
    },
    storeKey: async (alias: string, privateKey: string) => {
      return await storageService.storeKey('masterPassword', alias, privateKey);
    },
    getKey: async (alias: string) => {
      return await storageService.getKey('masterPassword', alias);
    },
    listKeys: async () => {
      return JSON.stringify(await storageService.listKeys());
    },
    deleteKey: async (alias: string) => {
      return await storageService.deleteKey(alias);
    },
    backupKeys: async (filePath: string) => {
      return await backupService.backupKeys('masterPassword', filePath);
    },
    restoreKeys: async (filePath: string) => {
      return await backupService.restoreKeys('masterPassword', filePath);
    },
  });
} catch (error) {
  console.error('Error exposing API:', error);
}