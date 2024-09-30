let map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12.5,
        center: {lat: 38.947907, lng: -92.323575},
        mapTypeId: 'roadmap',
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
    // Ensure the map is fully loaded before calling loadMapShapes
    google.maps.event.addListenerOnce(map, 'idle', loadMapShapes);
}

//UPDATE THIS, THIS SHOULD BE A FUNCTION WHICH FILLS THE DICTIONARY EVENTUALLY FROM AN INPUT CSV
let wards = {
'Lisa Meyer':'Ward 1', 
'Nick Foster':'Ward 2', 
'Valerie Carroll':'Ward 3', 
'Roy Lovelady':'Ward 4', 
'Donald Waterman':'Ward 5',
'Betsy Peters':'Ward 6'


}

function loadMapShapes() {
    let infowindow = null;
    let featureData = {};

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
                    featureData[name][header] = values[index];
                });
            });
        });
    // Load US state outline polygons from a GeoJson file
    map.data.loadGeoJson("WardOutlines.geojson");

    // Set the style for the polygons
    map.data.setStyle({
        fillColor: '#FF5733', // Change this to your desired hex color
        strokeColor: '#FF5733', // Change this to your desired hex color
        strokeWeight: 2
    });

    // Add a click listener to the features
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

        // Create custom content for the info window
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
}

