//import MapManager  from './MapManager.js'
import { wards, RGBAValues, DemographicHierarchy } from './definitions.js';

 export class PolygonManager {
    constructor(mapManager, GeoJsonUrl, managerID, htmlManager ) {

        this.mapManager = mapManager
        this.htmlManager = htmlManager
        this.GeoJsonUrl = GeoJsonUrl;
        this.infowindow = null;
        this.infoboxes = [];
        this.featureData = {};
        this.polygonsVisible = true;
        this.managerID = managerID;
        this.polygons = {};
        this.loadBooneCounty()
       
    }
    

    async loadBooneCounty() {
        this.mapManager.map.data.loadGeoJson('Boone-County_MO.geojson', null, (features) => {
            features.forEach((feature) => {
                feature.setProperty('visible', true);
                let countyName = 'Boone County';
                if (!this.polygons[countyName]) {
                    this.polygons[countyName] = [];
                }
                this.polygons[countyName].push(feature);
            });
        });
    }



    setAllStyle(fillColor,fillOpacity,strokeColor,strokeWeight) {
        this.mapManager.map.data.setStyle({
            fillColor: fillColor, // Change this to your desired hex color
            fillOpacity: fillOpacity,
            strokeColor: strokeColor, // Change this to your desired hex color
            strokeWeight: strokeWeight
        });
    }

    setStyle(feature,fillColor,fillOpacity,strokeColor,strokeWeight){
        this.mapManager.map.data.overrideStyle(feature, {
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight
        });
    }

    togglePolygonsVisibility() {
        this.polygonsVisible = !this.polygonsVisible;
        this.mapManager.map.data.setStyle({
            visible: this.polygonsVisible
        });
    }
    togglePolygons(){
        this.mapManager.map.data.forEach(function(feature) {
          const isVisible = feature.getProperty('visible');
          feature.setProperty('visible', !isVisible);
        });

        this.mapManager.map.data.setStyle(function(feature) {
          return {
            fillColor: '#FFFFFF', // Change this to your desired hex color
            fillOpacity: 0,
            strokeColor: '#FFFFFF', // Change this to your desired hex color
            strokeWeight: 2,
            visible: feature.getProperty('visible')
          };
        });
      }
      
    cleanup() {
        // Remove all event listeners and clear data
        // this.eventListeners.forEach(listener => {
        //     this.map.event.removeListener(listener);
        // });

        this.eventListeners = [];

        this.mapManager.map.data.forEach((feature) => {
            if (feature.getProperty('managerId') === this.managerId) {
                this.mapManager.map.data.remove(feature);
            }
        });
        this.mapManager.map.data.setStyle(null); // Reset styles
        // Additional cleanup logic if needed
    }
};

export class BusinessPolygons extends PolygonManager {
    constructor(mapManager, geoJsonUrl, polygonData,managerID) {
        super(mapManager, geoJsonUrl, polygonData,managerID);
        this.infowindow = null; // Define infowindow as a property of the class
        this.csvUrl = polygonData;
        this.loadWardGeoJson();
        this.loadPolygonData()
        this.addInfoBoxes();
    }
    async loadWardGeoJson() {
        this.mapManager.map.data.loadGeoJson(this.GeoJsonUrl, null, (features) => {
            features.forEach((feature) => {
                feature.setProperty('visible', true);
                let wardName = wards[feature.getProperty('Name')];
                if (!this.polygons[wardName]) {
                    this.polygons[wardName] = [];
                }
                this.polygons[wardName].push(feature);
            });
        });
    }
    loadPolygonData() {
        fetch(this.csvUrl)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n');
                const headers = rows[0].split(',');
                rows.slice(1).forEach(row => {
                    const values = row.split(',');
                    const name = values[0];
                    this.featureData[name] = {};
                    headers.forEach((header, index) => {
                        let value = values[index];
                        let parsedValue = parseFloat(value);
                        if (Number.isInteger(parsedValue)) {
                            value = '$' + parsedValue.toLocaleString(); // Format the number with commas
                        }
                        this.featureData[name][header] = value;
                    });
                });
            });
    }

    addInfoBoxes() {
        const infoBox = this.mapManager.map.data.addListener('click', (event) => {
            const featureName = event.feature.getProperty('Name');

            // Check if the feature's name is in the targetNames array
            if (!(featureName in wards)) {
                return; // Exit the function if the feature's name is not in the list
            }

            if (this.infowindow) {
                this.infowindow.close();
            }

            const featureInfo = this.featureData[featureName] || {};
            const geometry = event.feature.getGeometry();
            const bounds = new google.maps.LatLngBounds();
            geometry.forEachLatLng((latlng) => {
                bounds.extend(latlng);
            });

            const center = bounds.getCenter();

            let content = `
                <title>Feature Info Table</title>
                <style>
                    #infoTable {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    #infoTable th, #infoTable td {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                    #infoTable th {
                        background-color: #f2f2f2;
                        text-align: left;
                    }
                </style>
                <table id="infoTable">
                <caption style="font-weight: bold">${wards[featureName]}</caption>
                    <tbody>`;

            for (const [property, value] of Object.entries(featureInfo)) {
                content += `
                        <tr>
                            <td>${property}</td>
                            <td>${value ? value : 'N/A'}</td>
                        </tr>`;
            }

            content += `
                    </tbody>
                </table>`;

            this.infowindow = new google.maps.InfoWindow({
                content: content,
                position: center,
                disableAutoPan: true
            });
            this.infowindow.open(this.mapManager.map);
        });

        this.mapManager.eventListeners.addListener(infoBox)
        this.infoboxes.push(infoBox)
    }
}

export class DemographicPolygons extends PolygonManager {
    
    constructor(map, geoJsonUrl, polygonData, managerID) {
        
        super(map, geoJsonUrl, managerID);
        this.csvData = polygonData;
        this.loadWardGeoJson();

        this.loadPolygonData().then(({ dataList,wardRankings, minMaxValues }) => {
            this.wardData = dataList;

            this.wardRankings = wardRankings
            this.minMaxValues = minMaxValues;
            //this.setDemographicMapStyle('Total Population')
            this.addInfoBoxes()
            this.addAllToggleListeners()

        });
    }
    async loadWardGeoJson() {
        this.mapManager.map.data.loadGeoJson(this.GeoJsonUrl, null, (features) => {
            features.forEach((feature) => {
                feature.setProperty('visible', true);
                let wardName = wards[feature.getProperty('Name')];
                if (!this.polygons[wardName]) {
                    this.polygons[wardName] = [];
                }
                this.polygons[wardName].push(feature);
            });
        });
    }
    async loadPolygonData() {
        const dataList = {};
        const minMaxValues = {};
        const wardRankings = {};
    
        try {
            const response = await fetch(this.csvData);
            const csvText = await response.text();
            const rows = csvText.split('\n');
            const headers = rows[0].split(',');
    
            // Initialize minMaxValues with Infinity and -Infinity
            headers.forEach(header => {
                minMaxValues[header.trim()] = [Infinity, -Infinity];
            });
    
            rows.slice(1).forEach(row => {
                const values = row.split(',');
                const ward = "Ward " + values[headers.indexOf('Ward')].trim(); // Get the Ward value and trim any extra spaces
    
                if (ward !== "Ward All") { // Skip "Ward All"
                    const rowDict = {};
                    headers.forEach((header, index) => {
                        if (header.trim() !== 'Ward') {
                            let value = values[index]; // Remove \r from the value
                            rowDict[header.trim()] = Number(value); // Trim header to remove any extra spaces
    
                            // Update min and max values
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                                if (numValue < minMaxValues[header.trim()][0]) {
                                    minMaxValues[header.trim()][0] = numValue;
                                }
                                if (numValue > minMaxValues[header.trim()][1]) {
                                    minMaxValues[header.trim()][1] = numValue;
                                }
                            }
                        }
                    });
    
                    if (!dataList[ward]) {
                        dataList[ward] = {};
                    }
                    dataList[ward] = rowDict;
                }
            });
    
            // Calculate ranks for each demographic
            headers.forEach(header => {
                if (header.trim() !== 'Ward') {
                    const demographicValues = [];
                    for (const ward in dataList) {
                        demographicValues.push({ ward, value: dataList[ward][header.trim()] });
                    }
                    demographicValues.sort((a, b) => b.value - a.value); // Sort in descending order
    
                    demographicValues.forEach((item, index) => {
                        if (!wardRankings[item.ward]) {
                            wardRankings[item.ward] = {};
                        }
                        wardRankings[item.ward][header.trim()] = index + 1; // Rank starts from 1
                    });
                }
            });
    
            console.log("Ward Rankings:", wardRankings);
            return { dataList, wardRankings, minMaxValues };
        } catch (error) {
            console.error('Error loading CSV data:', error);
            return { dataList: {}, wardRankings: {}, minMaxValues: {} };
        }
    }
    
/*     setDemographicMapStyle(option){
        console.log("In polygon manager, option", option)

        let demographics = this.mapManager.polygonManager.wardData;
        let rgbValues = []
        for(let i = 0; i<= 5; i++){
            console.log("In polygon manager, ", this.wardRankings["Ward " + (i + 1)][option])
            rgbValues.push(this.getColor(this.wardRankings["Ward " + (i + 1)][option],option))
        
            // rgbValues.push(mapManager.polygonManager.getColor(demographics["Ward " + (i + 1)][option],mapManager.polygonManager.minMaxValues[option][0],mapManager.polygonManager.minMaxValues[option][1]))
        }
        
        for (let i = 1; i <= 6; i++){
            let wardString = "Ward " + i;
            for(let feature of this.polygons[wardString]){
                this.setStyle(feature,rgbValues[i-1],1,'#FFFFFF',2)
            }
        }
        
        }

    getWardData(){
        return this.wardData
    } */

        addInfoBoxes() {
            const infoBox = this.mapManager.map.data.addListener('click', (event) => {
                // Check if data is loaded
                const featureName = event.feature.getProperty('Name');
        
                // Check if the feature's name is in the targetNames array
                if (!(featureName in wards)) {
                    return; // Exit the function if the feature's name is not in the list
                }
        
                if (this.infowindow) {
                    this.infowindow.close();
                }
        
                // Get the selected demographic category
                const selectedDemographic = document.querySelector('input[name="demographic"]:checked');
                if (!selectedDemographic) {
                    return;
                }
        
                const subCategoryName = selectedDemographic.id;
        
                // Determine the subcategory to use
                let selectedSubCategoryId = 'Total Population'; // Default to "Total Population" for "All"
                if (subCategoryName !== 'all') {
                    const selectedSubCategory = document.querySelector(`input[name="${subCategoryName}"]:checked`);
                    if (selectedSubCategory) {
                        selectedSubCategoryId = selectedSubCategory.id;
                    } else {
                        return; // Exit if no specific subcategory is selected and "All" is not chosen
                    }
                }
        
                // Retrieve feature information
                const featureInfo = this.wardData[wards[featureName]] || {};
                const demographicData = featureInfo[selectedSubCategoryId] || {};
                const geometry = event.feature.getGeometry();
                const bounds = new google.maps.LatLngBounds();
                geometry.forEachLatLng((latlng) => {
                    bounds.extend(latlng);
                });
        
                const center = bounds.getCenter();
        
                // Construct content for the infobox
                let content = `
                    <title>Feature Info Table</title>
                    <style>
                        #infoTable {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        #infoTable th, #infoTable td {
                            border: 1px solid #ddd;
                            padding: 8px;
                        }
                        #infoTable th {
                            background-color: #f2f2f2;
                            text-align: left;
                        }
                    </style>
                    <table id="infoTable">
                    <caption style="font-weight: bold">${wards[featureName]}</caption>
                        <tbody>`;
        
                content += `
                        <tr>
                            <td>${selectedSubCategoryId.toLocaleString()}</td>
                            <td>${demographicData.toLocaleString()}</td>
                        </tr>`;
        
                content += `
                        </tbody>
                    </table>`;
        
                // Create and open the InfoWindow
                this.infowindow = new google.maps.InfoWindow({
                    content: content,
                    position: center,
                    disableAutoPan: true
                });
                this.infowindow.open(this.mapManager.map);
            });
        
            this.mapManager.eventListeners.addListener(infoBox);
    
            // Function to add event listeners to elements by name
            const addCloseListeners = (name) => {
                const elements = document.getElementsByName(name);
                elements.forEach(element => {
                    element.addEventListener('click', () => {
                        if (this.infowindow) {
                            this.infowindow.close();
                        }
                    });
                });
            };
    
            // Add event listeners to elements with the names "demographic", "race", "sex", and "age"
            addCloseListeners('demographic');
            addCloseListeners('race');
            addCloseListeners('sex');
            addCloseListeners('age');
        }
    
    
    

    addAllToggleListeners() {
        const tableUpdateListener = this.mapManager.map.data.addListener('click', (event) => {
            // Check if data is loaded
            const featureName = event.feature.getProperty('Name');
    
            // Check if the feature's name is in the targetNames array
            if (!(featureName in wards)) {
                return; // Exit the function if the feature's name is not in the list
            }
    
            // Retrieve feature information
            const featureInfo = this.wardData[wards[featureName]] || {};
    
            // Update the title of the data container
            const tableTitle = document.querySelector('#table-title');
            if (tableTitle) {
                tableTitle.textContent = `${wards[featureName]}`;
            }
    
            // Clear the data table before populating it
            this.mapManager.htmlManager.clearTable();
    
            // Populate the data table with category and value pairs
            for (const [category, value] of Object.entries(featureInfo)) {
                this.mapManager.htmlManager.addRow(category, value);
            }
    
            // Show the data container table
            window.mapManager.htmlManager.showFeatureTable('data-container');
        });
    
        // Add the listener to the map manager for cleanup
        this.mapManager.eventListeners.addAllListener(tableUpdateListener);
    }
    
    
    
    
    

    //this getColor function is depricated
//     getColor(value, min, max) { 
//         // Normalize the value to a range between 0 and 1
//         const normalized = (value - min) / (max - min);
        
//         // Calculate the gradient components
//         const r = 255; // Red remains 255
//         const g = Math.floor(255 * (1 - normalized)); // Green decreases as value increases
//         const b = 0; // Blue remains 0
        
//         // Ensure alpha is between 0.3 and 0.8
//         const a = .8; // Adjusted to fit your range
        
//         return `rgba(${r}, ${g}, ${b}, ${a})`;
//     }

//DEPRICATED , Use this one if you want to have options between the demographics
// getColor(rank,option){
//         return RGBAValues[DemographicHierarchy[option]][rank - 1]
//     }
    
    getColor(rank){
        // console.log("in get color: option, Demohierachy[option], RGBAValues[DemographicHierarchy[option]][rank - 1], rank-1 " , option, DemographicHierarchy[option], RGBAValues[DemographicHierarchy[option]][rank - 1], rank -1)
        return RGBAValues[rank - 1]
    }
}


export class TractPolygons extends PolygonManager {
    constructor(map, geoJsonUrl, polygonData, managerID) {
        super(map, geoJsonUrl, managerID);
        this.loadBlockGeoJson();
        this.csvData = polygonData;
        this.dataList = {};
        this.infoWindow = new google.maps.InfoWindow(); // Create InfoWindow instance
        this.polygonListeners = []; // Track polygon event listeners
        console.log("Constructing BlockPolygons!");

        this.loadPolygonData().then(dataList => {
            this.dataList = dataList;
        });



    }
    async loadBlockGeoJson() {
        this.mapManager.map.data.loadGeoJson(this.GeoJsonUrl, null, (features) => {
            features.forEach((feature) => {
                feature.setProperty('visible', true);
                let Name = feature.getProperty('GEOID10');
                if (!this.polygons[Name]) {
                    this.polygons[Name] = [];
                }
                this.polygons[Name].push(feature);
    
                // Add a click listener to each polygon and track it
                const clickListener = this.mapManager.map.data.addListener('click', (event) => {
                    this.showInfoBox(event, feature);
                });
    
                // Store the listener in the array for later cleanup
                this.polygonListeners.push(clickListener);
            });
        });
    }
    

    async loadPolygonData() {
        const dataList = {};
        const minMaxValues = {};
    
        try {
            const response = await fetch(this.csvData);
            const csvText = await response.text();
            const rows = csvText.split('\n');
            const headers = rows[0].split(',');

            // Initialize minMaxValues with Infinity and -Infinity
            headers.forEach(header => {
                if (header.trim() !== 'GEOID10') {
                    minMaxValues[header.trim()] = { Minimum: Infinity, Maximum: -Infinity };
                }
            });

            rows.slice(1).forEach(row => {
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!values) return;

                const geoidIndex = headers.indexOf('GEOID10');
                if (geoidIndex === -1 || !values[geoidIndex]) {
                    return;
                }
                const geoid = values[geoidIndex].replace(/"/g, '').trim();

                const rowDict = {};
                headers.forEach((header, index) => {
                    if (header.trim() !== 'GEOID10' && values[index] !== undefined) {
                        let value = values[index].replace(/"/g, '').trim();
                        rowDict[header.trim()] = value;

                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            if (numValue < minMaxValues[header.trim()].Minimum) {
                                minMaxValues[header.trim()].Minimum = numValue;
                            }
                            if (numValue > minMaxValues[header.trim()].Maximum) {
                                minMaxValues[header.trim()].Maximum = numValue;
                            }
                        }
                    }
                });

                dataList[geoid] = rowDict;
               
            });

            dataList['MinMax'] = minMaxValues;
            return dataList;
        } catch (error) {
            console.error('Error loading CSV data:', error);
            return { dataList: {}, minMaxValues: {} };
        }
    }

    showInfoBox(event, feature) {
        const geoid = event.feature.getProperty('GEOID10');
        const polygonData = this.dataList[geoid];
        //console.log("showinfobox event:",geoid, event.feature.getProperty('GEOID10')); // From loadPolygonData

        if (polygonData) {
            const demographicData = `
                <ul>
                    <li><strong>Total Population:</strong> ${polygonData['Total:']}</li>
                    <li><strong>Male Population:</strong> ${polygonData['Male:']}</li>
                    <li><strong>Female Population:</strong> ${polygonData['Female:']}</li>
                </ul>
            `;
    
            const ageData = `
                <ul>
                    ${Object.entries(polygonData)
                        .filter(([key]) => key.match(/\byears\b|\bover\b/))
                        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                        .join('')}
                </ul>
            `;
    
            const geographyData = `
                <ul>
                    <li><strong>Name:</strong> ${polygonData['Name']}</li>
                    <li><strong>Block Group:</strong> ${polygonData['Block Group']}</li>
                    <li><strong>Census Tract:</strong> ${polygonData['Census Tract']}</li>
                    <li><strong>County:</strong> ${polygonData['County']}</li>
                    <li><strong>State:</strong> ${polygonData['State']}</li>
                    <li><strong>Ward:</strong> ${polygonData['Ward']}</li>
                </ul>
            `;
    
            // Combine content sections
            const content = `
                <div>
                    <h3>Tract: ${geoid}</h3>
                    <h4>Geography</h4>
                    ${geographyData}
                    <h4>Demographics</h4>
                    ${demographicData}
                    <h4>Age Distribution</h4>
                    ${ageData}
                </div>
            `;
    
            // Set content and open the InfoWindow
            this.infoWindow.setContent(content);
            this.infoWindow.setPosition(event.latLng); // Show at clicked location
            this.infoWindow.open(this.mapManager.map);


        } else {
            console.warn(`No data found for GEOID: ${geoid}`);
        }
    }
    cleanup() {
        // Close InfoWindow
        if (this.infoWindow) {
            this.infoWindow.close();
        }
    
        // Remove all features and event listeners
        this.mapManager.map.data.forEach((feature) => {
            this.mapManager.map.data.remove(feature);
        });
    
        // Clear the list of polygon event listeners
        this.polygonListeners.forEach(listener => google.maps.event.removeListener(listener));
        this.polygonListeners = [];
    }
    
    
}
