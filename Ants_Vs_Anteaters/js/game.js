document.addEventListener('DOMContentLoaded', function() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
    }
});

(function(global) {
    var currentScore = 0;
    var lastScore = 0;
    var telegramUser = null;
    var engine = null;

    global.onEngineLoad = function() {
        gse.ready(function(gseEngine) {
            engine = gseEngine;
            var loadingElement = document.getElementById('gse-loading');
            var playerDelegate = {
                onTouchPressed: function() {
                    if (navigator.vibrate) navigator.vibrate(50);
                },
                onGameCenterPostScore: function(score, leaderboard) {
                    currentScore = score;
                    if (telegramUser) updateFirebaseScore(telegramUser.id, telegramUser.displayName, score);
                },
                onGameCenterShowLeaderboard: function(leaderboard) {
                    updateLeaderboard().then(() => {
                        showEndgameOverlay();
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
                    if (window.Telegram && window.Telegram.WebApp) {
                        telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
                        if (telegramUser) {
                            let displayName = telegramUser.username;
                            if (!displayName) {
                                displayName = telegramUser.first_name;
                                if (telegramUser.last_name) displayName += ' ' + telegramUser.last_name;
                            }
                            telegramUser.displayName = displayName;
                            document.getElementById('telegram-username').textContent = displayName;
                            engine.postEvent('externalWriteGameAttribute', null, "game.attributes.telegramUser", {
                                id: telegramUser.id,
                                name: displayName
                            });
                        }
                    }
                    showStartOverlay();
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

        document.getElementById('back-to-start-button').addEventListener('click', function() {
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
    }

    function pauseGame() {
        if (engine) engine.pause();
    }

    function resumeGame() {
        if (engine) engine.play();
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
    }

    function showEndgameOverlay() {
        pauseGame();
        document.getElementById('final-score').textContent = `Your Score: ${currentScore}`;
        document.getElementById('endgame-overlay').style.display = 'flex';
    }

    function hideEndgameOverlay() {
        document.getElementById('endgame-overlay').style.display = 'none';
    }

    // These functions need to be implemented
    function updateFirebaseScore(userId, displayName, score) {
        // Implement Firebase score update logic here
    }

    function updateLeaderboard() {
        // Implement leaderboard update logic here
        return Promise.resolve(); // Replace with actual implementation
    }

    function startCountdownTimer() {
        // Implement countdown timer logic here
    }

    // Expose necessary functions to global scope
    global.pauseGame = pauseGame;
    global.resumeGame = resumeGame;
    global.showStartOverlay = showStartOverlay;
    global.hideStartOverlay = hideStartOverlay;
    global.showLeaderboardOverlay = showLeaderboardOverlay;
    global.hideLeaderboardOverlay = hideLeaderboardOverlay;
    global.showEndgameOverlay = showEndgameOverlay;
    global.hideEndgameOverlay = hideEndgameOverlay;

})(window);