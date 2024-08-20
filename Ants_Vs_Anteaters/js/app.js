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
function getTelegramDisplayName(user) {
    let displayName = user.username;
    if (!displayName) {
        displayName = user.first_name;
        if (user.last_name) displayName += ' ' + user.last_name;
    }
    return displayName;
}

// App initialization and event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        console.log("Telegram WebApp ready");
    } else {
        console.error("Telegram WebApp not available");
    }
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('view-leaderboard-button').addEventListener('click', function() {
        updateInGameLeaderboard().then(() => {
            hideEndgameOverlay();
            showInGameLeaderboard();
        });
    });

    document.getElementById('share-button').addEventListener('click', function() {
        if (window.Telegram && window.Telegram.WebApp) {
            const shareText = encodeURIComponent(`I just scored ${window.currentScore} kills in Colony Clash! Can you beat me?`);
            const shareUrl = `https://t.me/share/url?url=https://t.me/@Antsgame_bot&text=${shareText}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        }
    });

    document.getElementById('replay-button').addEventListener('click', function() {
        hideEndgameOverlay();
        if (window.engine) {
            window.engine.postEvent('resetGame', null, null, null);
        }
    });

    document.getElementById('close-leaderboard-button').addEventListener('click', function() {
        hideInGameLeaderboard();
    });

    document.getElementById('back-to-start-button').addEventListener('click', function() {
        hideLeaderboardOverlay();
    });
}

// Game state management functions
function pauseGame() {
    console.log("Pausing game");
    if (window.engine) window.engine.pause();
}

function resumeGame() {
    console.log("Resuming game");
    if (window.engine) window.engine.play();
}

function showInGameLeaderboard() {
    console.log("Showing in-game leaderboard");
    pauseGame();
    document.getElementById('in-game-leaderboard-overlay').style.display = 'flex';
}

function hideInGameLeaderboard() {
    console.log("Hiding in-game leaderboard");
    document.getElementById('in-game-leaderboard-overlay').style.display = 'none';
    resumeGame();
}

function showLeaderboardOverlay() {
    console.log("Showing leaderboard overlay");
    pauseGame();
    document.getElementById('leaderboard-overlay').style.display = 'flex';
    startCountdownTimer();
}

function hideLeaderboardOverlay() {
    console.log("Hiding leaderboard overlay");
    document.getElementById('leaderboard-overlay').style.display = 'none';
    resumeGame();
}

function showEndgameOverlay() {
    console.log("Showing endgame overlay");
    pauseGame();
    document.getElementById('final-score').textContent = `Your Score: ${window.currentScore}`;
    document.getElementById('endgame-overlay').style.display = 'flex';
}

function hideEndgameOverlay() {
    console.log("Hiding endgame overlay");
    document.getElementById('endgame-overlay').style.display = 'none';
}

// Leaderboard functionality
function updateFirebaseScore(userId, userName, score) {
    console.log("Updating Firebase score for user:", userName, "Score:", score);
    const userRef = firebase.database().ref('users/' + userId);
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val();
        if (!userData || userData.score < score) {
            userRef.set({
                id: userId,
                name: userName,
                score: score
            });
            console.log("Score updated in Firebase");
        }
        window.lastScore = score;
    }).catch(error => {
        console.error("Error updating Firebase score:", error);
    });
}

function updateInGameLeaderboard() {
    console.log("Updating in-game leaderboard");
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
            
            let leaderboardHtml = '<tr><th>Rank</th><th>Ant Name</th><th>Top Kills</th></tr>';
            leaderboardData.forEach((user, index) => {
                const rank = index + 1;
                const initials = user.name.charAt(0).toUpperCase();
                const avatarHtml = `<div class="avatar">${initials}</div>`;
                const isCurrentPlayer = user.id === window.telegramUser.id;
                const currentPlayerIcon = isCurrentPlayer ? '<span class="current-player-icon"></span>' : '';
                leaderboardHtml += `<tr><td>${rank}</td><td>${avatarHtml}${user.name}${currentPlayerIcon}</td><td>${user.score}</td></tr>`;
            });
            document.getElementById('in-game-leaderboard').innerHTML = leaderboardHtml;
            resolve();
        }, (error) => {
            console.error("Error fetching in-game leaderboard data:", error);
            reject(error);
        });
    });
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

// Error handling function
function handleError(error) {
    console.error("An error occurred:", error);
    // You can add more sophisticated error handling here, like showing an error message to the user
}

// Export functions that need to be accessed by game.js
window.appFunctions = {
    getTelegramDisplayName,
    resumeGame,
    showInGameLeaderboard,
    showEndgameOverlay,
    updateInGameLeaderboard,
    updateFirebaseScore,
    handleError
};