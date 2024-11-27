//import MapManager  from './MapManager.js'
class EventListenerManager {
    
    constructor(mapManager){
        this.eventListeners = [];
        this.allDemographicListeners = [];
        this.mapManager = mapManager
    }

    addListener(listener){
        this.eventListeners.push(listener)
    }

    addAllListener(listener){
        this.allDemographicListeners.push(listener)
    }

    showListeners(){
        console.log("Event Listeners!", this.eventListeners)
    }

    cleanupAllListeners(){
        this.allDemographicListeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });
        this.allDemographicListeners = [];
    }

    cleanup() {
        this.cleanupAllListeners()
        this.eventListeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });
        this.eventListeners = [];
    }

}

export default EventListenerManager; 
    
