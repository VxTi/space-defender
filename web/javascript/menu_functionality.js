
const serverAddress = "http://localhost:8081/api/getleaderboards";//"http://oege.ie.hva.nl:8081/api/get";

let element = {};

const maxScores = 10;

let leaderboardFilter = 'coins';

let leaderboardData = {};

let currentMenu = null;


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

    if (document.activeElement === document.querySelector('.menu-text-input'))
        return;

    switch (key) {
        case 'r':
        case ESCAPE:
            if (gameActive) {
                gameActive = false;
                showMenu('menu-pause');
            }
            break;
        case 'w':
        case 'd':
            selectNextMenuItem(-1);
            break;
        case 's':
        case 'a':
            selectNextMenuItem(1);
            break;
        case ' ':
            if (currentMenu != null) {

                let selected = currentMenu.querySelector('.gamepad-selected');

                // Check whether we've selected an item
                if (selected == null)
                    return;

                // Check if it has a menu to go to
                if (selected.dataset.menu != null) {
                    showMenu(selected.dataset.menu);
                }
                // Check if it has a function to perform when interacted with
                if (selected.dataset.onload != null && typeof window[selected.dataset.onload] === 'function')
                    window[selected.dataset.onload]();
            }
            break;
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
    document.querySelectorAll('.button-menu').forEach(e =>
        e.onclick = () => showMenu(e.dataset.menu ?? 'menu-start'));

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
            obj.onclick = () => {
                showMenu(obj.dataset.menu);
                if (typeof obj.dataset.onload !== 'undefined' && typeof window[obj.dataset.onload] === 'function')
                    window[obj.dataset.onload]();
            }
    });

    showMenu("menu-start");

    let virtualKeyboard = document.querySelector('.virtual-keyboard');
    let keys = 'qwertyuiopasdfghjklzxcvbnm';
    for (let i = 0; i < keys.length; i++) {
        let key = document.createElement('div');
        key.classList.add('virtual-key');
        key.innerHTML = keys[i];
        key.onclick = () => {
            let input = document.querySelector('.menu-text-input');
            input.value += keys[i];
        }
        virtualKeyboard.appendChild(key);
    }

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
    }
    gameActive = element === "" || element == null;
    document.querySelector('.game-scores').style.visibility = gameActive ? 'visible' : 'hidden';

}

function loadStatistics() {
    document.querySelector('.statistics-content').innerHTML =
        Object.entries(Statistics).map(([key, value]) => {
           return  `<div class="statistics-element"><span class="statistics-name">${value.name}</span><span class="statistics-value">${value.value}</span></div>`
        }).join('');
}

/**
 * Method that retrieves the leaderboard information by sending a post request to the
 * server. The server then returns a body containing all the leaderboard information,
 * based on the predefined parameters [ maxScores, leaderboardFilter ]
 * This then changes the content of the leaderboard html to the result of this request.
 */
function retrieveLeaderboards() {
    let content = "Waiting for leaderboard data...";

    requestApi('getleaderboards', {
        key: apiKey,
        maxResults: 10,
        sortBy: 'maxScore'
    })
        .then(result => {
            leaderboardData = result;
            content = parseLeaderboardData(leaderboardData, leaderboardFilter);
        })
        .catch((e) => {
            content = "<br>Failed to load leaderboard statistics. <br> Please try again later. <br> ";
            console.error(e)
        })
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
    data = data.sort((a, b) => b.maxScore - a.maxScore).slice(0, maxScores);
    return Object.entries(data).map(([key, object]) => `${formatLeaderboardEntry(object)}\n`).join('');
}

/**
 * Method for formatting the leaderboard entry data.
 * @param {object} data Object containing the player data.
 * @returns {string} Leaderboard entry from data object
 */
formatLeaderboardEntry = (data) => {
    return `<span class="leaderboard-data">${data.userName}</span> <span class="leaderboard-data" style="color: #a29b06">${data.maxScore} </span> <span class="leaderboard-data" style="color: #001055">WAVE ${data.maxWave}</span><br>\n`;
}


function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s;
        v = h.v;
        h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: [r, g, b] = [v, t, p]; break;
        case 1: [r, g, b] = [q, v, p]; break;
        case 2: [r, g, b] = [p, v, t]; break;
        case 3: [r, g, b] = [p, q, v]; break;
        case 4: [r, g, b] = [t, p, v]; break;
        case 5: [r, g, b] = [v, p, q]; break;
    }
    return Math.round(r * 255) << 16 | Math.round(g * 255) << 8 | Math.round(b * 255);
}