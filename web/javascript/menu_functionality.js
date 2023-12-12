
const serverAddress = "http://localhost:8080/api/get";

(() => {

    let btDifficulty = document.querySelector(".bt-difficulty");
    let btPlay = document.querySelector(".bt-play");
    let btSettings = document.querySelector(".game-settings-button");
    let btLeaderboards = document.querySelector(".bt-leaderboards");
    let settingsMenu = document.querySelector('.settings');

    btDifficulty.onclick = () =>
    {
        let textElement = document.querySelector(".difficulty-title");
        textElement.innerText =
            Difficulties[difficulty = (difficulty + 1) % Difficulties.length]; // Rotate around all texts.
        textElement.style.color = `hsl(${(1 - (difficulty + 1) / Difficulties.length) * 130}, 100%, 50%)`;
    };

    btPlay.onclick = () => {
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
        .addEventListener("click", () => {
            gameActive = true;
            btSettings.style.visibility = 'visible';
            settingsMenu.style.visibility = 'hidden';
        });

    btLeaderboards.addEventListener("click", () => {
        retrieveLeaderboards();
    })


})();

function publishScore(obj) {
    // TODO: add functionality
}

function retrieveLeaderboards() {
    fetch(serverAddress)
        .then(result => result.json())
        .then(result => console.log(JSON.stringify(result[0])))
        .catch(error => console.log("Error fetching score: ", error));
}