import { ImageSources } from './definitions.js';

class HTMLManager {

    constructor(mapManager) { 
        this.constructed = true;
        this.currentTableId = null;
        this.mapManager = mapManager;
    }

    showFeatures(featureType) {
        const featureTables = document.querySelectorAll('.parent-feature-table');

        featureTables.forEach(table => {
            table.style.display = 'none';
            // Reset form elements
            const inputs = table.querySelectorAll('input');
            inputs.forEach(input => {
                if (input.type === 'radio') {
                    input.checked = false;
                } else if (input.type === 'checkbox') {
                    input.checked = true;
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

        // Close any open info windows
        if (this.mapManager.polygonManager.infowindow != null) {
            this.mapManager.polygonManager.infowindow.close();
        }

        // Clean up the map (clear markers, layers, etc.)
        this.mapManager.cleanup();

        if (featureType === 'Business') {
            //this.hideTable();
            document.getElementById('business-controls').style.display = 'block';
            this.mapManager.eventListeners.cleanupAllListeners()
            // Create the Business map
            this.mapManager.createMap('WardOutlines.geojson', 'data.csv', 'addresses_with_wards_NEW.csv', 'Business');
            this.mapManager.polygonManager.setAllStyle('#FFFFFF', 0, '#FFFFFF', 2);
            document.getElementById('data-container').style.display = 'none';
        }

        if (featureType === 'Demographic') {
            this.mapManager.cleanup();
            this.mapManager.businessMarkerManager.cleanup();
            // Remove all Business markers when Demographic is selected
            console.log('Removing business markers:', this.mapManager.businessMarkerManager.data);            
            // Hide the business controls and show the demographic controls
            document.getElementById('business-controls').style.display = 'none';

            if (!this.mapManager.polygonManager) {
                this.mapManager.createMap('WardOutlines.geojson', 'demographics.csv', null, 'Demographic');
            }

            document.getElementById('demographic-controls').style.display = 'block';

            // Set the "ALL" radio button to checked
            document.getElementById('demo-all').checked = true;

            // Add any necessary listeners for zoom or other actions
            this.mapManager.addZoomOutListeners();
            // Remove the All info table 
            document.getElementById('data-container').style.display = 'none';
        }
    }

    // Rest of the methods...
    
    showFeatureTable(tableId) {
        document.querySelectorAll('.feature-table').forEach(table => {
            if (table.style.display !== 'none') {
                this.setInputsFalse(table.querySelectorAll('input'));
            }
            table.style.display = 'none';
        });

        if (document.getElementById(tableId)) {
            document.getElementById(tableId).style.display = 'block';
        }

        this.currentTableId = tableId;
    }

    showTable(tableId) {
        const table = document.getElementById(tableId);
        if (table) {
            table.querySelectorAll('*').forEach(element => {
                element.style.visibility = 'visible';
            });
            table.style.display = 'table';
        } else {
            console.warn(`Table with id "${tableId}" not found.`);
        }
    }

    changeText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        } else {
            console.error(`Element with id "${id}" not found.`);
        }
    }

    hideTable(tableId) {
        const table = document.getElementById(tableId);
        if (table) {
            table.style.display = 'none';
        } else {
            console.warn(`Table with id "${tableId}" not found.`);
        }
    }

    changeMapKeyImage(tableId) {
        document.getElementById('map-image').src = ImageSources[tableId];
    }

    setInputsFalse(inputs) {
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            }
        });
    }

    setInputsTrue(inputs) {
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = true;
            }
        });
    }

    addRow(category, value) {
        const tableBody = document.querySelector('#data-table tbody');
        const newRow = document.createElement('tr');
        const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
        newRow.innerHTML = `
            <td>${category}</td>
            <td>${formattedValue}</td>
        `;
        tableBody.appendChild(newRow);
    }

    clearTable() {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = '';
    }
}

export default HTMLManager;
