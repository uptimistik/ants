console.log('game.js loaded');

// Game engine logic
function onEngineLoad() {
    console.log("onEngineLoad called");
    gse.ready(function(gseEngine) {
        console.log("gse.ready callback executed");
        window.engine = gseEngine;
        var loadingElement = document.getElementById('gse-loading');
        var playerDelegate = {
            onTouchPressed: function() {
                if (navigator.vibrate) navigator.vibrate(50);
            },
            onGameCenterPostScore: function(score, leaderboard) {
                console.log("Score posted:", score);
                window.currentScore = score;
                if (window.telegramUser) window.appFunctions.updateFirebaseScore(window.telegramUser.id, window.telegramUser.displayName, score);
            },
            onGameCenterShowLeaderboard: function(leaderboard) {
                console.log("Show leaderboard requested");
                window.appFunctions.updateInGameLeaderboard().then(() => {
                    window.appFunctions.showInGameLeaderboard();
                }).catch(error => {
                    console.error("Error updating leaderboard:", error);
                });
            },
            onLoadingBegin: function() {
                console.log("Loading began");
                engine.showOverlay();
                loadingElement.style.visibility = 'visible';
            },
            onLoadingEnd: function() {
                console.log("Loading ended");
                loadingElement.style.visibility = 'hidden';
                engine.hideOverlay();
            },
            onGameReady: function(width, height) {
                console.log("Game ready. Width:", width, "Height:", height);
                initializePlayer().then(() => {
                    console.log("Player initialized, starting game");
                    startGame();
                }).catch(error => {
                    console.error("Error initializing player:", error);
                    window.appFunctions.handleError(error);
                });
            },
            onWindowResize: function() {
                console.log("Window resized");
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
    console.log("Initializing player");
    return new Promise((resolve, reject) => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            if (window.telegramUser) {
                let displayName = window.appFunctions.getTelegramDisplayName(window.telegramUser);
                window.telegramUser.displayName = displayName;
                engine.postEvent('externalWriteGameAttribute', null, "game.attributes.telegramUser", {
                    id: window.telegramUser.id,
                    name: displayName
                });
                console.log("Player initialized:", displayName);
                resolve();
            } else {
                reject("No Telegram user found");
            }
        } else {
            reject("Telegram WebApp not available");
        }
    });
}

// Start game function
function startGame() {
    console.log("Starting game");
    window.appFunctions.resumeGame();
}

// Make sure onEngineLoad is globally accessible
window.onEngineLoad = onEngineLoad;