import { wards, NAICS_Categories } from './definitions.js';

class markersManager {
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

class BusinessMarkers extends markersManager{
    constructor(mapManager, latlong){
        super(mapManager,latlong);
    }

    async placeOnLatLong(csvDataPromise) {
        const csvData = await csvDataPromise;
        const infoWindow = new google.maps.InfoWindow();
        const markerIcon = {
            path: google.maps.SymbolPath.CIRCLE,  // Simple circle icon
            fillColor: "#FFFFFF",  // Light color (white) to contrast with black background
            fillOpacity: 0.7,  // Slight transparency to blend with the heatmap
            strokeColor: "#FF5733",  // Border matching heatmap's orangish color
            strokeWeight: 1,  // Thin border to reduce clutter
            scale: 2,  // Small size for a subtle presence (adjust for visibility)
        };

        csvData.forEach(row => {
            const keys = ["Marker","Name","Ward","Naics","Business Type","isVisible","Lat","Long"]
            const values = []
            const lat = parseFloat(row.Latitude);
            const long = parseFloat(row.Longitude);

            let numberPart;

    
            if (!isNaN(lat) && !isNaN(long)) {
                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: long },
                    map: this.mapManager.map,
                    icon: markerIcon,
                    title: typeof row.LocAcctName === 'string' ? row.LocAcctName : String(row.LocAcctName)
                });

                values.push(marker,row.LocAcctName, wards[row.Representative])

                 if (row.NaicsCode) {
                    numberPart= row.NaicsCode
                    values.push(numberPart, null, true, lat, long)
                } else {
                    values.push(null,null, true, lat, long)

                }

                this.markerDataList.push(this.addMarkerData(keys,values));
    
                // Add click listener to each marker
                marker.addListener("click", () => {
                    const numberPart = row.NaicsCode ? row.NaicsCode : '';
                    const category = row.NaicsCode ? NAICS_Categories[String(row.NaicsCode).substring(0, 2)] : 'N/A';
                    const descriptionPart = row.descriptionPart ? row.descriptionPart : '';
                
                    const contentString = `
                        <div>
                            <h3>${row.LocAcctName}</h3>
                            <ul>
                                <li>Address: ${row.Address}</li>
                                <li>Ward: ${wards[row.Representative]}</li>
                                ${row.NaicsCode ? `<li>NAICS Code: ${numberPart}</li>` : ''}
                                <li>Category: ${category}</li>
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

export default BusinessMarkers; 