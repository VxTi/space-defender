let API_URL = 'http://localhost:8081/api/';
let apiKey = 'dcdc91a618b4c9830fcc2e20';

document.addEventListener("DOMContentLoaded", async (event) => {

    let urlParameters = new URLSearchParams(window.location.search);

    document.querySelector('.stats-user').innerHTML = urlParameters.get('name');

    let statistics = await requestApi('getuser', {name: urlParameters.get('name')})
        .then(res => res.userData)
        .catch(e => console.error(e));

    if (statistics != null) {
        let statsContainer = document.querySelector('.stats-content');

        let append = (title, value) => {
            statsContainer.innerHTML += '<div class="stats-score"><span class="stats-type">' + title + '</span><span class="stats-value stats-text">' + value + '</span></div>';
        }

        append('Highest Score', statistics.maxScore);
        append('Last Score', statistics.lastScore);

        Object.entries(statistics.statistics).forEach(([key, element]) => {
            append(formatFieldName(element.field), element.value);
        })

        //document.querySelector('.stats-score').innerHTML = statistics[0].score;
        console.log("stats")
    }
    let hueElements = document.querySelectorAll('.hue-element');
    let hueDeg = 0;

    /** -- FUNCTIONALITY -- CHANGE COLOR OF SCORE BAR -- **/
    setInterval(() => {
        hueElements.forEach(e => e.style.color = `hsl(${hueDeg}deg, 100%, 50%)`)
        hueDeg = (hueDeg + 50) % 360;
    }, 500);
})

/**
 * Method for making an API request to the server.
 * @param {string} param The appropriate URL parameter for the request
 * @param {object} content The content to send to the server
 * @returns {Promise<Object>}
 */
async function requestApi(param, content) {
    return fetch(`${API_URL}${param}`, {
        method: 'POST',
        cors: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey,  ...content })
    })
        .then(res => res.json())
        .catch(e => console.error(e));
}

/**
 * Function for formatting field name to proper string, since
 * the field names are stored in the database as camelCase.
 * @param {string} field The field name to format
 */
function formatFieldName(field) {
    return field.replace(/([A-Z])/g, '  $1')
        .replace(/^./, str => str.toUpperCase());
}