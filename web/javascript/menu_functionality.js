
const serverAddress = "http://localhost:8080/api/get/allusers";

let element = {};

const maxScores = 10;

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
        'main-information', 'leaderboard-content'
    ];

    // load all elements into the element object
    for (let e of elements)
        element[e] = document.querySelector(`.${e}`);

    // Add event listener to all 'return to menu' back arrow buttons.
    // If the div has a data-tag in it defining the location to return to, then that menu will show
    // otherwise it just returns to main menu by default.
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
    if (element != null) {
        let e = document.querySelector(`.${element}`);
        e.style.visibility = 'visible';
        // Check if the element has an onload function in its dataset, defined as 'data-onload=".."'
        // If it does, call the function.
        if (typeof e.dataset.onload !== 'undefined' && typeof this[e.dataset.onload] === 'function')
            this[e.dataset.onload]();

    }
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
    let content = "";

    fetch(serverAddress)
        .then(result => result.json())
        .then(result => {
            let i = 0;
            for (let [key, value] of Object.entries(result)) {
                if (i++ >= maxScores)
                    break;
                content += `${value.name} \t- ${value.coins} coins, ${value.score} pt\n`;
            }
            //content = JSON.stringify(result);
        })
        .catch(() => content = "Failed to load leaderboard statistics")
        .finally(() => element['leaderboard-content'].innerText = content);
}