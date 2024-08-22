(function(global) {
    var currentScore = 0;
    var engine = null;

    global.onEngineLoad = function() {
        gse.ready(function(gseEngine) {
            engine = gseEngine;
            var loadingElement = document.getElementById('gse-loading');
            var playerDelegate = {
                onGameCenterPostScore: function(score, leaderboard) {
                    currentScore = score;
                    updateFirebaseScore(score);
                },
                onGameCenterShowLeaderboard: function(leaderboard) {
                    updateLeaderboard().then(() => {
                        showLeaderboardOverlay();
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

            setupEventListeners();
        });
    };

    function setupEventListeners() {
        document.getElementById('close-leaderboard-button').addEventListener('click', function() {
            hideLeaderboardOverlay();
            resumeGame();
        });
    }

    function updateFirebaseScore(score) {
        const userId = localStorage.getItem('antUserId');
        const username = localStorage.getItem('antUsername');
        if (userId && username) {
            firebase.database().ref('leaderboard/' + userId).set({
                username: username,
                score: score
            });
        }
    }

    function updateLeaderboard() {
        return firebase.database().ref('leaderboard').orderByChild('score').limitToLast(10).once('value')
            .then((snapshot) => {
                let leaderboardHTML = '<ol>';
                const leaderboardData = [];
                snapshot.forEach((childSnapshot) => {
                    leaderboardData.unshift(childSnapshot.val());
                });
                leaderboardData.forEach((entry) => {
                    leaderboardHTML += `<li>${entry.username}: ${entry.score}</li>`;
                });
                leaderboardHTML += '</ol>';
                document.getElementById('leaderboard-content').innerHTML = leaderboardHTML;
            });
    }

    function pauseGame() {
        if (engine) engine.pause();
    }

    function resumeGame() {
        if (engine) engine.play();
    }

    function showLeaderboardOverlay() {
        pauseGame();
        document.getElementById('leaderboard-overlay').style.display = 'flex';
    }

    function hideLeaderboardOverlay() {
        document.getElementById('leaderboard-overlay').style.display = 'none';
    }

    // Expose necessary functions to global scope
    global.pauseGame = pauseGame;
    global.resumeGame = resumeGame;
    global.showLeaderboardOverlay = showLeaderboardOverlay;
    global.hideLeaderboardOverlay = hideLeaderboardOverlay;

})(window);