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
    window.Telegram.WebApp.ready();
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
            const shareText = encodeURIComponent(`I just scored ${window.currentScore} kills in Ant Game! Can you beat me?`);
            const shareUrl = `https://t.me/share/url?url=https://t.me/@Antsgame_bot&text=${shareText}`;
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        }
    });

    document.getElementById('replay-button').addEventListener('click', function() {
        hideEndgameOverlay();
        window.engine.postEvent('resetGame', null, null, null);
    });

    document.getElementById('close-leaderboard-button').addEventListener('click', function() {
        hideInGameLeaderboard();
    });
}

// Game state management functions
function pauseGame() {
    if (window.engine) window.engine.pause();
}

function resumeGame() {
    if (window.engine) window.engine.play();
}

function showInGameLeaderboard() {
    pauseGame();
    document.getElementById('in-game-leaderboard-overlay').style.display = 'flex';
}

function hideInGameLeaderboard() {
    document.getElementById('in-game-leaderboard-overlay').style.display = 'none';
    resumeGame();
}

function showEndgameOverlay() {
    pauseGame();
    document.getElementById('final-score').textContent = `Your Score: ${window.currentScore}`;
    document.getElementById('endgame-overlay').style.display = 'flex';
}

function hideEndgameOverlay() {
    document.getElementById('endgame-overlay').style.display = 'none';
}