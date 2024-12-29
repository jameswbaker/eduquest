import React, { useState } from 'react';
import ChipsSelector from './ChipsSelector';
import RadarChartComponent from './RadarChartComponent';

function AbilityViewer() {
    const minScore = 0;
    const maxScore = 4;
    const difference = maxScore - minScore;

    // Initial data with dummy values
    const data = [
        {
            data: {
                "Focus": 1 / difference,
                "Content": 3 / difference,
                "Organization": 4 / difference,
                "Style": 2 / difference,
                "Conventions": 1 / difference,
                "Behaviors of a Writer": 2 / difference,
            },
            meta: { color: 'blue' }
        }
    ];

    // Define rubricItems dynamically (could change, for instance from props or state)
    const rubricItems = ['Focus', 'Content', 'Organization', 'Style', 'Conventions', 'Behaviors of a Writer', 'Jimmy'];

    // Filter the rubricItems to include only those that exist in the data
    const validRubricItems = rubricItems.filter(item =>
        Object.keys(data[0].data).map(k => k.toLowerCase()).includes(item.toLowerCase())
    );

    const [selectedChips, setSelectedChips] = useState([]);

    // This function updates the selected chips in the parent component
    const handleSelectedChipsChange = (chips) => {
        setSelectedChips(chips);
    };

    // Filter the data to include only the selected chips that also exist in the data
    const filteredData = data.map((entry) => ({
        data: Object.fromEntries(
            Object.entries(entry.data).filter(([key]) => 
                selectedChips.map(chip => chip.toLowerCase()).includes(key.toLowerCase()) &&
                Object.keys(entry.data).map(k => k.toLowerCase()).includes(key.toLowerCase())
            )
        ),
        meta: entry.meta
    }));

    console.log("filteredData: ", filteredData);

    // Dynamically generate captions based on selected chips that exist in the data
    const filteredCaptions = selectedChips.reduce((acc, chip) => {
        const chipKey = chip; // No need to change to lower case if data keys are consistent
        if (Object.keys(data[0].data).map(k => k.toLowerCase()).includes(chipKey.toLowerCase())) {
            // Only add captions for valid keys
            // append value to chip
            acc[chipKey] = chip + ': ' + data[0].data[chipKey] * difference + "/" + difference;
            console.log("chipKey: ", chipKey);
            console.log("data[0].data[chipKey]: ", data[0].data[chipKey]);
        }
        return acc;
    }, {});

    console.log("filteredCaptions: ", filteredCaptions);

    // Ensure data and captions are valid before rendering the RadarChart
    const isDataValid = filteredData.length > 0 && Object.keys(filteredCaptions).length > 0;

    return (
        <div>
            {/* <h1>Ability Viewer</h1> */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40%', padding: '10px' }}>
                    <h2>Jimmy Bob</h2>
                    <ChipsSelector
                        rubricItems={validRubricItems} // Pass only valid rubric items
                        onSelectedChipsChange={handleSelectedChipsChange}
                    />
                </div>
                {/* Pass the filtered data and captions to the RadarChart */}
                <div style={{padding: '10px'}}>
                    {isDataValid ? (
                        <RadarChartComponent
                            filteredCaptions={filteredCaptions}
                            filteredData={filteredData}
                            size={400}
                            style={{ width: '400px', height: '300px' + '18%' }} // Ensure consistent size
                        />
                    ) : (
                        <p style={{ width: '400px', height: '300px', paddingTop: '18%' }}>
                            Please select some chips to display data.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AbilityViewer;
