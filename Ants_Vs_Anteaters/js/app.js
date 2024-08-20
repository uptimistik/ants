(function() {
    console.log("app.js started executing");

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCeS_7ev8inI1yvzkljhJn_IU7z5cJIp9k",
        authDomain: "antsgame-204c1.firebaseapp.com",
        databaseURL: "https://antsgame-204c1-default-rtdb.firebaseio.com",
        projectId: "antsgame-204c1",
        storageBucket: "antsgame-204c1.appspot.com",
        messagingSenderId: "580715522171",
        appId: "1:580715522171:web:0bba6c6a16399dc3fe5ade",
        measurementId: "G-E0JEEGY1GR"
    };

    firebase.initializeApp(firebaseConfig);

    // Game state management functions
    function pauseGame() {
        console.log("Pausing game");
        if (window.engine) window.engine.pause();
    }

    function resumeGame() {
        console.log("Resuming game");
        if (window.engine) window.engine.play();
    }

    function showInGameLeaderboard() {
        console.log("Showing in-game leaderboard");
        pauseGame();
        document.getElementById('in-game-leaderboard-overlay').style.display = 'flex';
    }

    function hideInGameLeaderboard() {
        console.log("Hiding in-game leaderboard");
        document.getElementById('in-game-leaderboard-overlay').style.display = 'none';
        resumeGame();
    }

    function showEndgameOverlay() {
        console.log("Showing endgame overlay");
        pauseGame();
        document.getElementById('final-score').textContent = `Your Score: ${window.currentScore}`;
        document.getElementById('endgame-overlay').style.display = 'flex';
    }

    function hideEndgameOverlay() {
        console.log("Hiding endgame overlay");
        document.getElementById('endgame-overlay').style.display = 'none';
    }

    // Leaderboard functionality
    function updateFirebaseScore(score) {
        console.log("Updating Firebase score:", score);
        const userRef = firebase.database().ref('users').push();
        userRef.set({
            score: score,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log("Score updated in Firebase");
        }).catch(error => {
            console.error("Error updating Firebase score:", error);
        });
    }

    function updateInGameLeaderboard() {
        console.log("Updating in-game leaderboard");
        return new Promise((resolve, reject) => {
            const leaderboardRef = firebase.database().ref('users');
            leaderboardRef.orderByChild('score').limitToLast(10).once('value', (snapshot) => {
                const leaderboardData = [];
                snapshot.forEach((childSnapshot) => {
                    leaderboardData.unshift({
                        id: childSnapshot.key,
                        score: childSnapshot.val().score
                    });
                });
                
                let leaderboardHtml = '<tr><th>Rank</th><th>Score</th></tr>';
                leaderboardData.forEach((entry, index) => {
                    const rank = index + 1;
                    leaderboardHtml += `<tr><td>${rank}</td><td>${entry.score}</td></tr>`;
                });
                document.getElementById('in-game-leaderboard').innerHTML = leaderboardHtml;
                resolve();
            }, (error) => {
                console.error("Error fetching in-game leaderboard data:", error);
                reject(error);
            });
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        document.getElementById('view-leaderboard-button').addEventListener('click', function() {
            updateInGameLeaderboard().then(() => {
                hideEndgameOverlay();
                showInGameLeaderboard();
            });
        });

        document.getElementById('replay-button').addEventListener('click', function() {
            hideEndgameOverlay();
            if (window.engine) {
                window.engine.postEvent('resetGame', null, null, null);
            }
        });

        document.getElementById('close-leaderboard-button').addEventListener('click', function() {
            hideInGameLeaderboard();
        });
    }

    // App initialization
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM fully loaded");
        setupEventListeners();
    });

    // Export functions that need to be accessed by game.js
    window.appFunctions = {
        resumeGame,
        showInGameLeaderboard,
        showEndgameOverlay,
        updateInGameLeaderboard,
        updateFirebaseScore
    };

    console.log("app.js finished executing, appFunctions exported:", Object.keys(window.appFunctions));
})();