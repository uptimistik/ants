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

  let userId = null;
  let playerName = 'Unknown';

  function showUsernameOverlay() {
    document.getElementById('username-overlay').style.display = 'flex';
    document.getElementById('game-content').style.display = 'none';
  }

  function hideUsernameOverlay() {
    document.getElementById('username-overlay').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
  }

  function saveUsernameToFirebase(username) {
    if (userId) {
      database.ref('users/' + userId).set({ username: username });
    }
  }

  function saveScoreToFirebase(score) {
    if (!playerName || playerName === 'Unknown') {
      console.error('Username is required before saving score');
      return;
    }
    const scoresRef = database.ref('scores');
    const newScoreRef = scoresRef.push();
    newScoreRef.set({
      name: playerName,
      score: score
    });
  }

  document.getElementById('submit-username').addEventListener('click', function() {
    const usernameInput = document.getElementById('username-input').value;
    if (usernameInput) {
      playerName = usernameInput;
      saveUsernameToFirebase(usernameInput);
      hideUsernameOverlay();
      // Initialize or start the game here
    }
  });

  // Initialize Telegram Web App
  window.Telegram.WebApp.ready(() => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user && user.id) {
      userId = user.id;
      database.ref('users/' + userId).once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData && userData.username) {
          playerName = userData.username;
          hideUsernameOverlay();
          // Initialize or start the game here
        } else {
          showUsernameOverlay();
        }
      });
    } else {
      showUsernameOverlay();
    }
  });
});
