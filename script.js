let map
let wards = {
    'Lisa Meyer':'Ward 2', 
    'Nick Foster':'Ward 4', 
    'Valerie Carroll':'Ward 1', 
    'Roy Lovelady':'Ward 3', 
    'Donald Waterman':'Ward 5',
    'Betsy Peters':'Ward 6'
    };
let marker_groups = {}; // KEY:DATA -> Ward #NUMBER = [marker1 ...]
let groupVisibility = {}; // KEY:DATA
let heatMapZooms = {
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
}
// Function looks up which radius corresponds to which zoom level
function getRadius(zoom) {
    return heatMapZooms[zoom]
}

async function initMap() {
    map = createMapDefinitions()
    let data;

    data = await loadCSV('ADDRESSES_WITH_WARD_LAT_LONG.csv');
    loadWardOutlines();
    loadBooneCounty('Boone-County_MO.geojson');
    placeOnLatLong(data, map);
    placeHeatMap(data, map);
    for(group in marker_groups){
        groupVisibility[group] = true;
    }

    // Adjust the radius when the zoom level changes


    
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

function placeHeatMap(data, map) {
    var heatmapData = [];

    data.forEach(row => {
        var lat = parseFloat(row['Latitude']);
        var lng = parseFloat(row['Longitude']);
        var weight = parseFloat(row['Weight']) || 1; // Default weight to 1 if not provided
        if (!isNaN(lat) && !isNaN(lng)) {
            var latLng = new google.maps.LatLng(lat, lng);
            heatmapData.push({ location: latLng, weight: weight });
        }
    });

    console.log('Heatmap data:', heatmapData);

    var heatmap = new google.maps.visualization.HeatmapLayer({
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
        radius: getRadius(map.getZoom()),
        opacity: 1
    });

    heatmap.setMap(map);
    map.addListener('zoom_changed', function() {
        heatmap.set('radius', getRadius(map.getZoom()));

    });

}

function placeOnLatLong(csvData, map) {
    const infoWindow = new google.maps.InfoWindow();
    const markerIcon = {
        url: "https://creazilla-store.fra1.digitaloceanspaces.com/icons/3255658/square-rotated-icon-md.png",
        scaledSize: new google.maps.Size(10, 10) // Adjust the size as needed
    };

    // Group markers by "Name"
    csvData.forEach(row => {
        const lat = parseFloat(row.Latitude);
        const lng = parseFloat(row.Longitude);
        const name = row.LocAcctName;
        const group = wards[row.Representative];

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
                icon: markerIcon,
                title: name
            });

            if (!marker_groups[group]) {
                marker_groups[group] = [];
            }
            marker_groups[group].push(marker);
            // Add click listener to each marker
            marker.addListener("click", () => {
                const contentString = `
                    <div>
                        <h3>${name}</h3>
                            <li>Address: ${row.Address}</li>
                            <li>Representative: ${row.Representative}</li>
                            <li>Business Type: ${row.NaicsCode}</li>
                        </ul>
                    </div>
                `;
                infoWindow.close();
                infoWindow.setContent(contentString);
                infoWindow.open(marker.getMap(), marker);
            });
            map.addListener('zoom_changed', function(){

            })
        }
    });


}

function loadBooneCounty(GeoJson){
    map.data.loadGeoJson(GeoJson, null, function(features){
        features.forEach(function(feature) {
            feature.setProperty('visible', true);
          });
        });
}

function loadWardOutlines(GeoJson) {
    let infowindow = null;
    let featureData = {};
    let polygonsVisible = true;
    // Load CSV data
    fetch('data.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n');
            const headers = rows[0].split(',');
            rows.slice(1).forEach(row => {
                const values = row.split(',');
                const name = values[0];
                featureData[name] = {};
                headers.forEach((header, index) => {
                    let value = values[index];
                    let parsedValue = parseFloat(value);
                    if (Number.isInteger(parsedValue)) {
                        value = '$'+ parsedValue.toLocaleString(); // Format the number with commas
                    }
                    featureData[name][header] = value;
                });
            });
        });





    map.data.loadGeoJson("WardOutlines.geojson", null, function(features){
        features.forEach(function(feature) {
            feature.setProperty('visible', true);
          });
        });

    // Set the style for the polygons
    map.data.setStyle({
        fillColor: '#FFFFFF', // Change this to your desired hex color
        fillOpacity: 0,
        strokeColor: '#FFFFFF', // Change this to your desired hex color
        strokeWeight: 2
    });

    // Adds a listener to display an information table when a polygon is clicked
    map.data.addListener('click', function(event) {
        if (infowindow) {
            infowindow.close();
        }

        const featureName = event.feature.getProperty('Name');
        const featureInfo = featureData[featureName] || {};
        const geometry = event.feature.getGeometry();
        const bounds = new google.maps.LatLngBounds();
        geometry.forEachLatLng(function(latlng) {
            bounds.extend(latlng);
        });

        const center = bounds.getCenter();

        // Create custom content for the info window on each polygon
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

        infowindow = new google.maps.InfoWindow({
            content: content,
            position: center,
            disableAutoPan: true // Prevent the map from panning when the info window opens
        });
        infowindow.open(map);
    });

    // Add a hover listener to change the cursor
    map.data.addListener('mouseover', function(event) {
        map.data.overrideStyle(event.feature, { cursor: 'pointer' });
    });
    map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
    });

    //This listener is to ensure polygons and markers turn off once the user zooms out far enough
    map.addListener('zoom_changed', function() {
        const mapZoom = map.getZoom()
        if(mapZoom < 9 && polygonsVisible == true){
        togglePolygons()
        toggleMarkers()
        polygonsVisible = !polygonsVisible}
        else if(mapZoom >= 8 && polygonsVisible == false){
            togglePolygons()
            toggleMarkers()
            polygonsVisible = !polygonsVisible
        }
    });

}

//This function is used to toggle polygons on and off as the map is being zoomed out
function togglePolygons(){

        map.data.forEach(function(feature) {
          const isVisible = feature.getProperty('visible');
          console.log(isVisible)
          feature.setProperty('visible', !isVisible);
        });

        map.data.setStyle(function(feature) {
          return {
            fillColor: '#FFFFFF', // Change this to your desired hex color
            fillOpacity: 0,
            strokeColor: '#FFFFFF', // Change this to your desired hex color
            strokeWeight: 2,
            visible: feature.getProperty('visible')
          };
        });
      }

//This function is used to toggle markers on and off as the map is being zoomed out
function toggleMarkers(){
        for (let i = 1; i <= 6; i++) {
            if(document.getElementById(`Ward ${i}`).checked == true){
                toggleGroup(`Ward ${i}`)
        }
    }
}

async function loadCSV(url) {
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

//This function is used to toggle the markers for the toggle all check box
function toggleAll() {
    let allOn = true;
    for (let group in marker_groups) {
        if (!groupVisibility[group]) {
            allOn = false;
            break;
        }
    }

    for (let group in marker_groups) {
        groupVisibility[group] = !allOn;
        marker_groups[group].forEach(marker => {
            marker.setMap(groupVisibility[group] ? map : null);
        });
    }

    // Update the checkboxes
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`Ward ${i}`).checked = !allOn;
    }
    document.getElementById('all').checked = !allOn;
}

function toggleGroup(group) {
    if (marker_groups[group]) {
        // Toggle the visibility state
        groupVisibility[group] = !groupVisibility[group]
        marker_groups[group].forEach(marker => {
            if (groupVisibility[group]) {
                marker.setMap(map); // Show marker
            } else {
                marker.setMap(null); // Hide marker
            }
        });
    }
}

function isGroupVisible(group) {
    return groupVisibility[group] || false;
}
