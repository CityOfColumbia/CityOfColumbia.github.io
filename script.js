let map
let wards = {
    'Lisa Meyer':'Ward 2', 
    'Nick Foster':'Ward 4', 
    'Valerie Carroll':'Ward 1', 
    'Roy Lovelady':'Ward 3', 
    'Donald Waterman':'Ward 5',
    'Betsy Peters':'Ward 6'
    };
let polygonManager = null;

class Markers{
    constructor(){

    }
}

class PolygonManager {
    constructor(map, geoJsonUrl, managerID) {
        this.map = map;
        this.geoJsonUrl = geoJsonUrl;
        this.infowindow = null;
        this.featureData = {};
        this.polygonsVisible = true;
        this.managerID = managerID;
        this.eventListeners = [];
        this.polygons = {};
        this.loadGeoJson();
        this.addEventListeners();
    }

    loadGeoJson() {
        this.map.data.loadGeoJson(this.geoJsonUrl, null, (features) => {
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
        this.map.data.setStyle({
            fillColor: fillColor, // Change this to your desired hex color
            fillOpacity: fillOpacity,
            strokeColor: strokeColor, // Change this to your desired hex color
            strokeWeight: strokeWeight
        });
    }

    setStyle(feature,fillColor,fillOpacity,strokeColor,strokeWeight){
        this.map.data.overrideStyle(feature, {
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight
        });
    }

    togglePolygonsVisibility() {
        this.polygonsVisible = !this.polygonsVisible;
        this.map.data.setStyle({
            visible: this.polygonsVisible
        });
    }
    togglePolygons(){
        this.map.data.forEach(function(feature) {
          const isVisible = feature.getProperty('visible');
          feature.setProperty('visible', !isVisible);
        });

        this.map.data.setStyle(function(feature) {
          return {
            fillColor: '#FFFFFF', // Change this to your desired hex color
            fillOpacity: 0,
            strokeColor: '#FFFFFF', // Change this to your desired hex color
            strokeWeight: 2,
            visible: feature.getProperty('visible')
          };
        });
      }
      addEventListeners() {
        // Add a hover listener to change the cursor

        // Listener to ensure polygons and markers turn off once the user zooms out far enough
        const zoom_change = this.map.addListener('zoom_changed', () => {
            const mapZoom = this.map.getZoom();
            if (mapZoom < 9 && this.polygonsVisible) {
                this.togglePolygons(this.map, false);
                this.polygonsVisible = false;
            } else if (mapZoom >= 9 && !this.polygonsVisible) {
                this.togglePolygons(this.map, true);
                this.polygonsVisible = true;
            }
        });

        this.eventListeners.push(zoom_change)

    }
    cleanup() {
        // Remove all event listeners and clear data
        this.eventListeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });

        this.eventListeners = [];

        this.map.data.forEach((feature) => {
            if (feature.getProperty('managerId') === this.managerId) {
                this.map.data.remove(feature);
            }
        });
        this.map.data.setStyle(null); // Reset styles
        // Additional cleanup logic if needed
    }
};

class BusinessPolygons extends PolygonManager {
    constructor(map, geoJsonUrl, polygonData,managerID) {
        super(map, geoJsonUrl, polygonData,managerID);
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
        const infoBox = this.map.data.addListener('click', (event) => {
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
            this.infowindow.open(this.map);
        });

        this.eventListeners.push(infoBox)
    }
}

class DemographicPolygons extends PolygonManager {
    constructor(map, geoJsonUrl, polygonData, managerID) {
        super(map, geoJsonUrl, managerID);
        this.csvData = polygonData;
        this.loadWardData().then(({ dataList, minMaxValues }) => {
            this.wardData = dataList;
            this.minMaxValues = minMaxValues;
            console.log("ward data:", this.wardData);
            console.log("min-max values:", this.minMaxValues);
        });
        console.log("polygons:", this.polygons)
    }

    async loadWardData() {
        const dataList = [];
        const minMaxValues = {};

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
                const rowDict = {};

                headers.forEach((header, index) => {
                    let value = values[index].replace('\r', ''); // Remove \r from the value
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
                });

                dataList.push(rowDict);
            });

            return { dataList, minMaxValues };
        } catch (error) {
            console.error('Error loading CSV data:', error);
            return { dataList: [], minMaxValues: {} };
        }
    }

    
    getColor(value, min, max) {
        // Normalize the value to a range between 0 and 1
        const normalized = (value - min) / (max - min);
        
        // Calculate the RGB components
        const r = Math.floor(255 * (1 - normalized)); // Red decreases as value increases
        const g = Math.floor(255 * (1 - normalized)); // Green decreases as value increases
        const b = Math.floor(255 * normalized);       // Blue increases as value increases
        return `rgb(${r}, ${g}, ${b})`;
    }
    
}

function createMapDefinitions(){
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 38.947907, lng: -92.323575},
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#212121' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
            { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
            { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
            { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
            { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
            { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
            { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
            { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
            { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
            { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
            { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
        ]
    });
}

//uses self.polygons, which will have multiple dictionaries of {Ward X: Feature}, potentially multiple Ward X
function setDemographicMapStyle(option){

let demographics = polygonManager.wardData;

let rgbValues = []
for(let i = 0; i<= 5; i++){
    rgbValues.push(polygonManager.getColor(demographics[i][option],polygonManager.minMaxValues[option][0],polygonManager.minMaxValues[option][1]))
}
for (let i = 1; i <= 6; i++){
    let wardString = "Ward " + i;
    for(let feature of polygonManager.polygons[wardString]){
        polygonManager.setStyle(feature,rgbValues[i-1],1,'#FFFFFF',2)
    }
}

}

function showFeatures(featureType) {

    const featureTables = document.querySelectorAll('.parent-feature-table');

    featureTables.forEach(table => {
        table.style.display = 'none';
    });

    if (polygonManager) {
        polygonManager.cleanup();
        polygonManager = null;
    }

    if (featureType === 'Business') {
        polygonManager = new BusinessPolygons(map, 'WardOutlines.geojson', 'data.csv', 'Business');
        polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
        document.getElementById('business-controls').style.display = 'block';
    }
    
    if (featureType === 'Demographic') {
        polygonManager = new DemographicPolygons(map, 'WardOutlines.geojson', 'demographics.csv', 'Demographic');
        document.getElementById('demographic-controls').style.display = 'block';
    }

}

function showTable(tableId) {
    // Hide all tables
    document.querySelectorAll('.feature-table').forEach(table => {
        table.style.display = 'none';
    });
    // Show the selected table
    document.getElementById(tableId).style.display = 'block';
}


// Usage example:
async function initMap(){
map = createMapDefinitions();

polygonManager = new BusinessPolygons(map, 'WardOutlines.geojson', 'data.csv', 'Business');
polygonManager.setAllStyle('#FFFFFF',0,'#FFFFFF',2)

};