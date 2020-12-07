import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Object, Sphere, Plane } from './objects';
import { Hit } from './hit';

export class Scene {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imageData: ImageData;
    objects: Object[];
    height: number;
    width: number;
    cameraPosition: Point3;
    fovAdjustment: number;
    aspectRatio: number;
    samplesPerPixel: number; 

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
        this.cameraPosition = new Point3(0, 1, 10);
        this.height = canvas.height;
        this.width = canvas.width;
        this.fovAdjustment = Math.PI / 3.2; // 90 angles field of view
        this.aspectRatio = this.width / this.height;
        this.samplesPerPixel = 50;
    }

    addObject(object: Object) {
        this.objects.push(object);
    }

    setColor(x: number, y: number, colors: Color[]) {
        const index = (y * this.width + x) * 4;
        let red = 0;
        let green = 0;
        let blue = 0;

        for (const color of colors) {
            red += color.red;
            green += color.green;
            blue += color.blue;
        }
        this.imageData.data[index] = Math.sqrt(red / colors.length) * 255;
        this.imageData.data[index + 1] = Math.sqrt(green / colors.length) * 255;
        this.imageData.data[index + 2] = Math.sqrt(blue / colors.length) * 255;
        this.imageData.data[index + 3] = 255;
    }

    createRay(x: number, y: number) {
        const sensorX = (((x + 0.5) / this.width) * 2 - 1) * this.aspectRatio * this.fovAdjustment; 
        const sensorY = 1 - ((y + 0.5) / this.height) * 2.0 * this.fovAdjustment;
        return new Ray(this.cameraPosition, Vector3.normalized(sensorX, sensorY, -1));
    }

    hit(ray: Ray, minDistance: number, hit: Hit): boolean { 
        let somethingMatched = false;
        for (const object of this.objects) {
            if (object.intersectsWith(ray, minDistance, hit.distance, hit)) {
                somethingMatched = true;
            }
        }

        return somethingMatched;
    }

    colorOf(ray: Ray, minDistance: number, depth: number): Color {
        if (depth <= 0) {
            return new Color(0, 0, 0);
        }

        const hit = new Hit();
        if (this.hit(ray, minDistance, hit)) {
            const color = new Color(0, 0, 0);
            const nextRay = new Ray(new Point3(0, 0, 0), new Vector3(0, 0, 0)); // TODO avoid allocating point3 and vector3

            if (hit.material.scatter(ray, hit, color, nextRay)) {
                const nextColor = this.colorOf(nextRay, minDistance, depth - 1);
                color.times(nextColor);
            }

            return color;
        }

        const direction = ray.direction;
        const t = 0.5 * (direction.y + 1);
        return new Color((1 - t) + t * 0.5, (1 - t) + t * 0.7, (1-t) + 1);
    }

    render() {
        const width = this.width;
        const height = this.height;
        const samplesPerPixel = this.samplesPerPixel;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const ray = this.createRay(x, y);
                const samples = [];
                for (let i = 0; i < samplesPerPixel; i++) {
                    samples.push(this.colorOf(ray, 0.001, 3));
                }
                this.setColor(x, y, samples);
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
