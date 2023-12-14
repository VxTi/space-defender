
const serverAddress = "http://localhost:8080/api/get";

(() => {

    document.onkeydown = (event) => {
        if (event.key === 'Escape' && gameActive) {
            gameActive = false;
            showMenu('menu-pause');
        }
    }

    const elements = [
        'game-settings-button', 'main-difficulty', 'main-play', 'main-leaderboards',
        'pause-main-menu', 'pause-settings', 'pause-resume', 'pause-statistics',
        'main-information'
    ];
    let element = {};
    for (let e of elements)
        element[e] = document.querySelector(`.${e}`);

    document.querySelectorAll('.button-menu').forEach(e => {
        e.onclick = () => {
            showMenu(typeof e.dataset.target !== 'undefined' ? e.dataset.target : 'menu-start');
        }
    });

    element['game-settings-button'].onclick = () => showMenu('menu-pause');

    // pause screen
    element['pause-main-menu'].onclick = () => showMenu('menu-start');
    element['pause-settings'].onclick = () => showMenu('menu-settings')
    element['pause-statistics'].onclick = () => showMenu('menu-statistics');
    element['pause-resume'].onclick = () => showMenu();

    // main screen
    element['main-leaderboards'].onclick = () => showMenu('menu-leaderboards');
    element['main-play'].onclick = () => showMenu();
    element['main-difficulty'].onclick = () => setDifficulty(difficulty + 1);
    element['main-information'].onclick = () => showMenu('menu-information');



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