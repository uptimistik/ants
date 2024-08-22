// Global UI functions
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
    startCountdownTimer();
}

function hideLeaderboardOverlay() {
    document.getElementById('leaderboard-overlay').style.display = 'none';
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

(function(global) {
    var currentScore = 0,
        lastScore = 0,
        telegramUser = null,
        engine = null;

    global.onEngineLoad = function() {
        gse.ready(function(gseEngine) {
            engine = gseEngine;
            window.engine = engine;  // Make engine globally accessible
            var loadingElement = document.getElementById('gse-loading');
            var playerDelegate = {
                // ... (keep the existing delegate methods)
            };

            engine.appendDelegate(playerDelegate);
            window.addEventListener('resize', playerDelegate.onWindowResize, false);
            engine.setRenderFrame('gse-player');
            engine.setOptions({
                'viewport-reference': 'window',
                'viewport-fit': 'letterbox'
            });
            engine.loadOptionsFromURL();

            // Event Listeners
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

            document.getElementById('close-leaderboard-button').addEventListener('click', function() {
                hideLeaderboardOverlay();
                showStartOverlay();
            });

            document.getElementById('view-leaderboard-button').addEventListener('click', function() {
                updateLeaderboard().then(() => {
                    hideEndgameOverlay();
                    showLeaderboardOverlay();
                });
            });

            document.getElementById('share-button').addEventListener('click', function() {
                if (window.Telegram && window.Telegram.WebApp) {
                    const shareText = encodeURIComponent(`I just scored ${currentScore} kills in Ant Game! Can you beat me?`);
                    const shareUrl = `https://t.me/share/url?url=https://t.me/@Antsgame_bot&text=${shareText}`;
                    window.Telegram.WebApp.openTelegramLink(shareUrl);
                }
            });

            document.getElementById('replay-button').addEventListener('click', function() {
                hideEndgameOverlay();
                showStartOverlay();
                engine.postEvent('resetGame', null, null, null);
            });
        });
    };

    // ... (keep the existing functions like updateFirebaseScore, updateLeaderboard, etc.)

    function startCountdownTimer() {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

})(window);