
let element = {};

const maxScores = 10;
let leaderboardData = {};

let currentMenu = null;
let keyboardVisible = false;

// The queue for messages to be displayed
let messageQueue = [];

function showKeyboard() {
    document.querySelector('.virtual-keyboard').classList.add('keyboard-active');
    document.querySelector('.virtual-key.selected').classList.remove('selected');
    document.querySelector('.virtual-key').classList.add('selected');
}

function hideKeyboard() {
    document.querySelector('.virtual-keyboard').classList.remove('keyboard-active');
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

    let broadcastElement = document.querySelector('.game-broadcast-content');

    // Set the interval for updating the broadcast message
    // This displays messages that are stored in 'messageQueue'
    setInterval(() => {

        broadcastElement.innerHTML = messageQueue.length > 0 ? messageQueue[0].message : "";

        if (messageQueue.length > 0) {
            if (messageQueue[0].startMs < 0) messageQueue[0].startMs = msElapsed;
            if (msElapsed - messageQueue[0].startMs > messageQueue[0].duration) {
                messageQueue.shift();
                messageQueue.startMs = msElapsed;
            }
        }
    }, 100);

})();

function selectNextMenuItem(y = 0) {

    // Check if we're currently in a menu, if not, discard the action
    if (currentMenu === null || y === 0)
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

            // Choose the next item in the list, or the first one if we're at the end of the list
            let next = selectables[(i + y + selectables.length) % selectables.length];
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
    backspace.onclick = () => inputBox.value = inputBox.value.substring(0, inputBox.value.length - 1);
    virtualKeyboard.appendChild(backspace);

    // Add the enter key
    let enter = document.createElement('div');
    enter.classList.add('virtual-key');
    enter.classList.add('gamepad-selectable');
    enter.innerHTML = 'ENTER';
    enter.onclick = () => hideKeyboard();  // hide the keyboard;
    virtualKeyboard.appendChild(enter);
}

function pressKeyboard() {
    let selected = document.querySelector('.virtual-key.selected');
    if (selected !== null)
        selected.onclick();
}

/**
 * Method for moving the keyboard cursor.
 * This method accepts relative parameters, it moves the cursor relative
 * to the currently selected key.
 * @param {number} dx By how much to move the cursor in the x direction. x > 0 means right, x < 0 means left
 * @param {number} dy By how much to move the cursor in the y direction. y > 0 means up, y < 0 means down
 */
function moveKeyboardCursor(dx, dy) {
    let v_selected_next = new Vec2();
    let v_dimensions = new Vec2();
    let v_store = new Vec2();
    let difference = Number.MAX_SAFE_INTEGER;

    let keys = document.querySelectorAll('.virtual-key');
    let selectedKey = document.querySelector('.virtual-key.selected');
    let next = null;

    // Get the currently selected key
    if (selectedKey != null) {

        // Get the dimensions of the currently selected key
        v_dimensions.translate(selectedKey.clientWidth, selectedKey.clientHeight);

        // Get the center of the currently selected key and offset it by the relative movement
        v_selected_next.translate(
            selectedKey.offsetLeft + (0.5 + dx) * v_dimensions.x,
            selectedKey.offsetTop + (0.5 - dy) * v_dimensions.y
        );

        // Go through all items, and find the closest one to the currently selected one
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (key === selectedKey) continue;

            // Store the middle of the currently checked element
            v_store.translate(key.offsetLeft + key.clientWidth / 2, key.offsetTop + key.clientHeight / 2);
            if (v_store.dist(v_selected_next) < difference) {
                difference = v_store.dist(v_selected_next);
                next = key;
            }
        }

        // If we've found a key to select, select it
        selectedKey.classList.remove('selected');
        next.classList.add('selected');
    } else {

        // If no keys are selected for whatever reason, set the first one to selected and stop.
        document.querySelector('.virtual-key').classList.add('selected');
    }
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

    // If the virtual keyboard is showing, we handle input a little differently.
    // If the user wants to exit the keyboard, one must press either the 'r' key or 'ESC'.
    // Since input is not handled by the physical keyboard, but rather by the virtual one,
    // character insertion is not handled by an event listener, and therefore typing characters will not do anything.
    if (keyboardVisible) {
        switch (key) {
            case 'r':
                hideKeyboard();
                selectNextMenuItem(1);
                break;
            case 'w': moveKeyboardCursor(0, 1);  break;
            case 'a': moveKeyboardCursor(-1, 0); break;
            case 's': moveKeyboardCursor(0, -1); break;
            case 'd': moveKeyboardCursor(1, 0);  break;
            case ' ': case 'Enter': pressKeyboard(); break;
        }
        return;
    }

    // If the keyboard is not showing, we handle keyboard input normally.
    // When the user then presses either the WASD keys, or uses the game controller,
    // it normally moves through the menu pages.
    let dy = 0;
    switch (key) {
        case 'r':
            if (gameActive) {
                gameActive = false;
                showMenu('menu-pause');
            }
            break;
        case 'w': case 'd': selectNextMenuItem(-1); break;
        case 's': case 'a': selectNextMenuItem(1); break;
        case ' ':
            if (currentMenu != null) {
                playSound('navigate2');
                let selected = currentMenu.querySelector('.gamepad-selected');

                // Check whether we've selected an item
                if (selected == null)
                    break;

                // Check if it has a menu to go to
                if (selected.dataset.menu != null)
                    showMenu(selected.dataset.menu);

                // Check if it has a function to perform when interacted with
                if (selected.dataset.onload != null && typeof window[selected.dataset.onload] === 'function')
                    window[selected.dataset.onload]();
            }
            break;
    }
}

/**
 * Method for adding a broadcast message.
 * This allows the user to queue various messages over time. It adds messages to the
 * 'messageQueue' array. Once the previous message has finished displaying, the next one will display.
 * @param {string} message The message to display
 * @param {number} duration The time in seconds to display the message, optional
 */
function broadcast(message, duration = 1000) {
    messageQueue.push({message: message, startMs: -1, duration: duration});
}

/**
 * Method for changing the current menu.
 * This method is called when the user clicks on a menu button.
 * @param {string} element The element to display. This is the classname of the page to show.
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
 * Calling this method will use the previously loaded statistics object in 'game-replica.js'
 * and convert it to a readable page on the 'statistics' page.
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
            content = parseLeaderboardData(leaderboardData);
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