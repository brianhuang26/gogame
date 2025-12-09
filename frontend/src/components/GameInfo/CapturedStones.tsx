import React from 'react';

interface CapturedStonesProps {
  count: number;
  color: 'black' | 'white'; // The color of the stones that were captured
}

export const CapturedStones: React.FC<CapturedStonesProps> = ({ count, color }) => {
  // We display the stones that were captured.
  // If Black captured White stones, we show White stones.
  // If White captured Black stones, we show Black stones.
  
  const stoneColor = color === 'black' ? '#000' : '#fff';
  const borderColor = color === 'white' ? '#ccc' : 'transparent';
  const textColor = '#666';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9em', color: textColor }}>
      <span>提子:</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: stoneColor,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          />
        ))}
        {count > 5 && <span style={{ marginLeft: '4px' }}>+{count - 5}</span>}
      </div>
      {count === 0 && <span>0</span>}
    </div>
  );
};
