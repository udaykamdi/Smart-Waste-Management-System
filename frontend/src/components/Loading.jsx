import React from 'react';

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex space-x-12" style={{ perspective: '1000px' }}>
          <div
            className="text-6xl animate-spin"
            style={{
              transformStyle: 'preserve-3d',
              animation: 'spin 2s linear infinite',
            }}
          >
            🗑️
          </div>
          <div
            className="text-6xl animate-bounce"
            style={{
              animationDelay: '0.5s',
            }}
          >
            🚚
          </div>
          <div
            className="text-6xl animate-pulse"
            style={{
              animationDelay: '1s',
            }}
          >
            ♻️
          </div>
        </div>
        <p className="mt-8 text-gray-700 text-xl font-bold animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
