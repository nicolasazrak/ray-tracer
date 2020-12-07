import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Object, Sphere, Plane } from './objects';
import { Scene, Light } from './scene';
import { Lamberian, Metal } from './material';

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const solidRed = new Lamberian(new Color(1, 0, 0));
const solidGreen = new Lamberian(new Color(0, 1, 0));
const solidBlue = new Lamberian(new Color(0, 0, 1));
const solidGrey = new Lamberian(new Color(0.2, 0.2, 0.2));
const metal = new Metal(new Color(0.8, 0.8, 0.8));

const scene = new Scene(canvas);

const sphere1 = new Sphere(new Point3(0, 5, -10), 3, solidRed);
const sphere2 = new Sphere(new Point3(7, 0, -7), 4, solidGreen);    
const sphere3 = new Sphere(new Point3(-12, 1, -1), 2, solidBlue);    
const metalSphere = new Sphere(new Point3(-5, 0, -5), 3, metal);
const plane1 = new Plane(new Point3(0, -3, 0), new Vector3(0, 1, 0), solidGrey);
const plane2 = new Plane(new Point3(0, 0, -20), new Vector3(0, 0, 1), solidBlue);

scene.addObject(sphere1);
scene.addObject(sphere2);
scene.addObject(sphere3);
scene.addObject(metalSphere);
scene.addObject(plane1);
// scene.addObject(plane2);

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