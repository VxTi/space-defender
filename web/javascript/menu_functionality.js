
const serverAddress = "http://localhost:8081/api/getleaderboards";//"http://oege.ie.hva.nl:8081/api/get";

let element = {};

const maxScores = 10;
let leaderboardData = {};

let currentMenu = null;
let keyboardVisible = false;


function selectNextMenuItem(x = 1, y = 0) {

    // Check if we're currently in a menu, if not, discard the action
    if (currentMenu === null)
        return;

    playSound('navigate1');

    // Get the list of possible selectors
    let selectables = currentMenu.querySelectorAll(".gamepad-selectable");
    let currentlySelected = currentMenu.querySelector(".gamepad-selected");

    // If we're not selecting an element, pick the first one and stop.
    if (currentlySelected == null) {
        selectables[0].classList.add("gamepad-selected");
        // If the next element has a function to perform when selected, perform it
        if (selectables[0].dataset.select && typeof window[selectables[0].dataset.select] === 'function')
            window[selectables[0].dataset.select]();
        return;
    }

    // Find the next element to select
    for (let i = 0; i < selectables.length; i++) {

        // If we've found the currently selected element, select the next one
        if (selectables[i] === currentlySelected) {
            let next = selectables[(i + x + selectables.length) % selectables.length];
            next.classList.add("gamepad-selected");

            // If the next element has a function to perform when selected, perform it
            if (next.dataset.select && typeof window[next.dataset.select] === 'function')
                window[next.dataset.select]();

            // If the currently selected element has a function to perform when deselected, perform it
            if (currentlySelected && currentlySelected.dataset.deselect && typeof window[currentlySelected.dataset.deselect] === 'function')
                window[currentlySelected.dataset.deselect]();
            break;
        }
    }

    // Remove selector from previously selected element
    currentlySelected.classList.remove("gamepad-selected");
}

function keyboardShow() {
    document.querySelector('.virtual-keyboard').classList.add('keyboard-active');
}

function keyboardHide() {
    document.querySelector('.virtual-keyboard').classList.remove('keyboard-active');
}

/**
 * Method for handling user input.
 * This is used for navigating through the menu
 */
function keyTyped() {

    // If the current element is the text input, don't do anything
    // This prevents the user from navigating through the menu while typing
    if (document.activeElement === document.querySelector('.menu-text-input'))
        return;

    keyboardVisible = document.querySelector('.virtual-keyboard').classList.contains('keyboard-active');

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
                playSound('navigate2');
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
    createKeyboard();

})();

/**
 * Method for loading all the components of the custom keyboard.
 * The purpose of this is that the user can select a name even when
 * they're using a controller.
 */
function createKeyboard() {
    let inputBox = document.querySelector('.menu-text-input');
    let virtualKeyboard = document.querySelector('.virtual-keyboard');
    let keys = 'QWERTYUIOPASDFGHJKLZXCVBNM';

    // Add the querty characters to the keyboard
    for (let i = 0; i < keys.length; i++) {
        let key = document.createElement('div');
        key.classList.add('virtual-key');
        key.classList.add('gamepad-selectable');
        key.innerHTML = keys[i];
        key.onclick = () => inputBox.value += keys[i];
        virtualKeyboard.appendChild(key);
    }

    // Add the backspace key to the keyboard
    let backspace = document.createElement('div');
    backspace.classList.add('virtual-key');
    backspace.classList.add('gamepad-selectable');
    backspace.innerHTML = 'DEL';
    backspace.onclick = () => inputBox.value = inputBox.value.substring(0, input.value.length - 1);
    virtualKeyboard.appendChild(backspace);
}

/**
 * Method for moving the keyboard cursor.
 * @param x
 * @param y
 */
function setSelectedKey(x, y) {
    // Move the currently selected key to the next one

}

/**
 * Method for setting the broadcast message.
 * @param {string} message The message to display
 * @param {number} timeout The time in seconds to display the message, optional
 */
function setBroadcastMessage(message, timeout = 0) {
    let indicator = document.querySelector('.game-broadcast-content');
    indicator.innerHTML = message;
    if (timeout > 0)
        setTimeout(() => indicator.innerHTML = '', timeout);
}

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

/**
 * Method for loading statistics.
 * This method is called when the 'statistics' menu is opened in-game.
 */
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
 * @return {string} String containing the HTML data for the leaderboards
 * */
function parseLeaderboardData(data) {
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