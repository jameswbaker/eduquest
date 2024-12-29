// ChipsSelector Component
import React, { useState } from 'react';
import { Chip } from '@mui/material';

function ChipsSelector({ rubricItems, onSelectedChipsChange }) {
  const [selectedChips, setSelectedChips] = useState([]);
  const chips = rubricItems;

  const handleChipClick = (chip) => {
    let newSelectedChips;
    if (selectedChips.includes(chip)) {
      // Deselect chip
      newSelectedChips = selectedChips.filter((c) => c !== chip);
    } else {
      // Select chip
      newSelectedChips = [...selectedChips, chip];
    }
    setSelectedChips(newSelectedChips);
    
    // Pass the updated selected chips to the parent component
    onSelectedChipsChange(newSelectedChips);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h5>Select Stats</h5>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {chips.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            color={selectedChips.includes(chip) ? 'primary' : 'default'}
            onClick={() => handleChipClick(chip)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
      {/* <h5>Selected Chips</h5>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {selectedChips.length > 0 ? (
          selectedChips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              color="secondary"
              onDelete={() => handleChipClick(chip)}
            />
          ))
        ) : (
          <p>No chips selected.</p>
        )}
      </div> */}
    </div>
  );
}

export default ChipsSelector;
