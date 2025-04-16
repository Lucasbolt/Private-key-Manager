import React, { useState, useEffect } from 'react';

const GetKey: React.FC = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [retrievedKey, setRetrievedKey] = useState('');
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

  const handleGetKey = async () => {
    try {
      const response = await window.electronAPI.performAction(
        JSON.stringify({ action: 'getKey', alias: selectedKey })
      );
      setRetrievedKey(response);
    } catch (error) {
      setFeedback('An error occurred while retrieving the key.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Retrieve a Key</h2>
      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
      >
        <option value="" disabled>Select a key</option>
        {keys.map((key, index) => (
          <option key={index} value={key}>{key}</option>
        ))}
      </select>
      <button onClick={handleGetKey}>Get Key</button>
      {retrievedKey && <p>Retrieved Key: {retrievedKey}</p>}
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default GetKey;