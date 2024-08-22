(function(global) {
    var currentScore = 0,
        lastScore = 0,
        engine = null;

    global.onEngineLoad = function() {
        gse.ready(function(gseEngine) {
            engine = gseEngine;
            window.engine = engine;
            var loadingElement = document.getElementById('gse-loading');
            var playerDelegate = {
                onTouchPressed: function() {
                    if (navigator.vibrate) navigator.vibrate(50);
                },
                onGameCenterPostScore: function(score, leaderboard) {
                    currentScore = score;
                    window.currentScore = currentScore;
                    updateFirebaseScore(score);
                },
                onGameCenterShowLeaderboard: function(leaderboard) {
                    updateLeaderboard();
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
                    engine.play();
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
    };

    function updateFirebaseScore(score) {
        // Implement this function if you want to update scores to Firebase
        // You'll need to generate a unique user ID or use some other identifier
        console.log("Score updated:", score);
    }

    function updateLeaderboard() {
        // Implement this function if you want to fetch and display leaderboard data
        console.log("Leaderboard updated");
    }

})(window);