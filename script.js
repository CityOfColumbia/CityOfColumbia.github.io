function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 38.951643, lng: -92.334038},
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

    fetch('COMOGeoJSON.json')
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data parsed:', data);
            var heatmapData = [];

            data.features.forEach(feature => {
                var coords = feature.geometry.coordinates;
                var latLng = new google.maps.LatLng(coords[1], coords[0]);
                heatmapData.push(latLng);
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
                radius: 20,
                opacity: 0.8 // Corrected opacity value
            });

            heatmap.setMap(map);


        })
        .catch(error => console.error('Error loading GeoJSON data:', error));

        var kmlLayer = new google.maps.KmlLayer({
            url: 'https://drive.google.com/uc?export=download&id=1aAXAiLRDODSN9IroOf5coeKY423EemEk',
            map: map,
            preserveViewport: true,
            suppressInfoWindows: true
        });
        
        google.maps.event.addListener(kmlLayer, 'status_changed', function() {
            if (kmlLayer.getStatus() !== google.maps.KmlLayerStatus.OK) {
                console.error('KML Layer failed to load:', kmlLayer.getStatus());
            }
        });
        
        google.maps.event.addListener(kmlLayer, 'click', function(event) {
            const content = "TEST"; // Display "TEST" when clicking
            const infowindow = new google.maps.InfoWindow({
                content: content,
                position: event.latLng,
            });
            infowindow.open(map);
        });
}
