document.addEventListener('DOMContentLoaded', function() {
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
    const database = firebase.database();

    let playerName = null;
    let userId = null;

    function showUsernameOverlay() {
        document.getElementById('username-overlay').style.display = 'flex';
    }

    function hideUsernameOverlay() {
        document.getElementById('username-overlay').style.display = 'none';
        document.getElementById('gse-player').style.display = 'block';
    }

    function saveUsernameToFirebase(username) {
        if (!userId) return;

        database.ref('users/' + userId).set({ username: username })
            .then(() => {
                playerName = username;
                hideUsernameOverlay();
                startGame();
            })
            .catch(error => {
                console.error('Error saving username:', error);
                document.getElementById('error-message').textContent = 'Failed to save username. Try again.';
            });
    }

    function startGame() {
        // Your game initialization code here
        console.log('Game starting...');
    }

    function saveScoreToFirebase(score) {
        if (!playerName) {
            console.error('Username is required before saving score');
            return;
        }

        const scoresRef = database.ref('scores');
        const newScoreRef = scoresRef.push();
        newScoreRef.set({
            name: playerName,
            score: score
        }).catch(error => {
            console.error('Error saving score:', error);
        });
    }

    function loadLeaderboard() {
        const scoresRef = database.ref('scores').orderByChild('score').limitToLast(10);
        scoresRef.once('value', (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.unshift(childSnapshot.val());
            });
            displayLeaderboard(scores);
        }).catch(error => {
            console.error('Error loading leaderboard:', error);
        });
    }

    function displayLeaderboard(scores) {
        const leaderboardElement = document.getElementById('top-players');
        leaderboardElement.innerHTML = '';
        scores.forEach((entry) => {
            const entryElement = document.createElement('div');
            entryElement.textContent = `${entry.name}: ${entry.score}`;
            leaderboardElement.appendChild(entryElement);
        });
    }

    function checkUser() {
        window.Telegram.WebApp.ready(() => {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user && user.id) {
                userId = user.id;
                database.ref('users/' + userId).once('value').then(snapshot => {
                    const userData = snapshot.val();
                    if (userData && userData.username) {
                        playerName = userData.username;
                        hideUsernameOverlay();
                        startGame();
                    } else {
                        showUsernameOverlay();
                    }
                }).catch(error => {
                    console.error('Error retrieving user data:', error);
                    showUsernameOverlay();
                });
            } else {
                showUsernameOverlay();
            }
        });
    }

    document.getElementById('submit-username').addEventListener('click', () => {
        const username = document.getElementById('username-input').value.trim();
        if (username) {
            saveUsernameToFirebase(username);
        } else {
            document.getElementById('error-message').textContent = 'Please enter a valid username.';
        }
    });

    function onGameCenterShowLeaderboard() {
        loadLeaderboard();
        document.getElementById('endgame-overlay').style.display = 'flex';
    }

    // Initialize check for user on load
    checkUser();
});
