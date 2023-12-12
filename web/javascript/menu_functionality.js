
const serverAddress = "http://localhost:8080/api/get";

(() => {

    document.onkeydown = (event) => {
        if (event.key === 'Escape') {
            gameActive = !gameActive;
            showWindow(gameActive ? null : 'menu-pause');
        }
    }

    let btDifficulty = document.querySelector(".bt-difficulty");
    let btPlay = document.querySelector(".bt-play");
    let btSettings = document.querySelector(".game-settings-button");
    let btLeaderboards = document.querySelector(".bt-leaderboards");
    let settingsMenu = document.querySelector('.settings');

    btDifficulty.onclick = () => {
        let textElement = document.querySelector(".difficulty-title");
        textElement.innerText =
            Difficulties[difficulty = (difficulty + 1) % Difficulties.length]; // Rotate around all texts.
        textElement.style.color = `hsl(${(1 - (difficulty + 1) / Difficulties.length) * 130}, 100%, 50%)`;
    };

    btPlay.onclick = () => {
        showWindow()
        settingsMenu.style.visibility = 'hidden';
        gameActive = true;
        btSettings.style.visibility = 'visible';
    };

    // The settings button, one can pause the game with this

    btSettings.onclick = () => {
        gameActive = false;
        settingsMenu
            .style.visibility = 'visible';
        btSettings.style.visibility = 'hidden';
    };

    document.querySelector(".game-resume")
        .onclick = () => {
            gameActive = true;
            btSettings.style.visibility = 'visible';
            settingsMenu.style.visibility = 'hidden';
        };

    btLeaderboards.onclick = () => retrieveLeaderboards().then(r => console.log(r));


})();

function showWindow(element) {
    document.querySelectorAll('.menu-page').forEach(e => e.style.visibility = 'hidden');
    if (element !== null)
        document.querySelector(`.${element}`).style.visibility = 'visible';

}

function publishScore(obj) {
    // TODO: add functionality
}

/**
 * Method for returning JSON data from the leaderboards as a Promise<string>
 * Usage: retrieveLeaderboards().then(result => console.log(result))
 */
function retrieveLeaderboards() {
    return fetch(serverAddress)
        .then(result => result.json())
        .then(result => JSON.stringify(result[0]))
        .catch(error => console.log("Error fetching score: ", error));
}