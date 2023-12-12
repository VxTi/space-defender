
const serverAddress = "http://localhost:8080/api/get";

(() => {

    document.onkeydown = (event) => {
        if (event.key === 'Escape') {
            gameActive = !gameActive;
            showMenu(gameActive ? null : 'menu-pause');
        }
    }

    const elements = [
        'game-settings-button', 'main-difficulty', 'main-play', 'main-leaderboards',
        'pause-main-menu', 'pause-settings', 'pause-resume', 'pause-statistics'
    ];
    let element = {};
    for (let e of elements)
        element[e] = document.querySelector(`.${e}`);

    element['game-settings-button'].onclick = () => showMenu('menu-pause');

    // pause screen
    element['pause-main-menu'].onclick = () => showMenu('menu-start');
    element['pause-settings'].onclick = () => console.log('showing settings menu');
    element['pause-statistics'].onclick = () => console.log('showing statistics');
    element['pause-resume'].onclick = () => showMenu();

    // main screen
    element['main-leaderboards'].onclick = () => retrieveLeaderboards().then(r => console.log(r));
    element['main-play'].onclick = () => showMenu();
    element['main-difficulty'].onclick = () => {
        let textElement = document.querySelector(".difficulty-title");
        textElement.innerText =
            Difficulties[difficulty = (difficulty + 1) % Difficulties.length]; // Rotate around all texts.
        textElement.style.color = `hsl(${(1 - (difficulty + 1) / Difficulties.length) * 130}, 100%, 50%)`;
    };

    showMenu("menu-start");

})();

function showMenu(element = null) {
    document.querySelectorAll('.menu-page').forEach(e => e.style.visibility = 'hidden');
    if (element != null)
        document.querySelector(`.${element}`).style.visibility = 'visible';
    gameActive = element == null;

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