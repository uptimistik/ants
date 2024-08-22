// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeS_7ev8inI1yvzkljhJn_IU7z5cJIp9k",
    authDomain: "antsgame-204c1.firebaseapp.com",
    databaseURL: "https://antsgame-204c1-default-rtdb.firebaseio.com",
    projectId: "antsgame-204c1",
    storageBucket: "antsgame-204c1.appspot.com",
    messagingSenderId: "580715522171",
    appId: "1:580715522171:web:0bba6c6a16399dc3fe5ade",
    measurementId: "G-E0JEEGY1GR"
};

firebase.initializeApp(firebaseConfig);

// Utility functions
function getUniquePlayerId() {
    return 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
}

// App initialization and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('save-username-button').addEventListener('click', function() {
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();
        if (username) {
            const playerId = getUniquePlayerId();
            window.playerId = playerId;
            window.playerName = username;
            localStorage.setItem('playerId', playerId);
            localStorage.setItem('playerName', username);
            updateFirebaseScore(playerId, username, 0);
            hideUsernameOverlay();
            showLeaderboardOverlay();
        }
    });

    document.getElementById('close-leaderboard-button').addEventListener('click', function() {
        hideLeaderboardOverlay();
    });
}

// Game state management functions are now in game.js

// Leaderboard functionality is now in game.js

// Load the game engine
onEngineLoad();