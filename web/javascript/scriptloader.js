/**
 * Quick function for laoding all scripts into the HTML document
 * without having to add a load of extra code into the 'index.html' file.
 */
(() => {
    // Names of the scripts.
    // These have to be loaded in the right order.
    const scripts = [
        'p5', 'resource', 'vec2', 'aabb',
        'block', 'blocktype', 'entity', 'player',
        'environment', 'hostile_entities', 'game'
    ];
    let target = document.getElementsByTagName('head')[0];
    for (let script of scripts) {
        let element = document.createElement("script");
        element.setAttribute("src", `javascript/${script}.js`);
        target.appendChild(element);
    }
})();