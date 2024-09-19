function initMap() {
    // loads the google map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 38.951643, lng: -92.334038},
        mapTypeId: 'roadmap'
    });

    // Load GeoJSON data
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
                radius: 15,
                opacity: 0.9
            });

        
            heatmap.setMap(map);
        })
        .catch(error => console.error('Error loading GeoJSON data:', error));
}