import { useState, useEffect } from 'react';
import './App.css';
import AddKey from './components/AddKey';
import ListKeys from './components/ListKeys';
import GetKey from './components/GetKey';
import DeleteKey from './components/DeleteKey';
import BackupKeys from './components/BackupKeys';
import RestoreKeys from './components/RestoreKeys';

function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeComponent, setActiveComponent] = useState('');

  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const response = await window.electronAPI.verifyAuthorizationDataExists();
        if (!response) {
          setIsInitialized(false);
        } else {
          setIsInitialized(true);
        }
      } catch {
        setIsInitialized(false);
      }
    };
    checkInitialization();
  }, []);

  const handleSetupPassword = async () => {
    try {
      await window.electronAPI.setupMasterPassword(masterPassword);
      setFeedback('Master password set successfully!');
      setIsInitialized(true);
    } catch (error) {
      setFeedback('Failed to set master password.');
      console.error(error);
    }
  };

  const handleUnlock = async () => {
    try {
      const response = await window.electronAPI.loadEncryptionKey(masterPassword);
      if (response) {
        setFeedback('');
        setIsUnlocked(true);
      } else {
        setFeedback('Invalid password or vault not found.');
      }
    } catch (error) {
      setFeedback('An error occurred while unlocking the vault.');
      console.error(error);
    }
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AddKey':
        return <AddKey />;
      case 'ListKeys':
        return <ListKeys />;
      case 'GetKey':
        return <GetKey />;
      case 'DeleteKey':
        return <DeleteKey />;
      case 'BackupKeys':
        return <BackupKeys />;
      case 'RestoreKeys':
        return <RestoreKeys />;
      default:
        return <p>Select an action from the menu.</p>;
    }
  };

  if (!isInitialized) {
    return (
      <div className="welcome-screen">
        <h1>Set Up Master Password</h1>
        <input
          type="password"
          placeholder="Enter Master Password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button onClick={handleSetupPassword}>Set Password</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="welcome-screen">
        <h1>Welcome to Private Key Manager</h1>
        <input
          type="password"
          placeholder="Enter Master Password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button onClick={handleUnlock}>Unlock</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Private Key Manager</h1>
      <nav>
        <button onClick={() => setActiveComponent('AddKey')}>Add Key</button>
        <button onClick={() => setActiveComponent('ListKeys')}>List Keys</button>
        <button onClick={() => setActiveComponent('GetKey')}>Get Key</button>
        <button onClick={() => setActiveComponent('DeleteKey')}>Delete Key</button>
        <button onClick={() => setActiveComponent('BackupKeys')}>Backup Keys</button>
        <button onClick={() => setActiveComponent('RestoreKeys')}>Restore Keys</button>
      </nav>
      <div className="content">
        {renderComponent()}
      </div>
    </div>
  );
}

export default App;
