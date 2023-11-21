
// the function setup() is called once when the page is loaded
function setup(){
    // create a canvas element and append it to the body
    createCanvas(800, 600);    
    
    // disable the outline of shapes
    noStroke();
}

// the function draw() is called every frame
function draw(){
    // clear the background with a transparent black color
    background(0,0,0,10);

    // draw a circle at the mouse position
    circle(mouseX, mouseY, 50);
}