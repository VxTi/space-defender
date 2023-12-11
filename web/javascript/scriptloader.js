/**
 * Quick function for laoding all scripts into the HTML document
 * without having to add a load of extra code into the 'index.html' file.
 */
(async () => {
    // Names of the scripts.
    // These have to be loaded in the right order.
    const scripts = [
        'p5', 'resource', 'vec2', 'aabb',
        'block', 'blocktype', 'entity', 'player',
        'environment', 'hostile_entities', 'game'
    ];
    let head = document.getElementsByTagName('head')[0];

    let start, end;

    console.log("Loading scripts");

    for (let script of scripts) {
        start = new Date();
        head.appendChild(await loadScript(`javascript/${script}.js`, head));
        end = new Date();
        console.log(`Script loaded '${script}' in ${end - start}ms`);
    }
})();


// Method for loading script and adding it to the target head element.
// Returns a promise after script has successfully loaded to prevent others
// from loading first and causing conflicts.
async function loadScript(script, target) {
    let element = document.createElement("script");
    element.setAttribute("src", script);
    target.appendChild(element);

    // Return the promise with the element as content
    return new Promise(resolve => element.addEventListener("load", () => resolve(element)));
}