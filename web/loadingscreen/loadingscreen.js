let i = 0;
setInterval(() => {
    const dots = '.'.repeat(i % 4);
    const text = `Loading${dots}`;
    document.querySelector('.loadingtext').textContent = text;
    i++;
}, 500);

function fadeOut() {
    let loadingScreen = document.getElementById('loadingScreen');

    // Add the fade-out animation
    loadingScreen.classList.add('fade-out');

    // After the animation ends, set display to none
    loadingScreen.addEventListener('animationend', () => {
        loadingScreen.style.display = 'none';
    });
}

const timeout = 3000;
window.onload = function () {
    setTimeout(function () {
        document.querySelector('.loadinganimation').style.display = "none";
        document.querySelector('.loadingtext').style.display = "none";
    }, timeout);
}