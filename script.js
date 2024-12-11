import MapManager from './MapManager.js';
import HTMLManager from './HTMLManager.js';

console.log('script.js is loaded');

let isMapInitialized = false;  // Flag to track map initialization

window.initMap = async function () {
    console.log('initMap is loaded');
    window.mapManager = new MapManager();
    // window.htmlManager = new HTMLManager(window.mapManager);
    window.mapManager.createMap("WardOutlines.geojson", "data.csv", "addresses_with_wards_NEW.csv", "Business")
    //const checkboxes = document.querySelectorAll('business-controls input[type="checkbox"]');
    // Pass the selected checkboxes to the setInputsTrue method
    //window.mapManager.htmlManager.setInputsTrue(checkboxes);
    // Set the flag to true once the map has been initialized
    isMapInitialized = true;
};

window.safeSetDemographicStyle = safeSetDemographicStyle
window.safeToggleAll = safeToggleAll
window.safeToggleGroup = safeToggleGroup
window.demographic_toggle = safe_Set_Demographic_Page
window.showFeatures = showFeatures
// Wrap the code for the checkbox and radio buttons to ensure mapManager is ready
function safeToggleGroup(group, id) {
    if (isMapInitialized) {
        window.mapManager.markerManager.toggleGroup(group, id);
    } else {
        console.log('mapManager is not initialized yet.');
    }
}

function safeToggleAll() {
    if (isMapInitialized) {
        window.mapManager.markerManager.toggleAll();
    } else {
        console.log('mapManager is not initialized yet.');
    }
}

function setDemographicMapStyle(option){

    
    window.mapManager.htmlManager.changeText("map-legend-label", option)
    let rgbValues = []
    for(let i = 0; i<= 5; i++){
        console.log(window.mapManager.polygonManager)
        console.log("In set demographicmapstyle, ward rank and associated color ", window.mapManager.polygonManager.wardRankings["Ward " + (i + 1)][option])

        console.log("showing mapManager ward rankings",  window.mapManager.polygonManager.wardRankings["Ward " + (i + 1)] )
        rgbValues.push( window.mapManager.polygonManager.getColor( window.mapManager.polygonManager.wardRankings["Ward " + (i + 1)][option]))

        // rgbValues.push(mapManager.polygonManager.getColor(demographics["Ward " + (i + 1)][option],mapManager.polygonManager.minMaxValues[option][0],mapManager.polygonManager.minMaxValues[option][1]))
    }
    // console.log("in setDemographicMapStyle, rgba", rgbValues)
    
    for (let i = 1; i <= 6; i++){
        let wardString = "Ward " + i;
        for(let feature of  window.mapManager.polygonManager.polygons[wardString]){
            window.mapManager.polygonManager.setStyle(feature,rgbValues[i-1],1,'#FFFFFF',2)
        }
    }
    
    }


function safeSetDemographicStyle(demographic) {
    if (isMapInitialized) {
        setDemographicMapStyle(demographic); // Assuming you have a function for setting demographic style
    } else {
        console.log('mapManager is not initialized yet.');
    }
}

async function all_toggle() {
    if (!window.mapManager.polygonManager) {
        console.warn("PolygonManager not initialized yet. Aborting all_toggle.");
        return;
    }

    document.querySelectorAll('.feature-table').forEach(table => {
        if (table.style.display !== 'none') {
            window.mapManager.htmlManager.setInputsFalse(table.querySelectorAll('input'));
        }
        table.style.display = 'none';
    });
    const wardData = window.mapManager.polygonManager.wardData;
    const wards = window.mapManager.polygonManager.wardRankings; // Assuming wardRankings contains mapping
    console.log(wardData)
    if (!wardData) {
        console.error('Ward data is not available.');
        return;
    }
    const wardName = 'Ward 1';


    const featureInfo = wardData[wardName] || {};
    const tableTitle = document.querySelector('#table-title');
    if (tableTitle) {
        tableTitle.textContent = wardName;
    }

    window.mapManager.htmlManager.clearTable();
    for (const [category, value] of Object.entries(featureInfo)) {
        window.mapManager.htmlManager.addRow(category, value);
    }
    window.mapManager.htmlManager.showFeatureTable('data-container');

    safeSetDemographicStyle("Total Population");
    window.mapManager.polygonManager.addAllToggleListeners();
}

function demographic_toggle_features(option){
    // window.mapManager.htmlManager.hideTable(window.mapManager.htmlManager.currentTableId)
    window.mapManager.htmlManager.showFeatureTable(option)

}

function safe_Set_Demographic_Page(option) {
    if (isMapInitialized) {

        // Close all open infoboxes
        window.mapManager.closeAllInfoBoxes();
        
        if (option == 'all') {
            // window.mapManager.htmlManager.hideTable(window.mapManager.htmlManager.currentTableId)
            all_toggle();
        } else {
            console.log("Not all")
            window.mapManager.eventListeners.cleanupAllListeners();
            document.querySelector('#table-title').textContent = "Data Table";
            const tableBody = document.querySelector('#data-table tbody');
            if (tableBody) {
                tableBody.innerHTML = ''; // Removes all rows from the table body
            }
            window.mapManager.htmlManager.hideTable('data-container');
            demographic_toggle_features(option);
        }
    }
}

async function showFeatures(featureType) {
    const featureTables = document.querySelectorAll('.parent-feature-table');

    featureTables.forEach(table => {
        table.style.display = 'none';
        // Reset form elements
        const inputs = table.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                input.checked = false;
            } else if (input.type === 'checkbox') {
                input.checked = true;
            }
        });

        const selects = table.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
    });

    const featureTables2 = document.querySelectorAll('.feature-table');

    featureTables2.forEach(table => {
        table.style.display = 'none';
        // Reset form elements
        const inputs = table.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        const selects = table.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });

        // Check all options except "All" for non-radio tables
        const checkboxes = table.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.id !== 'all') {
                checkbox.checked = true;
            }
        });
    });
    // Close any open info windows
    if (window.mapManager.polygonManager.infowindow != null) {

        window.mapManager.polygonManager.infowindow.close();
    }

    // Clean up the map (clear markers, layers, etc.)

    if (featureType === 'Business') {
        window.mapManager.cleanup();

        //this.hideTable();
        document.getElementById('business-controls').style.display = 'block';
        //Removing data on switching maps
        window.mapManager.eventListeners.cleanupAllListeners()
        // Create the Business map
        window.mapManager.createMap('WardOutlines.geojson', 'data.csv', 'addresses_with_wards_NEW.csv', 'Business');
        window.mapManager.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
        document.getElementById('data-container').style.display = 'none';
    }

    if (featureType === 'Demographic') {
        window.mapManager.cleanup();
        window.mapManager.businessMarkerManager.cleanup();
        document.getElementById("businessSearch").value = '';        
        document.getElementById('business-controls').style.display = 'none';
        document.getElementById('demographic-controls').style.display = 'block';
        document.getElementById('demo-all').checked = true
        if (!window.mapManager.polygonManager) {
            await window.mapManager.createMap('WardOutlines.geojson', 'demographics.csv', null, 'Demographic');
        }
    
        // Access wardData through window.mapManager
        const wardData = window.mapManager.polygonManager.wardData;
        const wards = window.mapManager.polygonManager.wardRankings; // Assuming wardRankings contains mapping
        console.log(wardData)
        if (!wardData) {
            console.error('Ward data is not available.');
            return;
        }
        const wardName = 'Ward 1';


        const featureInfo = wardData[wardName] || {};
        const tableTitle = document.querySelector('#table-title');
        if (tableTitle) {
            tableTitle.textContent = wardName;
        }
    
        window.mapManager.htmlManager.clearTable();
        for (const [category, value] of Object.entries(featureInfo)) {
            window.mapManager.htmlManager.addRow(category, value);
        }
        window.mapManager.htmlManager.showFeatureTable('data-container');
        safeSetDemographicStyle("Total Population");
    }
    
    if(featureType == 'Tract'){
        console.log("test")
        window.mapManager.cleanup();
        window.mapManager.eventListeners.cleanupAllListeners()
        document.getElementById("businessSearch").value = '';        
        document.getElementById('business-controls').style.display = 'none';
        window.mapManager.htmlManager.hideTable('data-container');

        if (!window.mapManager.polygonManager) {

        await window.mapManager.createMap('census_blocks.json', 'TractDataTest.csv', null, 'Tract');
        }
    }
}

// Attach event listeners when the page loads, but only call the mapManager methods when it's ready
// document.addEventListener('DOMContentLoaded', function() {
//     const wardCheckboxes = document.querySelectorAll('[id^="Ward"]');
//     wardCheckboxes.forEach((checkbox) => {
//         checkbox.addEventListener('click', function(event) {
//             const wardId = event.target.id;
//             safeToggleGroup('Ward', wardId);
//         });
//     });

//     const allCheckbox = document.getElementById('all');
//     if (allCheckbox) {
//         allCheckbox.addEventListener('click', function() {
//             safeToggleAll();
//         });
//     }

//     // Feature Toggle Radio Buttons (Demographic / Business)
//     const featureRadios = document.querySelectorAll('input[name="feature"]');
//     featureRadios.forEach((radio) => {
//         radio.addEventListener('click', function(event) {
//             const feature = event.target.value;
//             htmlManager.showFeatures(feature); // Assuming this method exists
//         });
//     });

//     // Demographic Controls (race, age, sex)
//     const demographicRadios = document.querySelectorAll('input[name="demographic"]');
//     demographicRadios.forEach((radio) => {
//         radio.addEventListener('click', function(event) {
//             const demographicId = event.target.id;
//             htmlManager.showTable(demographicId + '-controls'); // Assuming this method exists

//             // Set the demographic style for the map based on the selection
//             switch (demographicId) {
//                 case 'race':
//                     const raceRadios = document.querySelectorAll('input[name="race"]');
//                     raceRadios.forEach((radio) => {
//                         radio.addEventListener('click', function() {
//                             safeSetDemographicStyle(radio.id);
//                         });
//                     });
//                     break;
//                 case 'age':
//                     const ageRadios = document.querySelectorAll('input[name="age"]');
//                     ageRadios.forEach((radio) => {
//                         radio.addEventListener('click', function() {
//                             safeSetDemographicStyle(radio.id);
//                         });
//                     });
//                     break;
//                 case 'sex':
//                     const sexRadios = document.querySelectorAll('input[name="sex"]');
//                     sexRadios.forEach((radio) => {
//                         radio.addEventListener('click', function() {
//                             safeSetDemographicStyle(radio.id);
//                         });
//                     });
//                     break;
//             }
//         });
//     });
// });
