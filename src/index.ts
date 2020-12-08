import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Object, Sphere, Plane, Triangle, XYRectangle, XZRectangle, YZRectangle } from './objects';
import { Scene } from './scene';
import { Lamberian, Metal, Light } from './material';

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const solidRed = new Lamberian(new Color(1, 0, 0));
const solidGreen = new Lamberian(new Color(0, 1, 0));
const solidCyan = new Lamberian(new Color(0, 0.69, 0.96));
const solidBlue = new Lamberian(new Color(0, 0, 1));
const solidGrey = new Lamberian(new Color(0.2, 0.2, 0.2));
const solidWhite = new Lamberian(new Color(1, 1, 1));
const lightMaterial = new Light(new Color(100, 100, 100));
const metal = new Metal(new Color(0.8, 0.8, 0.8));

const scene = new Scene(canvas);

const sphere1 = new Sphere(new Point3(0, 5, -8), 3, solidRed);
const sphere2 = new Sphere(new Point3(7, 0, -5), 4, solidGreen);    
const sphere3 = new Sphere(new Point3(-8, 1, -1), 2, solidBlue);    
const metalSphere = new Sphere(new Point3(-5, 0, -5), 3, metal);

const floor = new Plane(new Point3(0, -3, 0), new Vector3(0, 1, 0), solidWhite);
const leftPlane = new YZRectangle(-3, 10, -10, 10, -10, solidCyan);
const rightPlane = new YZRectangle(-3, 10, -10, 10, 10, solidCyan);
const farPlane = new XYRectangle(-10, 10, -10, 10, -10, solidWhite);
const ceilingPlane = new Plane(new Point3(0, 10, 0), new Vector3(0, -1, 0), solidWhite);

const lightPlane1 = new XZRectangle(-2, 2, -5, -1, 9.99, lightMaterial);

scene.addObject(sphere1);
scene.addObject(sphere2);
scene.addObject(sphere3);
scene.addObject(metalSphere);
scene.addObject(floor);
scene.addObject(farPlane);
scene.addObject(leftPlane);
scene.addObject(rightPlane);
scene.addObject(ceilingPlane);
scene.addObject(lightPlane1);


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
        scene.render();
    }, 32);
}


// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.style.width = window.innerWidth.toString();
    canvas.style.height = window.innerHeight.toString();
    scene.aspectRatio = window.innerWidth / window.innerHeight;
    scene.render();
 }
resizeCanvas();
 
document.addEventListener('keypress', logKey);
function logKey(e) {
    scene.samplesPerPixel = 1;
    pressedKeys.add(e.code);
    runFrames();
}