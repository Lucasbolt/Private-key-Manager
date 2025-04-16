import React, { useState } from 'react';

const AddKey: React.FC = () => {
  const [alias, setAlias] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAddKey = async () => {
    try {
      const response = await window.electronAPI.performAction(
        JSON.stringify({ action: 'addKey', alias, privateKey })
      );
      setFeedback(response);
    } catch (error) {
      setFeedback('An error occurred while adding the key.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Add a New Key</h2>
      <input
        type="text"
        placeholder="Enter Key Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />
      <button onClick={handleAddKey}>Add Key</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default AddKey;