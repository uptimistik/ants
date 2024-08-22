(function(global) {
    var currentScore = 0,
        lastScore = 0,
        telegramUser = null,
        engine = null;

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

            // Event listeners
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
        });
    };

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

    function updateFirebaseScore(userId, userName, score) {
        const userRef = firebase.database().ref('users/' + userId);
        userRef.once('value').then((snapshot) => {
            const userData = snapshot.val();
            if (!userData || userData.score < score) {
                userRef.set({
                    id: userId,
                    name: userName,
                    score: score
                });
            }
            lastScore = score;
        });
    }

    function updateLeaderboard() {
        return new Promise((resolve, reject) => {
            const leaderboardRef = firebase.database().ref('users');
            leaderboardRef.orderByChild('score').once('value', (snapshot) => {
                const leaderboardData = [];
                snapshot.forEach((childSnapshot) => {
                    leaderboardData.unshift({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                updateLeaderboardWithCurrentPlayer(leaderboardData);
                resolve();
            }, (error) => {
                console.error("Error fetching leaderboard data:", error);
                reject(error);
            });
        });
    }

    function updateLeaderboardWithCurrentPlayer(leaderboardData) {
        let leaderboardHtml = '<tr><th>Rank</th><th>Ant Name</th><th>Top Kills</th></tr>';
        let currentPlayerHighScore = 0;
        leaderboardData.forEach((user, index) => {
            const rank = index + 1;
            const initials = user.name.charAt(0).toUpperCase();
            const avatarHtml = `<div class="avatar">${initials}</div>`;
            const isCurrentPlayer = user.id === telegramUser.id;
            const currentPlayerIcon = isCurrentPlayer ? '<span class="current-player-icon"></span>' : '';
            if (isCurrentPlayer) currentPlayerHighScore = user.score;
            leaderboardHtml += `<tr><td>${rank}</td><td>${avatarHtml}${user.name}${currentPlayerIcon}</td><td>${user.score}</td></tr>`;
        });
        document.getElementById('leaderboard').innerHTML = leaderboardHtml;
        document.getElementById('total-ants').textContent = `Total Ants: ${leaderboardData.length}`;
        document.getElementById('your-last-score').textContent = `Your Last Score: ${lastScore}`;
        if (currentScore > currentPlayerHighScore) {
            document.getElementById('new-high-score').textContent = `New High Score: ${currentScore}`;
            document.getElementById('new-high-score').style.display = 'block';
        } else {
            document.getElementById('new-high-score').style.display = 'none';
        }
    }

    function updateCountdown() {
        const now = new Date();
        const target = new Date("2024-07-21T00:00:00Z");
        
        if (now >= target) {