import React, { useState, useEffect } from 'react';

const ListKeys: React.FC = () => {
  const [keys, setKeys] = useState<string[]>([]);
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

  return (
    <div>
      <h2>Stored Keys</h2>
      {feedback && <p>{feedback}</p>}
      <ul>
        {keys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListKeys;