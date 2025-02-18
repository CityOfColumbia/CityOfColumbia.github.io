import { wards, NAICS_Categories } from './definitions.js';

class markersManager {
    constructor(mapManager,latLong){
        this.mapManager = mapManager
        this.data = this.loadCSV(latLong);
        this.markerDataList = []; 
        this.allMarkers = [];
    }

    async loadCSV(url){
        console.log("URL to get csv from is "+url);
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

        this.allMarkers.forEach(item => {
            item.marker.setMap(null);  // Remove marker from the map
        });
    
        this.allMarkers = []
    }

    testfunc(){
        console.log("List of Markers!:", this.markerDataList)
    }
}

class BusinessMarkers extends markersManager {
    constructor(mapManager, latlong) {
        super(mapManager, latlong);
    }

    // Method to create markers from CSV data
    createMarkers(csvData) {
        const markerIcon = {
            path: "M 0,0 m -10,0 a 10,10 0 1,1 20,0 a 10,10 0 1,1 -20,0 M 0,0 l 0,30 z", // Pin shape
            fillColor: "#FFFFFF",
            fillOpacity: 1,
            strokeColor: "#0033A0",
            strokeWeight: 4,
            scale: 1, // Scaling factor for the SVG
            rotation: 350,
            anchor: new google.maps.Point(0, 0) // Adjust anchor to ensure proper placement
        };

        csvData.forEach(row => {
            const lat = parseFloat(row.Latitude);
            const long = parseFloat(row.Longitude);

            if (!isNaN(lat) && !isNaN(long)) {
                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: long },
                    title: typeof row.LocAcctName === 'string' ? row.LocAcctName : String(row.LocAcctName),
                    icon: markerIcon
                });

                this.allMarkers.push({
                    marker: marker,
                    name: row.LocAcctName,
                    lat: lat,
                    long: long,
                    address: row.Address,
                    ward: wards[row.Representative],
                    naicsCode: row.NaicsCode
                });
            }
        });
    }

    // Method to filter and show markers based on user search input
    searchMarkers() {
        const searchTerm = document.getElementById("businessSearch").value.toLowerCase().trim().replace(/[^\w\s]/gi, '');

        // Clear the dropdown before adding new suggestions
        const dropdown = document.getElementById('dropdown');
        dropdown.innerHTML = '';  // Clear any previous dropdown suggestions

        let filteredMarkers = [];
    
        // Clear all previous markers from the map
        this.allMarkers.forEach(item => {
            item.marker.setMap(null);  // Remove marker from the map
        });
    
        if (!searchTerm) {
            console.log('Empty Search');
        } else {
            // Filter the markers based on the search term (match business name starting with the search term)
            filteredMarkers = this.allMarkers.filter(item => {
                // Ensure item.name (LocAcctName) is a valid string before calling toLowerCase
                if (item.name && typeof item.name === 'string') {
                    const cleanedName = item.name.toLowerCase().replace(/[^\w\s]/gi, ''); // Cleaned name
                    return cleanedName.includes(searchTerm);  // Check for a match using LocAcctName
                }
                return false;  // If item.name is invalid (not a string), exclude this marker
            });
        }
    
        // Create a Set to track unique business-name-address combinations
        const uniqueBusinesses = new Set();

        // Display matching businesses in the dropdown (ensuring uniqueness by name and address)
        if (filteredMarkers.length > 0) {
            dropdown.style.display = 'block';  // Show the dropdown if there are matching businesses
            filteredMarkers.forEach(item => {
                const uniqueKey = `${item.name.toLowerCase().trim()}-${item.address.toLowerCase().trim()}`;  // Unique key combining name and address

                if (!uniqueBusinesses.has(uniqueKey)) {
                    uniqueBusinesses.add(uniqueKey);  // Add unique combination to the Set

                    const div = document.createElement('div');
                    div.textContent = item.name +' | Address: ' + item.address;  // Show business name
                    div.addEventListener('click', () => {
                        document.getElementById("businessSearch").value = item.name;  // Set search input to selected business name
                        this.showFilteredMarkers([item]);  // Show only the filtered marker for the selected business
                        dropdown.style.display = 'none';  // Hide the dropdown after selection
                    });
                    dropdown.appendChild(div);
                }
            });
        } else {
            dropdown.style.display = 'none';  // Hide the dropdown if no matches
        }
    }


    showFilteredMarkers(filteredMarkers) {
        // Add the filtered markers to the map
        filteredMarkers.forEach(item => {
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

    async placeOnLatLong(csvDataPromise) {
        const csvData = await csvDataPromise;

        document.getElementById("searchButton").addEventListener("click", () => {
            //this.searchMarkers();  // Call the search function when the user clicks "Search"
            this.createMarkers(csvData);
        });

        // Set up the input event listener for real-time search as the user types
        document.getElementById("businessSearch").addEventListener("input", () => {
            this.searchMarkers();  // Call the search function on each keystroke
        });

        this.createMarkers(csvData); // Initially create markers
    }



    showMarkers(){
        console.log(this.markerDataList)
    }


debouncedSearch() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
        this.searchMarkers();  // Call search after typing is complete
    }, 300); // 300ms delay to avoid making too many requests while typing
}


}


export default BusinessMarkers; 