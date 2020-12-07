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
const plane = new Plane(new Point3(0, -3, 0), new Vector3(0, 1, 0), solidGrey);

scene.addObject(sphere1);
scene.addObject(sphere2);
scene.addObject(sphere3);
scene.addObject(metalSphere);
scene.addObject(plane);

function move(t) {
    metalSphere.center.y = Math.sin(t / 10) * 2.5 + 2.5;
    const start = new Date().getTime();
    scene.render();
    const elapsed = new Date().getTime() - start;
    if (t % 10 == 0) {
        console.log("Elapsed: " + elapsed);
    }
}

let t = 0;
setInterval(() => {
    t++;
    move(t);
}, 32);

move(0);

 // resize the canvas to fill browser window dynamically
 window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.style.width = window.innerWidth.toString();
    canvas.style.height = window.innerHeight.toString();
    scene.aspectRatio = window.innerWidth / window.innerHeight;
    move(0);
 }
 resizeCanvas();