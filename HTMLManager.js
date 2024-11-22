import { ImageSources } from './definitions.js';

class HTMLManager {
  
    constructor(mapManager) { 
        this.constructed = true;
        this.currentTableId = null;
        this.mapManager = mapManager
    }

    showFeatures(featureType){
        const featureTables = document.querySelectorAll('.parent-feature-table');

        featureTables.forEach(table => {
            table.style.display = 'none';
            // Reset form elements
            const inputs = table.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.type === 'radio' ) {
                    input.checked = false;
                } else if (input.type === 'checkbox') {
    
                    input.checked = true
    
    
                }
            });
    
            const selects = table.querySelectorAll('select');
            selects.forEach(select => {
                select.selectedIndex = 0;
            });
        });
    
        const featureTables2 = document.querySelectorAll('.feature-table');
    
        featureTables2.forEach(table => {
            table.style.display = 'none';
            // Reset form elements
            const inputs = table.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
    
            const selects = table.querySelectorAll('select');
            selects.forEach(select => {
                select.selectedIndex = 0;
            });
    
            // Check all options except "All" for non-radio tables
            const checkboxes = table.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.id !== 'all') {
                    checkbox.checked = true;
                }
            });
        });
        if(this.mapManager.polygonManager.infowindow != null){
        this.mapManager.polygonManager.infowindow.close()}
        this.mapManager.cleanup()


        if (featureType === 'Business') {
            this.mapManager.createMap('WardOutlines.geojson','data.csv','addresses_with_wards_NEW.csv','Business');
            this.mapManager.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
            document.getElementById('business-controls').style.display = 'block';
        }
        
        if (featureType === 'Demographic') {
            if(!this.mapManager.polygonManager)
                this.mapManager.createMap('WardOutlines.geojson', 'demographics.csv', null, 'Demographic');
        
            document.getElementById('demographic-controls').style.display = 'block';
            
            // Set the "Race" radio button to checked
            document.getElementById('race').checked = true;
            
            // Set the "race-controls" feature table to block display
            document.getElementById('race-controls').style.display = 'block';
            
            // Set the "Black or African American" radio button under race-options to checked
            document.getElementById('Black').checked = true;
        
            this.mapManager.addZoomOutListeners();
        } }

    showTable(tableId) {
        // Hide all tables and set inputs to false if they were previously selected
        document.querySelectorAll('.feature-table').forEach(table => {
            if (table.style.display !== 'none') {
                this.setInputsFalse(table.querySelectorAll('input'));
            }
            table.style.display = 'none';
        });
        // Show the selected table
        document.getElementById(tableId).style.display = 'block';
        this.changeMapKeyImage(tableId)
        this.currentTableId = tableId;
    }

    changeMapKeyImage(tableId){
        document.getElementById('map-image').src = ImageSources[tableId]
    }

    setInputsFalse(inputs){
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            }
        });
    }

    setInputstrue(inputs){
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = true;
            }
        });
    }
}

export default HTMLManager; 