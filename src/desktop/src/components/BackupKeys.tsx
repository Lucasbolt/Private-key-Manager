import React, { useState } from 'react';

const BackupKeys: React.FC = () => {
  const [feedback, setFeedback] = useState('');

  const handleBackupKeys = async () => {
    try {
      const response = await window.electronAPI.performAction(
        JSON.stringify({ action: 'backupKeys' })
      );
      setFeedback(response);
    } catch (error) {
      setFeedback('An error occurred while backing up keys.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Backup Keys</h2>
      <button onClick={handleBackupKeys}>Backup Keys</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default BackupKeys;