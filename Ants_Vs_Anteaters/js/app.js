console.log("app.js file loaded");

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

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

console.log("End of app.js file reached");