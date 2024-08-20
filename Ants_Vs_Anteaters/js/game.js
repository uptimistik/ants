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
                if (window.telegramUser) updateFirebaseScore(window.telegramUser.id, window.telegramUser.displayName, score);
            },
            onGameCenterShowLeaderboard: function(leaderboard) {
                updateInGameLeaderboard().then(() => {
                    showInGameLeaderboard();
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
                initializePlayer().then(() => {
                    // Start the game after player initialization
                    resumeGame();
                }).catch(error => {
                    console.error("Error initializing player:", error);
                    // Handle error - maybe show an error message to the user
                });
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

// Initialize player function
function initializePlayer() {
    return new Promise((resolve, reject) => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            if (window.telegramUser) {
                let displayName = getTelegramDisplayName(window.telegramUser);
                window.telegramUser.displayName = displayName;
                engine.postEvent('externalWriteGameAttribute', null, "game.attributes.telegramUser", {
                    id: window.telegramUser.id,
                    name: displayName
                });
                resolve();
            } else {
                reject("No Telegram user found");
            }
        } else {
            reject("Telegram WebApp not available");
        }
    });
}

// Rest of the code remains the same...