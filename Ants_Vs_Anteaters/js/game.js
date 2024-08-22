// Game initialization
function initializeGame() {
    console.log("Game initialized");
    // Add any game initialization logic here
    loadPlayerData();
}

function loadPlayerData() {
    const storedPlayerId = localStorage.getItem('playerId');
    const storedPlayerName = localStorage.getItem('playerName');
    if (storedPlayerId && storedPlayerName) {
        window.playerId = storedPlayerId;
        window.playerName = storedPlayerName;
    }
}

// Leaderboard functionality
function updateFirebaseScore(playerId, playerName, score) {
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        return;
    }

    const userRef = firebase.database().ref('users/' + playerId);
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val();
        if (!userData || userData.score < score) {
            userRef.set({
                id: playerId,
                name: playerName,
                score: score
            });
        }
        window.lastScore = score;
    }).catch(error => {
        console.error('Error updating Firebase score:', error);
    });
}

function updateLeaderboard() {
    return new Promise((resolve, reject) => {
        if (!firebase.apps.length) {
            reject('Firebase not initialized');
            return;
        }

        const leaderboardRef = firebase.database().ref('users');
        leaderboardRef.orderByChild('score').limitToLast(10).once('value', (snapshot) => {
            const leaderboardData = [];
            snapshot.forEach((childSnapshot) => {
                leaderboardData.unshift({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            updateLeaderboardDisplay(leaderboardData);
            resolve();
        }, (error) => {
            console.error("Error fetching leaderboard data:", error);
            reject(error);
        });
    });
}

function updateLeaderboardDisplay(leaderboardData) {
    let leaderboardHtml = '<tr><th>Rank</th><th>Player Name</th><th>Top Score</th></tr>';
    let currentPlayerHighScore = 0;
    leaderboardData.forEach((user, index) => {
        const rank = index + 1;
        const initials = user.name.charAt(0).toUpperCase();
        const avatarHtml = `<div class="avatar">${initials}</div>`;
        const isCurrentPlayer = user.id === window.playerId;
        const currentPlayerIcon = isCurrentPlayer ? '<span class="current-player-icon"></span>' : '';
        if (isCurrentPlayer) currentPlayerHighScore = user.score;
        leaderboardHtml += `<tr><td>${rank}</td><td>${avatarHtml}${user.name}${currentPlayerIcon}</td><td>${user.score}</td></tr>`;
    });
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) leaderboardElement.innerHTML = leaderboardHtml;
    
    const totalPlayersElement = document.getElementById('total-players');
    if (totalPlayersElement) totalPlayersElement.textContent = `Total Players: ${leaderboardData.length}`;
    
    const lastScoreElement = document.getElementById('your-last-score');
    if (lastScoreElement) lastScoreElement.textContent = `Your Last Score: ${window.lastScore || 0}`;
    
    const newHighScoreElement = document.getElementById('new-high-score');
    if (newHighScoreElement) {
        if (window.currentScore > currentPlayerHighScore) {
            newHighScoreElement.textContent = `New High Score: ${window.currentScore}`;
            newHighScoreElement.style.display = 'block';
        } else {
            newHighScoreElement.style.display = 'none';
        }
    }
}

// UI management functions
function showUsernameOverlay() {
    const usernameOverlay = document.getElementById('username-overlay');
    if (usernameOverlay) usernameOverlay.style.display = 'flex';
}

function hideUsernameOverlay() {
    const usernameOverlay = document.getElementById('username-overlay');
    if (usernameOverlay) usernameOverlay.style.display = 'none';
}

function showLeaderboardOverlay() {
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    if (leaderboardOverlay) leaderboardOverlay.style.display = 'flex';
}

function hideLeaderboardOverlay() {
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    if (leaderboardOverlay) leaderboardOverlay.style.display = 'none';
}

// Countdown timer
function updateCountdown() {
    const now = new Date();
    const target = new Date("2024-07-21T00:00:00Z");
    
    const countdownElement = document.getElementById('leaderboard-countdown');
    if (!countdownElement) return;

    if (now >= target) {
        countdownElement.textContent = "Leaderboard reset is in progress!";
        return;
    }
    
    const timeLeft = target - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    countdownElement.textContent = `Leaderboard resets in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function startCountdownTimer() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
    const saveUsernameButton = document.getElementById('save-username-button');
    if (saveUsernameButton) {
        saveUsernameButton.addEventListener('click', function() {
            const usernameInput = document.getElementById('username-input');
            if (!usernameInput) return;

            const username = usernameInput.value.trim();
            if (username) {
                window.playerId = 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
                window.playerName = username;
                localStorage.setItem('playerId', window.playerId);
                localStorage.setItem('playerName', username);
                updateFirebaseScore(window.playerId, username, 0);
                hideUsernameOverlay();
                showLeaderboardOverlay();
            }
        });
    }

    const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
    if (closeLeaderboardButton) {
        closeLeaderboardButton.addEventListener('click', hideLeaderboardOverlay);
    }

    // Initialize countdown timer
    startCountdownTimer();

    // Initialize the game
    initializeGame();
});