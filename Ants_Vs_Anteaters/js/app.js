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
    // Generate a unique player ID to avoid duplicates
    return 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
}

// App initialization and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', function() {
        hideStartOverlay();
        resumeGame();
    });

    document.getElementById('leaderboard-button').addEventListener('click', function() {
        updateLeaderboard().then(() => {
            hideStartOverlay();
            showLeaderboardOverlay();
        });
    });

    document.getElementById('back-to-start-button').addEventListener('click', function() {
        hideLeaderboardOverlay();
        showStartOverlay();
    });

    document.getElementById('close-leaderboard-button').addEventListener('click', function() {
        hideLeaderboardOverlay();
        resumeGame();
    });

    document.getElementById('save-username-button').addEventListener('click', function() {
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();
        if (username) {
            const playerId = getUniquePlayerId();
            updateFirebaseScore(playerId, username, window.currentScore);
            hideUsernameOverlay();
            showLeaderboardOverlay();
        }
    });
}

// Game state management functions
function pauseGame() {
    if (window.engine) window.engine.pause();
}

function resumeGame() {
    if (window.engine) window.engine.play();
}

function showStartOverlay() {
    pauseGame();
    document.getElementById('start-overlay').style.display = 'flex';
}

function hideStartOverlay() {
    document.getElementById('start-overlay').style.display = 'none';
}

function showLeaderboardOverlay() {
    pauseGame();
    document.getElementById('leaderboard-overlay').style.display = 'flex';
}

function hideLeaderboardOverlay() {
    document.getElementById('leaderboard-overlay').style.display = 'none';
}

function showUsernameOverlay() {
    pauseGame();
    document.getElementById('username-overlay').style.display = 'flex';
}

function hideUsernameOverlay() {
    document.getElementById('username-overlay').style.display = 'none';
}

function showEndgameOverlay() {
    pauseGame();
    document.getElementById('final-score').textContent = `Your Score: ${window.currentScore}`;
    document.getElementById('endgame-overlay').style.display = 'flex';
}

function hideEndgameOverlay() {
    document.getElementById('endgame-overlay').style.display = 'none';
}

// Leaderboard functionality
function updateFirebaseScore(playerId, username, score) {
    const userRef = firebase.database().ref('users/' + playerId);
    userRef.set({
        id: playerId,
        name: username,
        score: score
    });
    window.lastScore = score;
}

function updateLeaderboard() {
    return new Promise((resolve, reject) => {
        const leaderboardRef = firebase.database().ref('users');
        leaderboardRef.orderByChild('score').once('value', (snapshot) => {
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
    let leaderboardHtml = '<tr><th>Rank</th><th>Player Name</th><th>Top Kills</th></tr>';
    let currentPlayerHighScore = 0;
    leaderboardData.forEach((user, index) => {
        const rank = index + 1;
        const initials = user.name.charAt(0).toUpperCase();
        const avatarHtml = `<div class="avatar">${initials}</div>`;
        const isCurrentPlayer = window.playerId === user.id;
        const currentPlayerIcon = isCurrentPlayer ? '<span class="current-player-icon"></span>' : '';
        if (isCurrentPlayer) currentPlayerHighScore = user.score;
        leaderboardHtml += `<tr><td>${rank}</td><td>${avatarHtml}${user.name}${currentPlayerIcon}</td><td>${user.score}</td></tr>`;
    });
    document.getElementById('leaderboard').innerHTML = leaderboardHtml;
    document.getElementById('total-ants').textContent = `Total Players: ${leaderboardData.length}`;
    document.getElementById('your-last-score').textContent = `Your Last Score: ${window.lastScore}`;
    if (window.currentScore > currentPlayerHighScore) {
        document.getElementById('new-high-score').textContent = `New High Score: ${window.currentScore}`;
        document.getElementById('new-high-score').style.display = 'block';
    } else {
        document.getElementById('new-high-score').style.display = 'none';
    }
}

// Game engine logic
function onEngineLoad() {
    gse.ready(function(gseEngine) {
        window.engine = gseEngine;
        var loadingElement = document.getElementById('gse-loading');
        var playerDelegate = {
            onTouchPressed: function() {
                if (navigator.vibrate) navigator.vibrate(50);
            },
            onGameCenterPostScore: function(score, leaderboard) {
                window.currentScore = score;
                if (window.playerId) updateFirebaseScore(window.playerId, window.playerName, score);
            },
            onGameCenterShowLeaderboard: function(leaderboard) {
                updateLeaderboard().then(() => {
                    if (window.playerId) {
                        showLeaderboardOverlay();
                    } else {
                        showUsernameOverlay();
                    }
                });
            },
            onLoadingBegin: function() {
                engine.showOverlay();
                loadingElement.style.visibility = 'visible';
            },
            onLoadingEnd: function() {
                loadingElement.style.visibility = 'hidden';
                engine.hideOverlay();
            },
            onGameReady: function(width, height) {
                // Check if the player has a stored ID and name
                const storedPlayerId = localStorage.getItem('playerId');
                const storedPlayerName = localStorage.getItem('playerName');
                if (storedPlayerId && storedPlayerName) {
                    window.playerId = storedPlayerId;
                    window.playerName = storedPlayerName;
                } else {
                    showUsernameOverlay();
                }
                showStartOverlay();
            },
            onWindowResize: function() {
                engine.relayout();
            }
        };

        engine.appendDelegate(playerDelegate);
        window.addEventListener('resize', playerDelegate.onWindowResize, false);
        engine.setRenderFrame('gse-player');
        engine.setOptions({
            'viewport-reference': 'window',
            'viewport-fit': 'letterbox'
        });
        engine.loadOptionsFromURL();
    });
}