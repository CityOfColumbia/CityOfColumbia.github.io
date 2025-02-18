// Example Data (replace with your actual data)
const data = {
    1: { 
        race: { Black: 15, White: 75, Asian: 5 }, 
        age: { child: 20, adult: 80 },
        sex: { male: 50, female: 50 },
        total: 20795 
    },
    2: { 
        race: { Black: 20, White: 70, Asian: 10 }, 
        age: { child: 25, adult: 75 },
        sex: { male: 55, female: 45 },
        total: 17912 
    },
    // Add data for other wards here
};

// Function to calculate percentage
function calculatePercentage(data, category, total) {
    return (data[category] / total) * 100;
}

// Function to assign color based on percentage
function getColorByPercentage(percentage) {
    if (percentage >= 75) {
        return '#FF0000'; // Dark Red
    } else if (percentage >= 50) {
        return '#FF7F00'; // Orange
    } else if (percentage >= 25) {
        return '#FFFF00'; // Yellow
    } else {
        return '#00FF00'; // Green
    }
}

// Function to update map and legend when category changes
function updateMapData(category) {
    // Clear previous styles and labels
    clearMapStyles();

    const wards = Object.keys(data);
    wards.forEach((wardId) => {
        const wardData = data[wardId];
        const total = wardData.total;

        // Calculate percentage based on the selected category
        const percentage = calculatePercentage(wardData[category], category, total);

        // Get color based on the percentage
        const wardColor = getColorByPercentage(percentage);

        // Apply color to ward polygon (assuming you have a method to get the ward layer)
        const wardLayer = mapManager.getWardLayer(wardId);
        wardLayer.setStyle({
            fillColor: wardColor,
            color: '#000000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        });

        // Add a label with the percentage (or any other info) to the ward
        const label = `${wardId}: ${Math.round(percentage)}% ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        wardLayer.bindTooltip(label, { permanent: true, direction: 'center' }).openTooltip();
    });

    // Update the legend based on selected category
    updateLegend(category);
}

// Function to update the legend based on selected category
function updateLegend(category) {
    const raceLegend = document.getElementById('race-legend');
    const ageLegend = document.getElementById('age-legend');
    const sexLegend = document.getElementById('sex-legend');

    // Hide all legend sections initially
    raceLegend.style.display = 'none';
    ageLegend.style.display = 'none';
    sexLegend.style.display = 'none';

    // Update the corresponding legend section based on the category
    if (category === 'race') {
        raceLegend.style.display = 'block';
        raceLegend.innerHTML = `
            <div style="background-color: #FF0000; height: 20px; width: 100%;">&nbsp;</div> 75% and above
            <div style="background-color: #FF7F00; height: 20px; width: 100%;">&nbsp;</div> 50% to 74%
            <div style="background-color: #FFFF00; height: 20px; width: 100%;">&nbsp;</div> 25% to 49%
            <div style="background-color: #00FF00; height: 20px; width: 100%;">&nbsp;</div> Below 25%
        `;
    } else if (category === 'age') {
        ageLegend.style.display = 'block';
        ageLegend.innerHTML = `
            <div style="background-color: #FF0000; height: 20px; width: 100%;">&nbsp;</div> High percentage of children
            <div style="background-color: #FFFF00; height: 20px; width: 100%;">&nbsp;</div> High percentage of adults
        `;
    } else if (category === 'sex') {
        sexLegend.style.display = 'block';
        sexLegend.innerHTML = `
            <div style="background-color: #FF0000; height: 20px; width: 100%;">&nbsp;</div> Male Majority
            <div style="background-color: #00FF00; height: 20px; width: 100%;">&nbsp;</div> Female Majority
        `;
    }
}

// Function to clear previous map styles and labels
function clearMapStyles() {
    const wards = Object.keys(data);
    wards.forEach((wardId) => {
        const wardLayer = mapManager.getWardLayer(wardId);
        wardLayer.setStyle({
            fillColor: '#FFFFFF', // Default white color
            color: '#000000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        });
        wardLayer.unbindTooltip(); // Remove previous tooltip
    });
}

export default updateMapData;