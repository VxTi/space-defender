(() => {

    let btDifficulty = document.querySelector(".bt-difficulty");
    let btPlay = document.querySelector(".bt-play");
    let btSettings = document.querySelector(".game-settings-button");
    let settingsMenu = document.querySelector('.settings');

    btDifficulty.addEventListener("click", () => {
        document.querySelector(".difficulty-title").innerText =
            Difficulties[difficulty = (difficulty + 1) % Difficulties.length]; // Rotate around all texts.
    });

    btPlay.addEventListener("click", () => {
        settingsMenu.style.visibility = 'hidden';
        gameActive = true;
        btSettings.style.visibility = 'visible';
    });

    // The settings button, one can pause the game with this

    btSettings.addEventListener("click", () => {
        gameActive = false;
        settingsMenu
            .style.visibility = 'visible';
        btSettings.style.visibility = 'hidden';
    });

    document.querySelector(".game-resume")
        .addEventListener("click", () => {
            gameActive = true;
            btSettings.style.visibility = 'visible';
            settingsMenu.style.visibility = 'hidden';
        });


})();