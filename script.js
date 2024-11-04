//TODO: I think revamping how the map is passed to the managers. We could just have the mapManager pass this.map to them instead of needing to call the functions with mapManager.map

let mapManager
let htmlManager
let wards = {
    'Lisa Meyer':'Ward 2', 
    'Nick Foster':'Ward 4', 
    'Valerie Carroll':'Ward 1', 
    'Roy Lovelady':'Ward 3', 
    'Donald Waterman':'Ward 5',
    'Betsy Peters':'Ward 6'
};




function showFeatures(featureType) { //TODO: Clean up this function
    const featureTables = document.querySelectorAll('.parent-feature-table');

    featureTables.forEach(table => {
        table.style.display = 'none';
        // Reset form elements
        const inputs = table.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'radio' ) {
                input.checked = false;
            } else if (input.type === 'checkbox') {

                input.checked = true


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

    mapManager.cleanup();

    if (featureType === 'Business') {
        mapManager.createMap('WardOutlines.geojson','data.csv','ADDRESSES_WITH_WARD_LAT_LONG.csv','Business');
        mapManager.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
        document.getElementById('business-controls').style.display = 'block';
    }
    
    if (featureType === 'Demographic') {
        if(!mapManager.poly)
            mapManager.createMap('WardOutlines.geojson', 'demographics.csv', null, 'Demographic');
        document.getElementById('demographic-controls').style.display = 'block';
        mapManager.addZoomOutListeners();
    }
}

class HTMLManager {
  
    constructor() { 
        this.constructed = true;
        this.currentTableId = null;
    }

    showTable(tableId) {
        // Hide all tables and set inputs to false if they were previously selected
        document.querySelectorAll('.feature-table').forEach(table => {
            if (table.style.display !== 'none') {
                this.setInputsFalse(table.querySelectorAll('input'));
            }
            table.style.display = 'none';
        });
        // Show the selected table
        document.getElementById(tableId).style.display = 'block';
        this.currentTableId = tableId;
    }

    setInputsFalse(inputs){
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            }
        });
    }

}


class EventListenerManager {
    
    constructor(mapManager){
        this.eventListeners = [];


    }

    addListener(listener){
        this.eventListeners.push(listener)
    }


    showListeners(){
        console.log("Event Listeners!", this.eventListeners)
    }


    cleanup() {
        this.eventListeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });
        this.eventListeners = [];
    }

}
    


class MapManager {

    constructor(){
        this.hasMarkerSet = {
            'Business':true,
            'Demographic':false
        }
        this.polygonManagerTypes = {
            'Business':BusinessPolygons,
            'Demographic':DemographicPolygons
        };

        this.markerManagerTypes = {
            'Business':BusinessMarkers
        }

        this.map = this.createMapDefinitions();
        this.eventListeners = null;
        this.polygonManager = null;
        this.markerManager = null;
        this.heatMapZooms = {   
            1:5,
            2:5,
            3:5,
            4:5,
            5:5,
            6:8,
            7:10,
            8:20,
            9:30,
            10:30,
            11:30,
            12:40,
            13:40,
            14:40,
            15:40,
            16:40,
            17:40,
            18:40,
            19:40,
            20:40,
            21:40,
            22:40
        };
    }

    createEventListenerManager(){
        this.eventListeners = new EventListenerManager(this)
    }

    createPolygonManager(geoJson, data, managerID){
        const returnPolygonManager = this.polygonManagerTypes[managerID];
        this.polygonManager = new returnPolygonManager(this,geoJson,data,managerID)
    }

    createMarkerManager(latLong,managerID){
        const returnMarkerManager = this.markerManagerTypes[managerID]
        this.markerManager = new returnMarkerManager(this,latLong)
    }

    createMapDefinitions(){
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

    addZoomOutListeners() {
        // Add a hover listener to change the cursor
        // Listener to ensure polygons and markers turn off once the user zooms out far enough
        const zoom_change = this.map.addListener('zoom_changed', () => {
        
            const mapZoom = this.map.getZoom();

            if (mapZoom < 9 && this.polygonManager.polygonsVisible) {
                this.polygonManager.togglePolygons(this.map, false);
                this.polygonManager.polygonsVisible = false;
                this.markerManager.toggleMarkersOff()

            } else if (mapZoom >= 9 && !this.polygonManager.polygonsVisible) {
                
                this.polygonManager.togglePolygons(this.map, true);
                this.polygonManager.polygonsVisible = true;
                this.markerManager.toggleMarkersOn();
                
            }

        });

        this.eventListeners.addListener(zoom_change);


    }
    
    placeHeatMap(){  //TODO: Change the heatmap layer to its own class. this should be possible, but this needed to be finished for presentation

    const heatmapData = [];

    this.markerManager.markerDataList.forEach(row => {
        var lat = parseFloat(row["Lat"]);
        var lng = parseFloat(row["Long"]);
        if (!isNaN(lat) && !isNaN(lng)) {
            var latLng = new google.maps.LatLng(lat, lng);
            heatmapData.push(latLng);
        }
    });

    this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ],
        radius: this.getRadius(this.map.getZoom()),
        opacity: 1
    });

    this.heatmap.setMap(this.map);
    const heatmapZoomListener = this.map.addListener('zoom_changed', () => {
        this.heatmap.set('radius', this.getRadius(this.map.getZoom()));

    });
    this.eventListeners.addListener(heatmapZoomListener)
}

    getRadius(zoom){

        return this.heatMapZooms[zoom]

    }

    async createMap(geoJson, polygonData,markerData, mapID){

        this.createEventListenerManager();
        this.createPolygonManager(geoJson, polygonData,mapID);
        this.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);

        if(this.hasMarkerSet[mapID] == true){
            this.createMarkerManager(markerData,mapID);
            await this.markerManager.placeOnLatLong(mapManager.markerManager.data);
            this.placeHeatMap()
        }

        this.addZoomOutListeners();

    }



    cleanup(){
        // this.eventListeners.forEach(listener => {
        //     console.log("listener:", listener)
        //     this.map.event.removeListener(listener);
        // });
        if(this.eventListeners){
        this.eventListeners.cleanup();}


        if(this.polygonManager){
        this.polygonManager.cleanup();}
        this.polygonManager = null;
        
        if(this.markerManager){
        this.markerManager.cleanup();}
        this.markerManager = null;
        
        if(this.heatmap){
        this.heatmap.setMap(null);}
        this.heatmap = null;
    }


}


class MarkersManager {
    constructor(mapManager,latLong){
        this.mapManager = mapManager
        this.data = this.loadCSV(latLong);
        this.markerDataList = []; //TODO: rename this list to something more intuitive, like markers

    }

    async loadCSV(url){
        const response = await fetch(url);
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true
        }).data;
    
        // Filter out any undefined entries
        const filteredData = parsedData.filter(row => row !== undefined);
        return filteredData;
    }

    toggleMarkersOff() {
        this.markerDataList.forEach(markerDict => {
            if (markerDict.isVisible == true) {
                markerDict.isVisible = false;
                markerDict.Marker.setMap(null);
            }
        });
    }

    toggleMarkersOn() {

        this.markerDataList.forEach(markerDict => {
            if (markerDict.isVisible == false) {
                markerDict.isVisible = true;
                markerDict.Marker.setMap(this.mapManager.map);
            }
        });
    }

    toggleGroup(group) {

        if (marker_groups[group]) {

            // Toggle the visibility state
            groupVisibility[group] = !groupVisibility[group]

            marker_groups[group].forEach(marker => {

                if (groupVisibility[group]) {
                    marker.setMap(this.mapManager.map); // Show marker


                } else {
                    marker.setMap(null); // Hide marker
                }

            });

        }
    }

    addMarkerData(keys, values){

        let returnMarkerDict = {};

        if(keys.length == values.length){

            for(let i = 0; i < keys.length; i++){

                returnMarkerDict[keys[i]] = values[i];

            }

        } else {
            console.log("Keys and Values not 1 to 1 for marker data creation");
        };
        return returnMarkerDict;
    }

    cleanup(){

        this.markerDataList.forEach(markerData => {
            markerData["Marker"].setMap(null);

        });

        this.markerDataList = []
    }

    testfunc(){
        console.log("List of Markers!:", this.markerDataList)
    }
}

class BusinessMarkers extends MarkersManager{
    constructor(mapManager, latlong){
        super(mapManager,latlong);
    }

    async placeOnLatLong(csvDataPromise) {
        const csvData = await csvDataPromise;
        const infoWindow = new google.maps.InfoWindow();
        const markerIcon = {
            url: "https://www.svgrepo.com/download/325321/keyframe.svg",
            scaledSize: new google.maps.Size(10, 10) // Adjust the size as needed
        };
    

        csvData.forEach(row => {
            const keys = ["Marker","Name","Ward","Naics","Business Type","isVisible","Lat","Long"]
            const values = []
            const lat = parseFloat(row.Latitude);
            const long = parseFloat(row.Longitude);

            let numberPart, descriptionPart;
            
    
            if (!isNaN(lat) && !isNaN(long)) {
                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: long },
                    map: this.mapManager.map,
                    icon: markerIcon,
                    title: row.LocAcctName
                });

                values.push(marker,row.LocAcctName, wards[row.Representative])

                 if (row.NaicsCode) {
                    [numberPart, descriptionPart] = row.NaicsCode.split(' - ');
                    values.push(numberPart, descriptionPart, true, lat, long)
                } else {
                    values.push(null,null, true, lat, long)

                }

                this.markerDataList.push(this.addMarkerData(keys,values));
    
                // Add click listener to each marker
                marker.addListener("click", () => {
                    const contentString = `
                        <div>
                            <h3>${row.LocAcctName}</h3>
                            <ul>
                                <li>Address: ${row.Address}</li>
                                <li>Ward: ${wards[row.Representative]}</li>
                                ${row.NaicsCode ? `<li>Business Type: ${descriptionPart}</li><li>NAICS Code: ${numberPart}</li>` : ''}
                            </ul>
                        </div>
                    `;
                    infoWindow.close();
                    infoWindow.setContent(contentString);
                    infoWindow.open(marker.getMap(), marker);
                });
            }
        });
    }

    toggleGroup(key,group) {
     
        this.markerDataList.forEach(marker =>{

            if(marker[key] == group){

                if(marker['isVisible'] == true){

                    marker['isVisible'] = !marker['isVisible']
                    marker['Marker'].setMap(null)

                }

                else if(marker['isVisible'] == false){

                    marker['isVisible'] = !marker['isVisible']
                    marker['Marker'].setMap(this.mapManager.map)

                }

            }

        })
        
    }

    toggleAll() {
        let toggle = document.getElementById("all").checked;
        const featureTables = document.querySelectorAll('.parent-feature-table');
    
        featureTables.forEach(table => {
            // Reset form elements
            const inputs = table.querySelectorAll('input');
            inputs.forEach(input => {

            if (input.type === 'checkbox') {
                    input.checked = toggle;
                }
            });
        });
    
        this.markerDataList.forEach(marker => {
            marker["isVisible"] = toggle;
            marker["Marker"].setMap(toggle ? this.mapManager.map : null);
        });
    }
    


    showMarkers(){
        console.log(this.markerDataList)
    }
}



class PolygonManager {
    constructor(mapManager, geoJsonUrl, managerID) {
        this.mapManager = mapManager
        this.geoJsonUrl = geoJsonUrl;
        this.infowindow = null;
        this.featureData = {};
        this.polygonsVisible = true;
        this.managerID = managerID;
        this.polygons = {};
        this.loadGeoJson();
    }

    async loadGeoJson() {
        this.mapManager.map.data.loadGeoJson(this.geoJsonUrl, null, (features) => {
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

class BusinessPolygons extends PolygonManager {
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
    }
}

class DemographicPolygons extends PolygonManager {
    constructor(map, geoJsonUrl, polygonData, managerID) {
        super(map, geoJsonUrl, managerID);
        this.csvData = polygonData;
        this.loadWardData().then(({ dataList, minMaxValues }) => {
            this.wardData = dataList;
            this.minMaxValues = minMaxValues;

        });
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
        
        // Calculate the blue gradient components
        const r = 0; // Red remains 0
        const g = 0; // Green decreases as value increases
        let b = Math.floor(255 * normalized); // Blue increases as value increases
        
        // Ensure b is never lower than 155
        b = Math.max(b, 65);
        
        // Ensure alpha is between 0.3 and 0.8
        const a = 0.4 + (0.5 * normalized); // Alpha increases from 0.3 to 0.8
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    
    
} 

//uses self.polygons, which will have multiple dictionaries of {Ward X: Feature}, potentially multiple Ward X
function setDemographicMapStyle(option){

let demographics = mapManager.polygonManager.wardData;

let rgbValues = []
for(let i = 0; i<= 5; i++){
    console.log("Ward ", i)
    console.log("Demographics!", demographics)
    rgbValues.push(mapManager.polygonManager.getColor(demographics[i][option],mapManager.polygonManager.minMaxValues[option][0],mapManager.polygonManager.minMaxValues[option][1]))
}
for (let i = 1; i <= 6; i++){
    let wardString = "Ward " + i;
    for(let feature of mapManager.polygonManager.polygons[wardString]){
        mapManager.polygonManager.setStyle(feature,rgbValues[i-1],1,'#FFFFFF',2)
    }
}

}

// Usage example:
async function initMap(){
    mapManager = new MapManager();
    htmlManager = new HTMLManager();
    mapManager.createMap("WardOutlines.geojson","data.csv","ADDRESSES_WITH_WARD_LAT_LONG.csv","Business")

};
