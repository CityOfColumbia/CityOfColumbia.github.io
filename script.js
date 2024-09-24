function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 38.951643, lng: -92.334038},
        mapTypeId: 'roadmap'
    });

    var kmlLayer = new google.maps.KmlLayer({
        url: 'https://drive.google.com/uc?export=download&id=13Q3WU5T2lR4XEeyBt_1nqDdpzm4rYn59',
        map: map,
        preserveViewport: true
    });

    google.maps.event.addListener(kmlLayer, 'status_changed', function() {
        var status = kmlLayer.getStatus();
        console.log('KML Layer status:', status);
        if (status !== google.maps.KmlLayerStatus.OK) {
            console.error('KML Layer failed to load:', status);
        }
    });
}
