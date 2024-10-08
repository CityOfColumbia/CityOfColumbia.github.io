let map
let wards = {
    'Lisa Meyer':'Ward 2', 
    'Nick Foster':'Ward 4', 
    'Valerie Carroll':'Ward 1', 
    'Roy Lovelady':'Ward 3', 
    'Donald Waterman':'Ward 5',
    'Betsy Peters':'Ward 6'
    };
let marker_groups = {};
let groupVisibility = {};

async function initMap() {
    map = createMapDefinitions()
    let data;

    data = await loadCSV('ADDRESSES_WITH_WARD_LAT_LONG.csv');
    loadMapShapes();
    placeOnLatLong(data, map);
    placeHeatMap(data, map);
    for(group in marker_groups){
        groupVisibility[group] = true;
    }



    
}

function createMapDefinitions(){
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 12.5,
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
        radius: 40,
        opacity: 1
    });

    heatmap.setMap(map);
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
        }
    });


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
                    let value = values[index];
                    let parsedValue = parseFloat(value);
                    if (Number.isInteger(parsedValue)) {
                        value = parsedValue.toLocaleString(); // Format the number with commas
                    }
                    featureData[name][header] = value;
                });
            });
        });
    map.data.loadGeoJson("WardOutlines.geojson");




    map.data.loadGeoJson("WardOutlines.geojson");

    // Set the style for the polygons
    map.data.setStyle({
        fillColor: '#FFFFFF', // Change this to your desired hex color
        strokeColor: '#FFFFFF', // Change this to your desired hex color
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
        document.getElementById(`ward${i}`).checked = !allOn;
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
