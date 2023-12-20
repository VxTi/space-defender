
const serverAddress = "http://localhost:8081/api/get";//"http://oege.ie.hva.nl:8081/api/get";

let element = {};

const maxScores = 10;

let leaderboardFilter = 'coins';

let leaderboardData = {};

let currentMenu = null;

selectLeaderboardFilter = () => {
    if (currentMenu === null)
        return;

    let element = currentMenu.querySelector('.gamepad-selected');
    if (element.dataset.filter != null) {
        document.querySelectorAll('.leaderboards-filter')
            .forEach(e => {

            })
        e.classList.add('selected');
        leaderboardFilter = e.dataset.filter;
        element['leaderboard-content'].innerHTML = parseLeaderboardData(leaderboardData, leaderboardFilter);
    }
}

selectNextMenuItem = (direction = 1) => {

    // Check if we're currently in a menu, if not, discard the action
    if (currentMenu === null)
        return;

    // Get the list of possible selectors
    let selectables = currentMenu.querySelectorAll(".gamepad-selectable");
    let currentlySelected = currentMenu.querySelector(".gamepad-selected");

    // If we're not selecting an element, pick the first one and stop.
    if (currentlySelected == null) {
        selectables[0].classList.add("gamepad-selected");
        return;
    }


    for (let i = 0; i < selectables.length; i++) {
        if (selectables[i] === currentlySelected) {
            selectables[(i + direction + selectables.length) % selectables.length].classList.add("gamepad-selected");
            break;
        }
    }

    // Remove selector from previously selected element
    currentlySelected.classList.remove("gamepad-selected");
}

function keyTyped() {

    // Pause game key
    if ((key === 'r' || key === ESCAPE) && gameActive) {
        gameActive = false;
        showMenu('menu-pause');
    }

    // For controller movement, when user enters 'w' or 'd', select next upper element
    if (key === 'w' || key === 'd')
        selectNextMenuItem(-1);
    else if (key === 's' || key === 'a') // with 's' and 'a', do the opposite, move down
        selectNextMenuItem(1);
    else if (key === ' ') { // If space-bar is pressed, perform button click
        if (currentMenu != null) {

            let selected = currentMenu.querySelector('.gamepad-selected');

            // Check whether we've selected an item
            if (selected == null)
                return;

            // Check if it has a menu to go to
            if (selected.dataset.menu != null) {
                showMenu(selected.dataset.menu);

                // Check if it has a function to perform when interacted with
            } else if (selected.dataset.onload != null && typeof this[selected.dataset.onload] === 'function') {
                this[selected.dataset.onload]();
            }
        }
    }
}

(() => {

    const elements = [
        'game-settings-button', 'main-play', 'main-leaderboards',
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

    // Add event listeners to the leaderboard buttons, so that when the user clicks on one of the filters,
    // the page automatically updates the order of elements
    let leadFilterButtons = document.querySelectorAll('.leaderboards-filter');
    leadFilterButtons.forEach(e => e.onclick = () => {
            leadFilterButtons.forEach(e => e.classList.remove('selected'));
            e.classList.add('selected');
            leaderboardFilter = e.dataset.filter;
            element['leaderboard-content'].innerHTML = parseLeaderboardData(leaderboardData, leaderboardFilter);
        });

    element['game-settings-button'].onclick = () => showMenu('menu-pause');

    // If any of the menu buttons have a tag named 'data-menu' with a valid menu assigned,
    // when interacted, it'll go to that menu.
    document.querySelectorAll('.menu-button').forEach(obj => {
        if (typeof obj.dataset.menu !== 'undefined')
            obj.onclick = () => showMenu(obj.dataset.menu);
    });

    showMenu("menu-start");

})();

/**
 * Method for changing the current menu.
 * @param element
 */
function showMenu(element = null) {
    currentMenu = null;
    document.querySelectorAll('.menu-page').forEach(e => e.style.visibility = 'hidden');
    if (element != null && element.length > 1) {
        currentMenu = document.querySelector(`.${element}`);
        currentMenu.style.visibility = 'visible';
        // Check if the element has an onload function in its dataset, defined as 'data-onload=".."'
        // If it does, call the function.
        if (typeof currentMenu.dataset.onload !== 'undefined' && typeof this[currentMenu.dataset.onload] === 'function')
            this[currentMenu.dataset.onload]();

    }
    gameActive = element === "" || element == null;

}

function publishScore(obj) {
    // TODO: add functionality

}

/**
 * Method that retrieves the leaderboard information by sending a post request to the
 * server. The server then returns a body containing all the leaderboard information,
 * based on the predefined parameters [ maxScores, leaderboardFilter ]
 * This then changes the content of the leaderboard html to the result of this request.
 */
function retrieveLeaderboards() {
    let content = "Waiting for leaderboard data...";

    fetch(serverAddress, {
        method: "POST",
        contentType: "application/json",
        cors: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requestType: "all-data",
            tables: ["name", "coins", "score"],
            results: maxScores,
            orderBy: leaderboardFilter
        })
    })
        .then(result => result.json())
        .then(result => {
            leaderboardData = result;
            content = parseLeaderboardData(leaderboardData, leaderboardFilter);
        })
        .catch(() => content = "Failed to load leaderboard statistics")
        .finally(() => element['leaderboard-content'].innerHTML = content);
}

/**
 * Method for parsing the leaderboard data and sorting it accordingly.
 * Method accepts data, as an object containing leaderboard data,
 * and filter as a string, denoting what to filter
 * @param {Array} data Object containing all leaderboard data
 * @param {string} filter What key to filter the data with
 * @return {string} String containing the HTML data for the leaderboards
 * */
function parseLeaderboardData(data, filter) {
    let content = '';
    data = data.sort((a, b) => b[filter] - a[filter])
    Object.entries(data).forEach(([key, object]) => {
        content += `<span class="leaderboard-data">${object.name}</span> <span class="leaderboard-data" style="color: #a29b06">${object.coins} coins</span> <span class="leaderboard-data" style="color: #3245d5">${object.score} pt</span><br>\n`;
    })
    return content;
}