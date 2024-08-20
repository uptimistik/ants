// ... (keep the existing Firebase configuration)

// Utility functions
function getTelegramDisplayName(user) {
    let displayName = user.username;
    if (!displayName) {
        displayName = user.first_name;
        if (user.last_name) displayName += ' ' + user.last_name;
    }
    return displayName;
}

// App initialization and event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        console.log("Telegram WebApp ready");
    } else {
        console.error("Telegram WebApp not available");
    }
    setupEventListeners();
});

// ... (keep the existing setupEventListeners function)

// Game state management functions
function pauseGame() {
    console.log("Pausing game");
    if (window.engine) window.engine.pause();
}

function resumeGame() {
    console.log("Resuming game");
    if (window.engine) window.engine.play();
}

// ... (keep other existing functions)

// Leaderboard functionality
function updateFirebaseScore(userId, userName, score) {
    console.log("Updating Firebase score for user:", userName, "Score:", score);
    const userRef = firebase.database().ref('users/' + userId);
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val();
        if (!userData || userData.score < score) {
            userRef.set({
                id: userId,
                name: userName,
                score: score
            });
            console.log("Score updated in Firebase");
        }
        window.lastScore = score;
    }).catch(error => {
        console.error("Error updating Firebase score:", error);
    });
}

// ... (keep the existing updateInGameLeaderboard function)

// Error handling function
function handleError(error) {
    console.error("An error occurred:", error);
    // You can add more sophisticated error handling here, like showing an error message to the user
}

// Export functions that need to be accessed by game.js
window.appFunctions = {
    getTelegramDisplayName,
    resumeGame,
    showInGameLeaderboard,
    showEndgameOverlay,
    updateInGameLeaderboard,
    updateFirebaseScore,
    handleError
};