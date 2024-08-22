<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Colony Clash - $ANT</title>
    <link rel="stylesheet" type="text/css" href="css/gse-style.css"/>
    <link rel="stylesheet" type="text/css" href="css/gse-style-loading.css"/>
    <link rel="stylesheet" type="text/css" href="css/styles.css"/>
</head>
<body>
    <div id="gse-player" class="gse-frame">
        <div class="gse-overlay">
            <div id="gse-text" class="gse-dialog">
                <div>
                    <button id="gse-text-cancel">Cancel</button>
                    <button id="gse-text-done">Done</button>
                    <p id="gse-text-prompt"></p>
                </div>
                <div>
                    <textarea id="gse-text-input"></textarea>
                </div>
            </div>
            <div id="gse-loading" style="visibility:visible;">
                <img src="images/gse-loading.png"/>
            </div>
        </div>
    </div>
    <div id="start-overlay" class="overlay">
        <h1>Ant Name: <span id="telegram-username"></span></h1>
        <button id="leaderboard-button">Leaderboard</button>
    </div>
    <div id="leaderboard-overlay" class="overlay" style="display:none;">
        <h2>Ant Leaderboard</h2>
        <div id="total-ants"></div>
        <div id="your-last-score"></div>
        <div id="leaderboard-countdown"></div>
        <div id="leaderboard-container">
            <table id="leaderboard">
                <tr><th>Rank</th><th>Ant Name</th><th>Top Kills</th></tr>
            </table>
        </div>
        <button id="close-leaderboard-button">Close</button>
    </div>
    <div id="endgame-overlay" class="overlay" style="display:none;">
        <h2>Game Over</h2>
        <div id="final-score"></div>
        <div id="new-high-score" style="display:none;"></div>
        <button id="view-leaderboard-button">View Leaderboard</button>
        <button id="share-button">Share</button>
        <button id="replay-button">Play Again</button>
    </div>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
    <script src="js/app.js"></script>
    <script src="js/game.js"></script>
    <script type="text/javascript" src="js/gse/gse-export.js" async onload="onEngineLoad()"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</body>
</html>