/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="skeleton-container" aria-label="Loading content..." role="progressbar">
      <div className="skeleton-bar" style={{ width: '100%' }}></div>
      <div className="skeleton-bar" style={{ width: '83.33%' }}></div>
      <div className="skeleton-bar" style={{ width: '100%' }}></div>
      <div className="skeleton-bar" style={{ width: '75%' }}></div>
      <div className="skeleton-bar" style={{ width: '66.66%' }}></div>
    </div>
  );
};

export default LoadingSkeleton;