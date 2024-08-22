(function(global) {
    var currentScore = 0,
        lastScore = 0,
        telegramUser = null,
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
                    if (telegramUser) updateFirebaseScore(telegramUser.id, telegramUser.displayName, score);
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
                    if (window.Telegram && window.Telegram.WebApp) {
                        telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
                        if (telegramUser) {
                            let displayName = telegramUser.username || telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : '');
                            telegramUser.displayName = displayName;
                            engine.postEvent('externalWriteGameAttribute', null, "game.attributes.telegramUser", {
                                id: telegramUser.id,
                                name: displayName
                            });
                        }
                    }
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
        const leaderboardRef = firebase.database().ref('users');
        leaderboardRef.orderByChild('score').limitToLast(10).once('value', (snapshot) => {
            const leaderboardData = [];
            snapshot.forEach((childSnapshot) => {
                leaderboardData.unshift({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            engine.postEvent('externalWriteGameAttribute', null, "game.attributes.leaderboard", leaderboardData);
        }, (error) => {
            console.error("Error fetching leaderboard data:", error);
        });
    }

})(window);