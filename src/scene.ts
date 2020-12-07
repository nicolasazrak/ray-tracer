import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Object, Sphere, Plane } from './objects';
import { Hit } from './hit';

export class Scene {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imageData: ImageData;
    objects: Object[];
    lights: Light[];
    height: number;
    width: number;
    cameraPosition: Point3;
    fovAdjustment: number;
    aspectRatio: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
        this.cameraPosition = new Point3(0, 0, 0);
        this.height = canvas.height;
        this.width = canvas.width;
        this.fovAdjustment = Math.PI / 2; // 90 angles field of view
        this.aspectRatio = this.width / this.height;
        this.lights = [
            new Light(new Point3(0, 10, 10), new Color(1, 1, 1), 4000),
            new Light(new Point3(0, 20, 10), new Color(1, 1, 1), 8000)
        ];
    }

    addObject(object: Object) {
        this.objects.push(object);
    }

    setColor(x: number, y: number, color: Color) {
        const index = (y * this.width + x) * 4;
        this.imageData.data[index] = color.red * 255;
        this.imageData.data[index + 1] = color.green * 255;
        this.imageData.data[index + 2] = color.blue * 255;
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
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const ray = this.createRay(x, y);
                const color = this.colorOf(ray, 0.001, 10);
                this.setColor(x, y, color);
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}


/**
 
 
 
                let minDistance = Infinity;
                let minObject: Object | null = null;
                
                this.objects.forEach(object => {
                    const distance = object.intersectsWith(ray);
                    if (distance != null && distance < minDistance) {
                        minDistance = distance;
                        minObject = object;
                    }
                })

                if (minObject == null) {
                    this.setColor(x, y, background);
                    continue;
                }

                const intersectionPoint: Point3 = Ray.finalPoint(ray.origin, ray.direction, minDistance);
                let color = new Color(0, 0, 0);

                this.lights.forEach(light => {
                    const fromObjectToLight = Vector3.fromToNormalized(intersectionPoint, light.origin);
                    const normalObject = minObject.normalAt(intersectionPoint);
                    const d = Point3.squaredDistance(light.origin, intersectionPoint);
                    
                    const lightPower = light.intensity / (intensityDenom * d);

                    let thisLightColor = minObject.color.clone();
                    thisLightColor.scale(normalObject.dot(fromObjectToLight));
                    thisLightColor.scale(lightPower);
                    color.add(thisLightColor);
                });

 
 */

export class Light {
    origin: Point3; 
    color: Color;
    intensity: number;
    constructor(origin: Point3, color: Color, intensity: number) {
        this.origin = origin;
        this.color = color;
        this.intensity = intensity;
    }
}
