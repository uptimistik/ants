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
                window.appFunctions.updateFirebaseScore(score);
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
                if (loadingElement) loadingElement.style.visibility = 'visible';
            },
            onLoadingEnd: function() {
                console.log("Loading ended");
                if (loadingElement) loadingElement.style.visibility = 'hidden';
                engine.hideOverlay();
            },
            onGameReady: function(width, height) {
                console.log("Game ready. Width:", width, "Height:", height);
                startGame();
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

// Start game function
function startGame() {
    console.log("Starting game");
    window.appFunctions.resumeGame();
}

// Make sure onEngineLoad is globally accessible
window.onEngineLoad = onEngineLoad;