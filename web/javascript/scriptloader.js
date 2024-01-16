/**
 * Quick function for laoding all scripts into the HTML document
 * without having to add a load of extra code into the 'index.html' file.
 */
(async () => {
    // Names of the scripts.
    // These have to be loaded in the right order.
    const scripts = [
        'p5.min', 'p5.sound.min', 'resource', 'vec2', 'entity/entity', 'entity/spaceship', 'entity/rocket',
        'entity/alien', 'entity/evolved_alien', 'entity/space_rock',
        'game_replica', 'entity/enemy_ship', 'entity/health_element',
        'entity/particle', 'menu_functionality defer'
    ];
    let head = document.getElementsByTagName('head')[0];

    let start = new Date();
    for (let script of scripts) {
        // Wait until script has loaded, then add it to the head.
        // Must wait until done until the next script can be loaded,
        // otherwise the order of the scripts will be messed up.
        let args = script.split(" ");
        await loadScript(`javascript/${args[0]}.js`, head, args[1] !== undefined)
            .then(e => head.appendChild(e));
    }

    console.log(`Loaded ${scripts.length} script(s) in ${(new Date()) - start}ms`);

})();


/**
 * Method for loading script and adding it to the target head element.
 * Returns a promise after script has successfully loaded to prevent others
 * from loading first and causing conflicts.
 * @param {string} script The script to load
 * @param {HTMLElement} target The target element to add the script to
 * @param {boolean} defer Whether to defer the script or not (loading after page load, default = false)
 */
async function loadScript(script, target, defer= false) {
    let element = document.createElement("script");
    element.setAttribute("src", script);
    element.defer = defer;
    target.appendChild(element);

    // Return the promise with the element as content
    return new Promise(resolve => element.addEventListener("load", () => resolve(element)));
}