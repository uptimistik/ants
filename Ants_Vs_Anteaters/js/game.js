console.log("game.js file loaded");

// Game engine initialization
function initializeGSE() {
    console.log("Initializing GSE");
    if (typeof gse === 'undefined') {
        console.error('GSE library not loaded');
        return;
    }

    gse.ready(function(gseEngine) {
        console.log("GSE ready");
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
                gseEngine.showOverlay();
                if (loadingElement) loadingElement.style.visibility = 'visible';
            },
            onLoadingEnd: function() {
                if (loadingElement) loadingElement.style.visibility = 'hidden';
                gseEngine.hideOverlay();
            },
            onGameReady: function(width, height) {
                console.log("Game ready");
                loadPlayerData();
                // Start the game
                gseEngine.play();
            },
            onWindowResize: function() {
                gseEngine.relayout();
            }
        };

        gseEngine.appendDelegate(playerDelegate);
        window.addEventListener('resize', playerDelegate.onWindowResize, false);
        gseEngine.setRenderFrame('gse-player');
        gseEngine.setOptions({
            'viewport-reference': 'window',
            'viewport-fit': 'letterbox'
        });
        gseEngine.loadOptionsFromURL();
    });
}

// ... rest of your existing functions ...

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");

    const saveUsernameButton = document.getElementById('save-username-button');
    if (saveUsernameButton) {
        console.log("Save username button found");
        saveUsernameButton.addEventListener('click', function() {
            // ... existing code ...
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

    console.log("Initializing GSE");
    initializeGSE();
});

console.log("End of game.js file reached");