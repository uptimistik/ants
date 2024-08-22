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
                if (window.playerId) {
                    updateLeaderboard().then(() => {
                        showLeaderboardOverlay();
                    });
                } else {
                    showUsernameOverlay();
                }
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
                }
                // Start the game immediately without showing any overlay
                resumeGame();
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

// Leaderboard functionality
function updateFirebaseScore(playerId, playerName, score) {
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
    });
}

function updateLeaderboard() {
    return new Promise((resolve, reject) => {
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
    document.getElementById('leaderboard').innerHTML = leaderboardHtml;
    document.getElementById('total-players').textContent = `Total Players: ${leaderboardData.length}`;
    document.getElementById('your-last-score').textContent = `Your Last Score: ${window.lastScore || 0}`;
    if (window.currentScore > currentPlayerHighScore) {
        document.getElementById('new-high-score').textContent = `New High Score: ${window.currentScore}`;
        document.getElementById('new-high-score').style.display = 'block';
    } else {
        document.getElementById('new-high-score').style.display = 'none';
    }
}

// UI management functions
function showUsernameOverlay() {
    pauseGame();
    document.getElementById('username-overlay').style.display = 'flex';
}

function hideUsernameOverlay() {
    document.getElementById('username-overlay').style.display = 'none';
    resumeGame();
}

function showLeaderboardOverlay() {
    pauseGame();
    document.getElementById('leaderboard-overlay').style.display = 'flex';
}

function hideLeaderboardOverlay() {
    document.getElementById('leaderboard-overlay').style.display = 'none';
    resumeGame();
}

// Game state management
function pauseGame() {
    if (window.engine) window.engine.pause();
}

function resumeGame() {
    if (window.engine) window.engine.play();
}

// Countdown timer
function updateCountdown() {
    const now = new Date();
    const target = new Date("2024-07-21T00:00:00Z");
    
    if (now >= target) {
        document.getElementById('leaderboard-countdown').textContent = "Leaderboard reset is in progress!";
        return;
    }
    
    const timeLeft = target - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    document.getElementById('leaderboard-countdown').textContent = 
        `Leaderboard resets in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function startCountdownTimer() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Initialize countdown timer
startCountdownTimer();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('save-username-button').addEventListener('click', function() {
        const usernameInput = document.getElementById('username-input');
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

    document.getElementById('close-leaderboard-button').addEventListener('click', hideLeaderboardOverlay);
});

// Load the game engine
onEngineLoad();