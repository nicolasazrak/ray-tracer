import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Object, Sphere, Plane, Triangle, Rectangle } from './objects';
import { Scene } from './scene';
import { Lamberian, Metal, Light } from './material';

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const solidRed = new Lamberian(new Color(1, 0, 0));
const solidGreen = new Lamberian(new Color(0, 1, 0));
const solidCyan = new Lamberian(new Color(0, 0.69, 0.96));
const solidBlue = new Lamberian(new Color(0, 0, 1));
const light = new Light(new Color(1, 1, 1));
const solidGrey = new Lamberian(new Color(0.2, 0.2, 0.2));
const metal = new Metal(new Color(0.8, 0.8, 0.8));

const scene = new Scene(canvas);

const sphere1 = new Sphere(new Point3(0, 5, -10), 3, solidRed);
const sphere2 = new Sphere(new Point3(7, 0, -7), 4, solidGreen);    
const sphere3 = new Sphere(new Point3(-12, 1, -1), 2, solidBlue);    
const metalSphere = new Sphere(new Point3(-5, 0, -5), 3, metal);
const floor = new Plane(new Point3(0, -3, 0), new Vector3(0, 1, 0), solidGrey);

const boxSize = 20;

const farPlane = new Rectangle(
    new Point3(-boxSize, 0, -boxSize),
    new Point3(-boxSize, boxSize, -boxSize),
    new Point3(boxSize, boxSize, -boxSize),
    new Point3(boxSize, 0, -boxSize),
    new Vector3(0, 0, 1),
    solidCyan
);

const leftPlane = new Rectangle(
    new Point3(-boxSize, 0, boxSize),
    new Point3(-boxSize, boxSize, boxSize),
    new Point3(-boxSize, boxSize, -boxSize),
    new Point3(-boxSize, 0, -boxSize),
    new Vector3(1, 0, 0),
    solidCyan
);

const rightPlane = new Rectangle(
    new Point3(boxSize, 0, boxSize),
    new Point3(boxSize, boxSize, boxSize),
    new Point3(boxSize, boxSize, -boxSize),
    new Point3(boxSize, 0, -boxSize),
    new Vector3(-1, 0, 0),
    solidCyan
);

const ceilingPlane = new Rectangle(
    new Point3(-boxSize, boxSize, -boxSize),
    new Point3(-boxSize, boxSize, boxSize),
    new Point3(boxSize, boxSize, boxSize),
    new Point3(boxSize, boxSize, -boxSize),
    new Vector3(0, -1, 0),
    solidCyan
);

const behindPlane = new Rectangle(
    new Point3(-boxSize, 0, boxSize),
    new Point3(-boxSize, boxSize, boxSize),
    new Point3(boxSize, boxSize, boxSize),
    new Point3(boxSize, 0, boxSize),
    new Vector3(0, 0, -1),
    solidCyan
);

const lightPlane = new Rectangle(
    new Point3(19.99, 0, 5),
    new Point3(19.99, 5, 5),
    new Point3(19.99, 5, -5),
    new Point3(19.99, 0, -5),
    new Vector3(-1, 0, 0),
    light
);

scene.addObject(sphere1);
scene.addObject(sphere2);
scene.addObject(sphere3);
scene.addObject(metalSphere);
scene.addObject(floor);
scene.addObject(farPlane);
scene.addObject(leftPlane);
scene.addObject(rightPlane);
// scene.addObject(ceilingPlane);
scene.addObject(behindPlane);
// scene.addObject(lightPlane);

function renderAndLog() {
    const start = new Date().getTime();
    scene.render();
    const elapsed = new Date().getTime() - start;
    //if (t % 10 == 0) {
    //    console.log("Elapsed: " + elapsed);
    //}
}

const pressedKeys = new Set();
const speed = 0.5;

function processMovement(t) {
    pressedKeys.forEach(code => {
        if (code === 'KeyA') {
            scene.cameraPosition.x -= speed;
        }
        if (code === 'KeyD') {
            scene.cameraPosition.x += speed;
        }
        if (code === 'KeyW') {
            scene.cameraPosition.z -= speed;
        }
        if (code === 'KeyS') {
            scene.cameraPosition.z += speed;
        }
    });
    pressedKeys.clear();
    metalSphere.center.y = Math.sin(t / 10) * 2.5 + 2.5;
}

let interval = null;
function runFrames() {
    if (interval != null) {
        return;
    }
    let t = 0;
    interval = setInterval(() => {
        processMovement(t++);
        renderAndLog();
    }, 32);
}


 // resize the canvas to fill browser window dynamically
 window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.style.width = window.innerWidth.toString();
    canvas.style.height = window.innerHeight.toString();
    scene.aspectRatio = window.innerWidth / window.innerHeight;
    renderAndLog();
 }
resizeCanvas();
 
document.addEventListener('keypress', logKey);
function logKey(e) {
    scene.samplesPerPixel = 1;
    // canvas.height = 300;
    // canvas.width = 300;
    pressedKeys.add(e.code);
    runFrames();
}