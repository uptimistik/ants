console.log("game.js file loaded");

// Game initialization
function initializeGame() {
    console.log("initializeGame function called");
    loadPlayerData();
    // Add any game initialization logic here
    console.log("Game initialization complete");
}

function loadPlayerData() {
    console.log("loadPlayerData function called");
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerId && storedPlayerName) {
        window.playerId = storedPlayerId;
        window.playerName = storedPlayerName;
        console.log("Player data loaded:", { playerId: window.playerId, playerName: window.playerName });
    } else {
        console.log("No stored player data found");
    }
}

// UI management functions
function showUsernameOverlay() {
    console.log("Showing username overlay");
    const usernameOverlay = document.getElementById('username-overlay');
    if (usernameOverlay) usernameOverlay.style.display = 'flex';
}

function hideUsernameOverlay() {
    console.log("Hiding username overlay");
    const usernameOverlay = document.getElementById('username-overlay');
    if (usernameOverlay) usernameOverlay.style.display = 'none';
}

function showLeaderboardOverlay() {
    console.log("Showing leaderboard overlay");
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    if (leaderboardOverlay) leaderboardOverlay.style.display = 'flex';
}

function hideLeaderboardOverlay() {
    console.log("Hiding leaderboard overlay");
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    if (leaderboardOverlay) leaderboardOverlay.style.display = 'none';
}

// Leaderboard functionality
function updateFirebaseScore(playerId, playerName, score) {
    console.log("Updating Firebase score", { playerId, playerName, score });
    // ... rest of the function ...
}

function updateLeaderboard() {
    console.log("Updating leaderboard");
    // ... rest of the function ...
}

function updateLeaderboardDisplay(leaderboardData) {
    console.log("Updating leaderboard display", leaderboardData);
    // ... rest of the function ...
}

// Countdown timer
function updateCountdown() {
    // ... existing function ...
}

function startCountdownTimer() {
    console.log("Starting countdown timer");
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");

    const saveUsernameButton = document.getElementById('save-username-button');
    if (saveUsernameButton) {
        console.log("Save username button found");
        saveUsernameButton.addEventListener('click', function() {
            console.log("Save username button clicked");
            const usernameInput = document.getElementById('username-input');
            if (!usernameInput) {
                console.error("Username input not found");
                return;
            }

            const username = usernameInput.value.trim();
            if (username) {
                console.log("Username entered:", username);
                window.playerId = 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
                window.playerName = username;
                localStorage.setItem('playerId', window.playerId);
                localStorage.setItem('playerName', username);
                updateFirebaseScore(window.playerId, username, 0);
                hideUsernameOverlay();
                showLeaderboardOverlay();
            } else {
                console.log("No username entered");
            }
        });
    } else {
        console.error("Save username button not found");
    }

    const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
    if (closeLeaderboardButton) {
        console.log("Close leaderboard button found");
        closeLeaderboardButton.addEventListener('click', hideLeaderboardOverlay);
    } else {
        console.error("Close leaderboard button not found");
    }

    console.log("Starting countdown timer");
    startCountdownTimer();

    console.log("Initializing game");
    initializeGame();
});

console.log("End of game.js file reached");