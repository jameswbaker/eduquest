import { useState } from 'react';

const DropDown = ({ results }) => {
  const [selectedResults, setSelectedResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSelection = (cls) => {
    setSelectedResults((prevSelectedResults) => {
      if (prevSelectedResults.includes(cls)) {
        return prevSelectedResults.filter((selected) => selected !== cls); // Deselect if already selected
      } else {
        return [...prevSelectedResults, cls]; // Select if not already selected
      }
    });
  };

  const filteredClasses = results.filter((cls) => cls.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="dropdown">
      <button className="dropdown-btn">Assign game to class</button>
      <div className="dropdown-content">
        <input
          type="text"
          className="search-bar"
          placeholder="Search classes..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls, index) => (
            <label key={index}>
              <input
                type="checkbox"
                value={cls}
                checked={selectedResults.includes(cls)}
                onChange={() => handleSelection(cls)}
              />
              {cls}
            </label>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>
      <div className="selected-classes">
        <h4>Selected classes:</h4>
        <ul>
          {selectedResults.map((cls, index) => (
            <li key={index}>{cls}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DropDown;
