import React, { useState, useEffect } from 'react';

const DeleteKey: React.FC = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await window.electronAPI.performAction(
          JSON.stringify({ action: 'listKeys' })
        );
        setKeys(JSON.parse(response));
      } catch (error) {
        setFeedback('An error occurred while fetching keys.');
        console.error(error);
      }
    };

    fetchKeys();
  }, []);

  const handleDeleteKey = async () => {
    try {
      const response = await window.electronAPI.performAction(
        JSON.stringify({ action: 'deleteKey', alias: selectedKey })
      );
      setFeedback(response);
      setKeys(keys.filter((key) => key !== selectedKey));
    } catch (error) {
      setFeedback('An error occurred while deleting the key.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Delete a Key</h2>
      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        <option value="" disabled>Select a key</option>
        {keys.map((key, index) => (
          <option key={index} value={key}>{key}</option>
        ))}
      </select>
      <button onClick={handleDeleteKey}>Delete Key</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default DeleteKey;