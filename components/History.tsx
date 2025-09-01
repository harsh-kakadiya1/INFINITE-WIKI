/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface HistoryProps {
  history: string[];
  onHistoryClick: (topic: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, onHistoryClick }) => {
  if (history.length === 0) {
    return <div className="history-container"></div>;
  }

  return (
    <nav className="history-container" aria-label="Search history">
      <ul className="history-list">
        {history.map((topic) => (
          <li key={topic}>
            <button 
              className="history-button" 
              onClick={() => onHistoryClick(topic)}
            >
              {topic}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default History;
