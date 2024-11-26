import { wards, NAICS_Categories } from './definitions.js';

class markersManager {
    constructor(mapManager,latLong){
        this.mapManager = mapManager
        this.data = this.loadCSV(latLong);
        this.markerDataList = []; 
        this.allMarkers = [];
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

class BusinessMarkers extends markersManager{
    constructor(mapManager, latlong){
        super(mapManager,latlong);
    }
    createMarkers(csvData) {


        const markerIcon = {
            path: google.maps.SymbolPath.CIRCLE,  // Simple circle icon
            fillColor: "#FFFFFF",  // Light color (white) to contrast with black background
            fillOpacity: 1,  // Slight transparency to blend with the heatmap
            strokeColor: "#FF5733",  // Border matching heatmap's orangish color
            strokeWeight: 2,  // Thin border to reduce clutter
            scale: 4,  // Small size for a subtle presence (adjust for visibility)
        };

        csvData.forEach(row => {
            //console.log(csvData)
            const lat = parseFloat(row.Latitude);
            const long = parseFloat(row.Longitude);

            if (!isNaN(lat) && !isNaN(long)) {
                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: long },
                    title: typeof row.LocAcctName === 'string' ? row.LocAcctName : String(row.LocAcctName),
                    icon: markerIcon
                });

                // Store the marker in the allMarkers array (don't add it to the map yet)
                this.allMarkers.push({
                    marker: marker,
                    name: row.LocAcctName,  // Use LocAcctName instead of Name
                    lat: lat,
                    long: long,
                    address: row.Address,
                    ward: wards[row.Representative],
                    naicsCode: row.NaicsCode
                });
            }
            //console.log(this.allMarkers)
        });
        //return allMarkers;
    };
    searchMarkers() {
        const searchTerm = document.getElementById("businessSearch").value.toLowerCase().trim().replace(/[^\w\s]/gi, '');  // Get the search term
        let filteredMarkers = [];
        // Clear all previous markers from the map
        this.allMarkers.forEach(item => {
            item.marker.setMap(null);  // Remove marker from the map
        });
        if (!searchTerm) {
            console.log('Empty Search');  
        } 
        else {
        // Filter the markers based on the search term (match business name starting with the search term)
            filteredMarkers = this.allMarkers.filter(item => {
                // Ensure item.name (LocAcctName) is a valid string before calling toLowerCase
                //console.log(item)
                if (item.name && typeof item.name === 'string') {
                    const cleanedName = item.name.toLowerCase().replace(/[^\w\s]/gi, '');
                    return cleanedName.includes(searchTerm);  // Check for a match using LocAcctName
                }
                return false;  // If item.name is invalid, exclude this marker
            });
        }
        console.log(filteredMarkers)
        // Add the filtered markers to the map
        if (filteredMarkers.length > 0) {
            filteredMarkers.forEach(item => {
                //console.log(this)
                item.marker.setMap(this.mapManager.map);  // Add marker to the map

                // Optional: Add a click listener for the info window
                const contentString = `
                    <div>
                        <h3>${item.name}</h3>
                        <ul>
                            <li>Address: ${item.address}</li>
                            <li>Ward: ${item.ward}</li>
                            ${item.naicsCode ? `<li>NAICS Code: ${item.naicsCode}</li>` : ''}
                        </ul>
                    </div>
                `;

                const infoWindow = new google.maps.InfoWindow({
                    content: contentString
                });

                item.marker.addListener("click", () => {
                    infoWindow.open(item.marker.getMap(), item.marker);
                });
            });
        }
    };



    async placeOnLatLong(csvDataPromise) {
        
        const csvData = await csvDataPromise;
       //const infoWindow = new google.maps.InfoWindow();

        // Variable to hold the markers for later use
        //let allMarkers = [];
        //this.createMarkers(csvData);
        document.getElementById("searchButton").addEventListener("click", () => {
            
            this.searchMarkers();  // Call the search function when the user clicks "Search"
            this.createMarkers(csvData);
        });
                
        // Initially create all markers but don't add them to the map
        //this.createMarkers(csvData);

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

export default BusinessMarkers; 