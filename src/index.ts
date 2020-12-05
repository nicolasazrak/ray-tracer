import { Vector } from './vector.js';

const canvas = document.getElementById("canvas");

class Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;

    constructor(red: number, green: number, blue: number, alpha = 255) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

class Scene {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imageData: ImageData;
    objects: any[];
    cameraPosition: Ray;
    fovAdjustment: number;
    aspectRatio: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
        this.cameraPosition = new Ray(new Point3(0, 0, 0), new Vector(0, 0, -1));
        this.fovAdjustment = Math.PI / 2; // 90 angles field of view
        this.aspectRatio = this.width() / this.height();
    }

    addObject(object) {
        this.objects.push(object);
    }

    width(): number {
        return this.canvas.width;
    }

    height(): number {
        return this.canvas.height;
    }

    setColor(x: number, y: number, color: Color) {
        const index = (y * this.width() + x) * 4;
        this.imageData.data[index] = color.red;
        this.imageData.data[index + 1] = color.green;
        this.imageData.data[index + 2] = color.blue;
        this.imageData.data[index + 3] = color.alpha;
    }

    createRay(x, y) {
        const sensorX = (((x + 0.5) / this.width()) * 2 - 1) * this.aspectRatio * this.fovAdjustment; 
        const sensorY = 1 - ((y + 0.5) / this.height()) * 2.0 * this.fovAdjustment;
        return new Ray(ZeroPoint3, Vector.normalize(new Vector(sensorX, sensorY, -1)));
    }

    render() {
        const black = new Color(0, 0, 0);

        for (let x = 0; x < this.width(); x++) {
            for (let y = 0; y < this.height(); y++) {
                const ray = this.createRay(x, y);
                if (this.objects[0].intersectsWith(ray)) {
                    this.setColor(x, y, this.objects[0].color);
                } else {
                    this.setColor(x, y, black);
                }
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}

class Ray {
    origin: Point3;
    direction: Vector;
    constructor(origin: Point3, direction: Vector) {
        this.origin = origin;
        this.direction = direction;
    }
}


class Point3 {
    x: number;
    y: number;
    z: number;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    minus(otherPoint) {
        return Vector.normalize(new Vector(this.x - otherPoint.x, this.y - otherPoint.y, this.z - otherPoint.z));  
    }
}

const ZeroPoint3 = new Point3(0, 0, 0);

class Sphere {
    center: Point3;
    radious: number;
    color: Color;
    constructor(center: Point3, radious: number) {
        this.center = center;
        this.radious = radious;
        this.color = new Color(255, 0, 0);
    }

    intersectsWith(ray: Ray) {
        const lineToCenter = this.center.minus(ray.origin);
    }
}

const scene = new Scene(canvas as HTMLCanvasElement);
scene.addObject(new Sphere(new Point3(2, 0, -10), 3));

for (let x = 0; x < scene.width(); x++) {
    for (let y = 0; y < scene.height(); y++) {
        if ((x > 300) && (x < 700) && (y > 110) && (y < 900)) {
            scene.setColor(x, y, new Color(0, 45, 250));
        }
    }
}

scene.render();
