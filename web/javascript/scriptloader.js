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
        'terrain', 'hostile_entities', 'game',
        'menu_functionality defer', 'quadtree'
    ];
    let head = document.getElementsByTagName('head')[0];

    let start = new Date();
    for (let script of scripts)
    {
        let args = script.split(" ");
        let name = args[0];
        head.appendChild(await loadScript(`javascript/${name}.js`, head, args[1] !== undefined));
    }

    console.log(`Loaded ${scripts.length} script(s) in ${(new Date()) - start}ms`);

})();


// Method for loading script and adding it to the target head element.
// Returns a promise after script has successfully loaded to prevent others
// from loading first and causing conflicts.
async function loadScript(script, target, defer) {
    let element = document.createElement("script");
    element.setAttribute("src", script);
    if (defer)
        element.defer = true;
    target.appendChild(element);

    // Return the promise with the element as content
    return new Promise(resolve => element.addEventListener("load", () => resolve(element)));
}