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
                if (window.Telegram && window.Telegram.WebApp) {
                    window.telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
                    if (window.telegramUser) {
                        let displayName = getTelegramDisplayName(window.telegramUser);
                        window.telegramUser.displayName = displayName;
                        engine.postEvent('externalWriteGameAttribute', null, "game.attributes.telegramUser", {
                            id: window.telegramUser.id,
                            name: displayName
                        });
                    }
                }
                // Start the game immediately
                resumeGame();
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

// Leaderboard functionality
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
        window.lastScore = score;
    });
}

function updateInGameLeaderboard() {
    return new Promise((resolve, reject) => {
        const leaderboardRef = firebase.database().ref('users');
        leaderboardRef.orderByChild('score').limitToLast(10).once('value', (snapshot) => {
            const leaderboardData = [];
            snapshot.forEach((childSnapshot) => {
                leaderboardData.unshift({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            let leaderboardHtml = '<tr><th>Rank</th><th>Ant Name</th><th>Top Kills</th></tr>';
            leaderboardData.forEach((user, index) => {
                const rank = index + 1;
                const initials = user.name.charAt(0).toUpperCase();
                const avatarHtml = `<div class="avatar">${initials}</div>`;
                const isCurrentPlayer = user.id === window.telegramUser.id;
                const currentPlayerIcon = isCurrentPlayer ? '<span class="current-player-icon"></span>' : '';
                leaderboardHtml += `<tr><td>${rank}</td><td>${avatarHtml}${user.name}${currentPlayerIcon}</td><td>${user.score}</td></tr>`;
            });
            document.getElementById('in-game-leaderboard').innerHTML = leaderboardHtml;
            resolve();
        }, (error) => {
            console.error("Error fetching in-game leaderboard data:", error);
            reject(error);
        });
    });
}

// Countdown timer
function updateCountdown() {
    const now = new Date();
    const target = new Date("2024-07-21T00:00:00Z");
    
    if (now >= target) {
        document.getElementById('leaderboard-countdown').textContent = "Leaderboard reset is in progress!";
        return;
    }
    
    const timeLeft = target - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    document.getElementById('leaderboard-countdown').textContent = 
        `Leaderboard resets in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function startCountdownTimer() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}