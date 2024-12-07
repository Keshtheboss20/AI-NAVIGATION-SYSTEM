let map;
let geocoder;
let service;
let currentLocation;
let directionsService;
let directionsRenderer;
let markers = [];

// Initialize the map
function initMap() {
    // Set default location (can be the college central point)
    const collegeCenter = { lat: 12.9716, lng: 77.5946 }; // Example coordinates

    map = new google.maps.Map(document.getElementById("map"), {
        center: collegeCenter,
        zoom: 16,
    });

    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            map.setCenter(currentLocation);
            map.setZoom(16);
        }, () => {
            alert("Error: The Geolocation service failed.");
        });
    }

    // Set up the places search
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-btn");

    searchButton.addEventListener("click", () => {
        const location = searchInput.value;
        geocodeAddress(location);
    });
}

// Function to geocode the address and show the location on the map
function geocodeAddress(address) {
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(16);
            placeMarker(location);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// Place a marker on the map
function placeMarker(location) {
    const marker = new google.maps.Marker({
        map: map,
        position: location,
    });
    markers.push(marker);
}

// Handle voice recognition
document.getElementById('use-voice-btn').addEventListener('click', function () {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        document.getElementById('search-input').value = transcript;
        geocodeAddress(transcript); // Look up the address
    };
});

// Handle Directions
document.getElementById("directions-btn").addEventListener("click", function () {
    const destination = document.getElementById("search-input").value;
    if (destination && currentLocation) {
        calculateRoute(currentLocation, destination);
    }
});

// Calculate the route using Google Maps API
function calculateRoute(start, end) {
    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING,
    };
    directionsService.route(request, (result, status) => {
        if (status == "OK") {
            directionsRenderer.setDirections(result);
        } else {
            alert("Could not calculate route: " + status);
        }
    });
}

// Chatbot Interaction (Simple example)
document.getElementById("chat-send-btn").addEventListener("click", function () {
    const query = document.getElementById("chat-input").value;
    if (query.trim()) {
        addMessage(query, "user-message");

        const response = getAIResponse(query);
        addMessage(response, "assistant-message");

        document.getElementById("chat-input").value = "";
    }
});

// Function to simulate AI response (could be replaced with Dialogflow or GPT-3)
function getAIResponse(query) {
    if (query.toLowerCase().includes("library")) {
        return "The library is located near the central quad.";
    } else if (query.toLowerCase().includes("auditorium")) {
        return "The auditorium is next to the main cafeteria.";
    } else {
        return "Sorry, I didn't understand your request. Please try again.";
    }
}

// Function to add messages to the chatbox
function addMessage(content, type) {
