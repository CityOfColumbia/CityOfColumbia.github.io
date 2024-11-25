//import BusinessPolygons from './PolygonManager.js'
import {DemographicPolygons,BusinessPolygons,PolygonManager} from './PolygonManager.js'
import HTMLManager from './HTMLManager.js'
import BusinessMarkers from './Markers.js'
import EventListenerManager from './EventListenerManager.js'


class MapManager {

    constructor(){
        this.hasMarkerSet = {
            'Business':true,
            'Demographic':false
        }
        this.polygonManagerTypes = {
            'Business':BusinessPolygons,
            'Demographic':DemographicPolygons
        };

        this.markerManagerTypes = {
            'Business':BusinessMarkers
        }

        this.map = this.createMapDefinitions();
        this.htmlManager = new HTMLManager(this)
        this.eventListeners = null;
        this.polygonManager = null;
        this.markerManager = null;
        this.heatMapZooms = {   
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
        };
    }

    createEventListenerManager(){
        this.eventListeners = new EventListenerManager(this)
    }

    createPolygonManager(geoJson, data, managerID){
        const returnPolygonManager = this.polygonManagerTypes[managerID];
        this.polygonManager = new returnPolygonManager(this,geoJson,data,managerID)
    }

    createMarkerManager(latLong,managerID){
        const returnMarkerManager = this.markerManagerTypes[managerID]
        this.markerManager = new returnMarkerManager(this,latLong)
    }

    createMapDefinitions() {
        return new google.maps.Map(document.getElementById('map'), {
            zoom: 12.6,
            center: { lat: 38.947907, lng: -92.323575 },
            mapTypeId: 'roadmap',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,  // Disable fullscreen button
            zoomControl: false,        // Disable zoom controls

            styles: [
                // General geometry (background) color
                { elementType: 'geometry', stylers: [{ color: '#000000' }] },  // Dark gray background
                
                // Hide most labels to reduce clutter
                { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },  // Hide icons (like POIs)
                { elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },  // Light gray text for labels
                { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },  // Dark stroke around labels
                
                // Admin and boundary elements
                { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' },{visibility: 'off' }] },  // Lighter gray for administrative boundaries
                { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' },{visibility: 'off' }] },  // Subtle color for country labels
                
                // Hide land parcels (reduces clutter)
                { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
                
                // Simplify locality labels
                { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' },{visibility: 'off' }] },
    
                // Points of interest (POIs) – light gray text, but hidden if needed
                { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },  // Light gray POI text
                { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'off' }] },  // Hide POIs
                
                // Parks in dark gray (make them blend with the background)
                { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#424242' },{visibility: 'off' }] },
                { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' },{visibility: 'off' }] },
    
                // Road styling (dark, minimalistic)
                { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },  // Dark gray fill for roads
                { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },  // Light road labels
    
                // Arterial and highway roads in even darker shades
                { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#3e3e3e' }] },  
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#474747' }] },
                { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#5a5a5a' }] },
    
                // Local roads in slightly lighter gray for visibility
                { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    
                // Transit labels in light gray
                { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    
                // Water bodies in dark gray/black to blend seamlessly
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a1a' },{visibility: 'off' }] },  // Dark gray for water bodies
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' },{visibility: 'off' }] }  // Water text in dark gray
            ]
        });
    }
    


    addZoomOutListeners() {
        // Add a hover listener to change the cursor
        // Listener to ensure polygons and markers turn off once the user zooms out far enough
        const zoom_change = this.map.addListener('zoom_changed', () => {
        
            const mapZoom = this.map.getZoom();

            if (mapZoom < 10 && this.polygonManager.polygonsVisible) {
                this.polygonManager.togglePolygons(this.map, false);
                this.polygonManager.polygonsVisible = false;
                this.markerManager.toggleMarkersOff()

            } else if (mapZoom >=10 && !this.polygonManager.polygonsVisible) {
                
                this.polygonManager.togglePolygons(this.map, true);
                this.polygonManager.polygonsVisible = true;
                this.markerManager.toggleMarkersOn();
                
            }

        });

        this.eventListeners.addListener(zoom_change);


    }

    placeHeatMap(){  //TODO: Change the heatmap layer to its own class. this should be possible, but this needed to be finished for presentation

        const heatmapData = [];
    
        this.markerManager.markerDataList.forEach(row => {
            var lat = parseFloat(row["Lat"]);
            var lng = parseFloat(row["Long"]);
            if (!isNaN(lat) && !isNaN(lng)) {
                var latLng = new google.maps.LatLng(lat, lng);
                heatmapData.push(latLng);
            }
        });



        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            gradient: [
                'rgba(255, 255, 255, 0)', // Transparent at the start
                'rgba(255, 230, 204, 1)', // Light peach
                'rgba(255, 204, 153, 1)', // Light orange
                'rgba(255, 178, 102, 1)', // Medium orange
                'rgba(255, 153, 51, 1)',  // Strong orange
                'rgba(255, 127, 0, 1)',   // Reddish orange
                'rgba(255, 102, 0, 1)',   // Reddish orange
                'rgba(255, 77, 0, 1)',    // Deep orange
                'rgba(255, 51, 0, 1)',    // Dark orange-red
                'rgba(255, 0, 0, 1)'      // Bright red at the highest intensity
            ],
            radius: this.getHeatmapRadius(this.map.getZoom()),
            opacity: this.getHeatmapOpacity(this.map.getZoom())
        });
        
    
        this.heatmap.setMap(this.map);
        const heatmapZoomListener = this.map.addListener('zoom_changed', () => {
            this.heatmap.set('radius', this.getRadius(this.map.getZoom()));
    
        });
        this.eventListeners.addListener(heatmapZoomListener)
    }
        getHeatmapOpacity(zoom) {
            // Adjust the opacity based on the zoom level (lower zoom = lower opacity)
            if (zoom < 8) return 0.2; // Low opacity when zoomed out
            else if (zoom < 12) return 0.4; // Medium opacity
            else return 1 ; // Higher opacity when zoomed in
        }
    
        getHeatmapRadius(zoom) {
            // Adjust the radius based on the zoom level (higher zoom = smaller radius)
            if (zoom < 8) return 30;  // Large radius when zoomed out
            else if (zoom < 12) return 20;  // Medium radius
            else return 10;  // Smaller radius when zoomed in
        }
    
        getRadius(zoom){
    
            return this.heatMapZooms[zoom]
    
        }
    
        async createMap(geoJson, polygonData,markerData, mapID){
    
            this.createEventListenerManager();
            this.createPolygonManager(geoJson, polygonData,mapID);
            this.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
    
            if(this.hasMarkerSet[mapID] == true){
                this.createMarkerManager(markerData,mapID);
                await this.markerManager.placeOnLatLong(this.markerManager.data);
                this.placeHeatMap()
            }
    
            this.addZoomOutListeners();
    
        }
    
    
    
        cleanup(){
            // this.eventListeners.forEach(listener => {
            //     console.log("listener:", listener)
            //     this.map.event.removeListener(listener);
            // });
            if(this.eventListeners){
            this.eventListeners.cleanup();}
    
    
            if(this.polygonManager){
            this.polygonManager.cleanup();}
            this.polygonManager = null;
            
            if(this.markerManager){
            this.markerManager.cleanup();}
            this.markerManager = null;
            
            if(this.heatmap){
            this.heatmap.setMap(null);}
            this.heatmap = null;
        }
 }


    
    export default MapManager; 