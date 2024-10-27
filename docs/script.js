// Wait for the window to fully load before executing the script
window.onload = function () {
    console.log("Initializing the map...");

    // Create a Leaflet map centered at specified latitude and longitude with a specific zoom level
    const defaultCenter = [-37.8161, 144.9650]; // Default coordinates for the center of the map
    const defaultZoom = 14; // Default zoom level

    const map = L.map('mapid', {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true
    });

    // Set up the tile layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    });

    const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; <a href="https://www.google.com/maps" target="_blank">Google Maps</a>'
    });

    const googleSat = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; <a href="https://www.google.com/maps" target="_blank">Google Maps</a>'
    });

    const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Create Layer Groups for GeoJSON
    const geoJsonLayer1 = L.layerGroup();
    const geoJsonLayer2 = L.layerGroup();
    const geoJsonLayer3 = L.layerGroup();

    // Fetch GeoJSON files and add to the respective layers

    // Quiz location JSON
    fetch('25mbuffer.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.Name); // Customize as needed
                }
            }).addTo(geoJsonLayer1);
        })
        .catch(err => console.error('Failed to load GeoJSON:', err));

    // Melbourne Suburb JSON
    async function loadMelbourneData() {
        const response = await fetch('melbourne.geojson');
        const data = await response.json();
        if (data.features) {
            L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.name || 'Location');
                }
            }).addTo(geoJsonLayer2);
        } else {
            console.error('GeoJSON data is not in the expected format.');
        }
    }
    loadMelbourneData();

    // Quiz Buffer location JSON
    fetch('formerlakes.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.type);
                }
            }).addTo(geoJsonLayer3);
        })
        .catch(err => console.error('Failed to load GeoJSON:', err));

    // Create a layer control object and add the layers
    const baseMaps = {
        "Google Satellite": googleSat,
        "OpenStreetMap": osm,
        "Google Streets": googleStreets,
        "Esri World Imagery": Esri_WorldImagery,
    };

    const overlays = {
        "Quiz 25m Buffer": geoJsonLayer1,
        "Melbourne Suburb": geoJsonLayer2,
        "Former Lakes_Wetlands": geoJsonLayer3
    };

    // Add layer control to the map
    const layerControl = L.control.layers(baseMaps, overlays).addTo(map);

    map.addLayer(googleSat);

    // Zoom control
    map.zoomControl.setPosition('topleft');

    // Scale bar
    L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomright'
    }).addTo(map)


    // Home button Control
    const homeButton = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (map) {
            // Create the button element
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = 'white';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.innerHTML = '<img src="home.png" style="width: 25px; height: 25px;">';

            // When clicked, reset map to default view
            container.onclick = function () {
                map.setView(defaultCenter, defaultZoom);
            }

            return container;
        }
    });

    map.addControl(new homeButton());

    // Add locate control
    L.control.locate().addTo(map);

    //Ruler
    var options = {
        position: 'topleft',
        lengthUnit: {
            factor: 1000,
            display: 'meters',
            decimal: 2,
        },
    };
    L.control.ruler(options).addTo(map);

    // Initialize an object to keep track of the total score
    const totalScore = { value: 0 };
    // Create layer groups for quests and user location markers
    const questLayer = L.layerGroup().addTo(map);
    const userLocationLayer = L.layerGroup().addTo(map);

    // Define an array of quests
    const quests = [
        {
            id: 1, name: "Fitzroy Gardens",
            lat: -37.8136,
            lng: 144.9800,
            question: "Question: When were the Fitzroy Gardens established?",
            options: [
                "1. 1839",
                "2. 1859",
                "3. 1879",
                "4. 1899"
            ],
            answer: "2. 1859"
        },
        {
            id: 2,
            name: "Royal Botanic Gardens",
            lat: -37.8304,
            lng: 144.9803,
            question: "Question: What is the total area of the Royal Botanic Gardens?",
            options: [
                "1. 38 hectares",
                "2. 42 hectares",
                "3. 45 hectares",
                "4. 40 hectares"
            ],
            answer: "1. 38 hectares"
        },
        {
            id: 3,
            name: "Melbourne Cricket Ground (MCG)",
            lat: -37.8200,
            lng: 144.9834,
            question: "Question: How many people can the MCG seat for an AFL match?",
            options: [
                "1. 70,000",
                "2. 90,000",
                "3. 100,000",
                "4. 95,000"
            ],
            answer: "3. 100,000"
        },
        {
            id: 4,
            name: "Eureka Skydeck",
            lat: -37.8213,
            lng: 144.9647,
            question: "Question: What is the height of the Eureka Skydeck?",
            options: [
                "1. 285 meters",
                "2. 300 meters",
                "3. 270 meters",
                "4. 297 meters"
            ],
            answer: "4. 297 meters"
        },
        {
            id: 5,
            name: "Queen Victoria Market",
            lat: -37.8074,
            lng: 144.9569,
            question: "Question: What type of market is the Queen Victoria Market primarily known for?",
            options: [
                "1. Food market",
                "2. Artisan crafts market",
                "3. Clothing market",
                "4. Automobile market"
            ],
            answer: "1. Food market"
        },
        {
            id: 6,
            name: "Marvel Stadium",
            lat: -37.8165,
            lng: 144.9470,
            question: "Question: In what year did Marvel Stadium (formerly Docklands Stadium) officially open?",
            options: [
                "1. 1999",
                "2. 2000",
                "3. 2001",
                "4. 2002"
            ],
            answer: "2. 2000"
        },
        {
            id: 7,
            name: "Melbourne Central",
            lat: -37.8104,
            lng: 144.9631,
            question: "Question: What famous landmark is housed inside Melbourne Central?",
            options: [
                "1. The Shot Tower",
                "2. The Eureka Tower",
                "3. The Royal Exhibition Building",
                "4. The Shrine of Remembrance"
            ],
            answer: "1. The Shot Tower"
        },
        {
            id: 8,
            name: "Shrine of Remembrance",
            lat: -37.8304,
            lng: 144.9735,
            question: "Question: The Shrine of Remembrance is dedicated to soldiers of which war?",
            options: [
                "1. World War I",
                "2. World War II",
                "3. Vietnam War",
                "4. Korean War"
            ],
            answer: "1. World War I"
        },
        {
            id: 9,
            name: "National Gallery of Victoria (NGV)",
            lat: -37.8226,
            lng: 144.9689,
            question: "Question: When was the National Gallery of Victoria (NGV) founded?",
            options: [
                "1. 1856",
                "2. 1900",
                "3. 1950",
                "4. 1800"
            ],
            answer: "1. 1856"
        },
        {
            id: 10,
            name: "Melbourne Museum",
            lat: -37.8032,
            lng: 144.9717,
            question: "Question: Which exhibit is one of the most famous in Melbourne Museum?",
            options: [
                "1. Dinosaur Skeletons",
                "2. Phar Lap",
                "3. Egyptian Mummies",
                "4. Space Shuttle Replica"
            ],
            answer: "2. Phar Lap"
        },
    ];

    // Function to draw quest locations with circle markers
    function drawQuests() {
        questLayer.clearLayers();
        const zoom = map.getZoom();
        const scaleFactor = 3;
        const radiusBase = 10;
        const radius = (radiusBase * scaleFactor) / Math.pow(zoom, 0.5);
        // Loop through each quest and add a marker to the map
        quests.forEach(quest => {
            const marker = L.circleMarker([quest.lat, quest.lng], {
                radius: radius,
                color: '#000000',
                fillColor: '#000000',
                fillOpacity: 0.7,
                weight: 1, // Border thickness
                className: quest.completed ? 'completed-marker' : 'glowing-marker'
            }).addTo(questLayer);

            // Handle click event for the marker
            marker.on('click', () => {
                // Get user's current location
                if (userLocationLayer.getLayers().length > 0) {
                    const userLocation = userLocationLayer.getLayers()[0].getLatLng(); // Assuming the first layer is the user's location
                    const questLocation = marker.getLatLng();
                    const distance = map.distance(userLocation, questLocation); // Distance in meters

                    if (distance <= 25) { // Adjust proximity check to 25 meters
                        if (!quest.completed) {
                            askQuestion(quest, marker);
                        } else {
                            alert("This quest is already done. Go for the next one.");
                        }
                    } else {
                        // Show dynamic distance message in alert
                        const distanceInMeters = Math.round(distance);
                        alert(`Get closer to the location to begin the quiz. \nYou are ${distanceInMeters} m away from this location.`);
                    }
                } else {
                    alert("Could not get your location. Please enable location services.");
                }
            });
        });
    }

    // Question pop-up logic
    function askQuestion(quest, marker) {
        const popupContent = `
        <h3>${quest.name}</h3>
        <p>${quest.question}</p>
        ${quest.options.map(option => `<button class='option-button'>${option}</button>`).join('')}
        <div><button class='check-answer-button'>Check Answer</button></div>
    `;
        const popup = L.popup()
            .setLatLng([quest.lat, quest.lng]) // Set the geographical coordinates for the popup
            .setContent(popupContent)
            .openOn(map);

        document.querySelectorAll('.option-button').forEach(button => {
            button.onclick = function () {
                sessionStorage.setItem('selectedAnswer', button.textContent);
                document.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
            };
        });

        sessionStorage.removeItem('selectedAnswer'); // Clear the selected answer when starting a new question

        document.querySelector('.check-answer-button').onclick = function () {
            const selectedAnswer = sessionStorage.getItem('selectedAnswer');
            console.log("Selected Answer:", selectedAnswer);
            console.log("Correct Answer:", quest.answer);

            if (!selectedAnswer) {
                alert("Please select an answer before checking.");
                return;
            }

            if (selectedAnswer === quest.answer) {
                alert("Correct answer! You've earned 10 points.");
                totalScore.value += 10; // Increment the score by 10
                quest.completed = true; // Mark the quest as completed
                map.closePopup();
                marker.setStyle({ color: 'black', fillColor: 'black' });

                const markerElement = marker.getElement();
                console.log("Marker Element:", markerElement);

                if (markerElement) {
                    markerElement.classList.remove('glowing-marker');
                    markerElement.classList.add('completed-marker');
                } else {
                    console.log("Marker element not found.");
                }
            } else {
                alert("Incorrect answer! Try again.");
            }

            updateScoreAndProgress();
        };
    }

    // Update the user's score and progress on the display
    function updateScoreAndProgress() {
        const completedCount = quests.filter(q => q.completed).length;
        document.getElementById('score').innerText = `You Scored: ${totalScore.value} | Completed: ${completedCount}/${quests.length}`;
    }

    // Redraw circles on zoom change
    map.on('zoomend', function () {
        drawQuests();
    });

    // Initial draw when map loads
    drawQuests();

    // Geolocation for user location
    navigator.geolocation.watchPosition(
        position => {
            // Extract Latitude and Longitude from the user's position
            const { latitude, longitude } = position.coords;

            //Clear any existing markers from the userLocationLayer
            userLocationLayer.clearLayers();

            // Create a new marker for the user's location with a custom icon
            L.marker([latitude, longitude], {
                icon: L.divIcon({
                    className: 'location-marker',
                    html: '<i class="fas fa-dot-circle"></i>',
                    iconSize: L.point(24, 24)
                })
            }).addTo(userLocationLayer);
        },
        error => {
            // Alert the user if their location cannot be accessed
            alert("Unable to retrieve your location.");
        },
        { enableHighAccuracy: true } // Request high accuracy for the geolocation
    );

    L.control.locate({
        setView: true,
        keepCurrentZoomLevel: true,
        drawCircle: true,
        drawMarker: true,
        follow: true, // Continuously track user location
        markerStyle: {
            icon: L.divIcon({
                className: 'location-marker',
                html: '<i class="fas fa-dot-circle"></i>',
                iconSize: L.point(24, 24)
            })
        },
        locateOptions: {
            enableHighAccuracy: true,
            watch: true, // Enable continuous tracking like watchPosition
            maximumAge: 10000,  // Update at most every 10 seconds
            timeout: 10000      // Timeout after 10 seconds if no position
        }
    }).on('locationfound', function (e) {
        // Extract user's latitude and longitude from event
        const userLat = e.latitude;
        const userLng = e.longitude;

        // Check proximity to the target marker
        checkProximity(userLat, userLng, targetMarker.getLatLng().lat, targetMarker.getLatLng().lng);
    }).addTo(map);

    // Display the modal that explains how to play the game
    const modal = document.getElementById('howToPlayModal');
    modal.style.display = "block";

    // Add an event listener for closing the modal when the close button is clicked
    document.querySelector('.close').onclick = () => {
        modal.style.display = "none"; // Hide the modal
    };

    // Add an event listener to close the modal when clicking outside of it
    window.onclick = event => {
        if (event.target === modal) {
            modal.style.display = "none"; // Hide the modal
        }
    };

    // Function to update the score and progress displayed on the screen
    updateScoreAndProgress();
};


// Get modal and overlay elements
const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');

// Get button to open modal
document.getElementById('openModal').addEventListener('click', function () {
    modal.classList.add('active'); // Show modal
    overlay.classList.add('active'); // Show overlay
});

// Get close button
document.querySelector('.close-button').addEventListener('click', function () {
    modal.classList.remove('active'); // Hide modal
    overlay.classList.remove('active'); // Hide overlay
});

// Close modal when clicking on overlay
overlay.addEventListener('click', function () {
    modal.classList.remove('active'); // Hide modal
    overlay.classList.remove('active'); // Hide overlay
});


