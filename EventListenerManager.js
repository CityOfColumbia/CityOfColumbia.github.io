//import MapManager  from './MapManager.js'
class EventListenerManager {
    
    constructor(mapManager){
        this.eventListeners = [];


    }

    addListener(listener){
        this.eventListeners.push(listener)
    }


    showListeners(){
        console.log("Event Listeners!", this.eventListeners)
    }


    cleanup() {
        this.eventListeners.forEach(listener => {
            google.maps.event.removeListener(listener);
        });
        this.eventListeners = [];
    }

}

export default EventListenerManager; 
    
