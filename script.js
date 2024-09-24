function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 38.951643, lng: -92.334038},
        mapTypeId: 'roadmap'
    });

    // fetch('COMOGeoJSON.json')
    //     .then(response => {
    //         console.log('Response received:', response);
    //         return response.json();
    //     })
    //     .then(data => {
    //         console.log('Data parsed:', data);
    //         var heatmapData = [];

    //         data.features.forEach(feature => {
    //             var coords = feature.geometry.coordinates;
    //             var latLng = new google.maps.LatLng(coords[1], coords[0]);
    //             heatmapData.push(latLng);
    //         });

    //         console.log('Heatmap data:', heatmapData);

    //         var heatmap = new google.maps.visualization.HeatmapLayer({
    //             data: heatmapData,
    //             gradient: [
    //                 'rgba(0, 255, 255, 0)',
    //                 'rgba(0, 255, 255, 1)',
    //                 'rgba(0, 191, 255, 1)',
    //                 'rgba(0, 127, 255, 1)',
    //                 'rgba(0, 63, 255, 1)',
    //                 'rgba(0, 0, 255, 1)',
    //                 'rgba(0, 0, 223, 1)',
    //                 'rgba(0, 0, 191, 1)',
    //                 'rgba(0, 0, 159, 1)',
    //                 'rgba(0, 0, 127, 1)',
    //                 'rgba(63, 0, 91, 1)',
    //                 'rgba(127, 0, 63, 1)',
    //                 'rgba(191, 0, 31, 1)',
    //                 'rgba(255, 0, 0, 1)'
    //             ],
    //             radius: 20,
    //             opacity: 0.8 // Corrected opacity value
    //         });

    //         heatmap.setMap(map);

    //         data.features.forEach(feature => {
    //             var coords = feature.geometry.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
    //             var polygon = new google.maps.Polygon({
    //                 paths: coords,
    //                 strokeColor: '#FF0000',
    //                 strokeOpacity: 0.8,
    //                 strokeWeight: 2,
    //                 fillColor: '#FF0000',
    //                 fillOpacity: 0.1
    //             });
    //             polygon.setMap(map);
    //         });
    //     })
    //     .catch(error => console.error('Error loading GeoJSON data:', error));

    var kmlLayer = new google.maps.KmlLayer({
        url: 'https://drive.google.com/uc?export=download&id=13Q3WU5T2lR4XEeyBt_1nqDdpzm4rYn59',
        map: map,
        preserveViewport: true
    });

    google.maps.event.addListener(kmlLayer, 'status_changed', function() {
        if (kmlLayer.getStatus() !== google.maps.KmlLayerStatus.OK) {
            console.error('KML Layer failed to load:', kmlLayer.getStatus());
        }
    });
}
