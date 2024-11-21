//import MapManager  from './MapManager.js'
import { wards, RGBAValues, DemographicHierarchy } from './definitions.js';

 export class PolygonManager {
    constructor(mapManager, wardGeoJsonUrl, managerID) {

        this.mapManager = mapManager
        this.wardGeoJsonUrl = wardGeoJsonUrl;
        this.infowindow = null;
        this.infoboxes = [];
        this.featureData = {};
        this.polygonsVisible = true;
        this.managerID = managerID;
        this.polygons = {};
        this.loadBooneCounty()
        this.loadWardGeoJson();
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

    async loadWardGeoJson() {
        this.mapManager.map.data.loadGeoJson(this.wardGeoJsonUrl, null, (features) => {
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
        this.loadWardData()
        this.addInfoBoxes();
    }

    loadWardData() {
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
        this.loadWardData().then(({ dataList,wardRankings, minMaxValues }) => {
            this.wardData = dataList;

            this.wardRankings = wardRankings
            this.minMaxValues = minMaxValues;
            this.addInfoBoxes()
            console.log("in demoPolygons, minMaxValues", this.minMaxValues)
            console.log("in demopolygons, wardrankings", this.wardRankings)

        });
    }

    async loadWardData() {
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
    
    getWardData(){
        return this.wardData
    }

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
                return
            }

            const subCategoryName = selectedDemographic.id;
            const selectedSubCategory = document.querySelector(`input[name="${subCategoryName}"]:checked`);
            const featureInfo = this.wardData[wards[featureName]] || {};
            const demographicData = featureInfo[selectedSubCategory.id] || {};
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
    

                content += `
                        <tr>
                            <td>${selectedSubCategory.id.toLocaleString()}</td>
                            <td>${demographicData.toLocaleString()}</td>
                        </tr>`;
            
    
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
        this.mapManager.eventListeners.addListener(infoBox);
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
    
    getColor(rank,option){
        // console.log("in get color: option, Demohierachy[option], RGBAValues[DemographicHierarchy[option]][rank - 1], rank-1 " , option, DemographicHierarchy[option], RGBAValues[DemographicHierarchy[option]][rank - 1], rank -1)
        return RGBAValues[DemographicHierarchy[option]][rank - 1]
    }
}




