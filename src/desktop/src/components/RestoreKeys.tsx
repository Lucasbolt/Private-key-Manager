import React, { useState } from 'react';

const RestoreKeys: React.FC = () => {
  const [filePath, setFilePath] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleRestoreKeys = async () => {
    try {
      const response = await window.electronAPI.performAction(
        JSON.stringify({ action: 'restoreKeys', filePath })
      );
      setFeedback(response);
    } catch (error) {
      setFeedback('An error occurred while restoring keys.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Restore Keys</h2>
      <input
        type="text"
        placeholder="Enter Backup File Path"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
      />
      <button onClick={handleRestoreKeys}>Restore Keys</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default RestoreKeys;