const canvas = document.getElementById("canvas");

class Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;

    constructor(red: number, green: number, blue: number, alpha = 1) {
        this.red = Math.max(Math.min(red, 1), 0);
        this.green = Math.max(Math.min(green, 1), 0);
        this.blue = Math.max(Math.min(blue, 1), 0);
        this.alpha = Math.max(Math.min(alpha, 1), 0);
    }

    scale(val: number) {
        this.red *= val;
        this.green *= val;
        this.blue *= val;
    }

    add(otherColor: Color) {
        this.red += otherColor.red;
        this.green += otherColor.green;
        this.blue += otherColor.blue;
    }

    clone(): Color {
        return new Color(this.red, this.green, this.blue, this.alpha);
    }
}

class Scene {
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
        this.fovAdjustment = Math.PI / 3; // 90 angles field of view
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
        this.imageData.data[index + 3] = color.alpha * 255;
    }

    createRay(x: number, y: number) {
        const sensorX = (((x + 0.5) / this.width) * 2 - 1) * this.aspectRatio * this.fovAdjustment; 
        const sensorY = 1 - ((y + 0.5) / this.height) * 2.0 * this.fovAdjustment;
        return new Ray(this.cameraPosition, Vector3.normalized(sensorX, sensorY, -1));
    }

    render() {
        const background = new Color(135 / 255, 206 / 255, 235 / 255);
        const width = this.width;
        const height = this.height;
        const intensityDenom = 4 * Math.PI;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const ray = this.createRay(x, y);
                
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
                    const lightRay = new Ray(intersectionPoint, fromObjectToLight);
                    let objectBlocked = false;
                    for (let obj of this.objects) {
                        if (obj == minObject) {
                            continue;
                        }
                        // TODO check distance is less that light
                        if (obj.intersectsWith(lightRay) != null) {
                            objectBlocked = true;
                            break;
                        }
                    } 

                    if (!objectBlocked) {
                        const normalObject: Vector3 = minObject.normalAt(intersectionPoint);
                        const d = (light.origin.x - intersectionPoint.x) * (light.origin.x - intersectionPoint.x) +
                            (light.origin.y - intersectionPoint.y) * (light.origin.y - intersectionPoint.y) +
                            (light.origin.z - intersectionPoint.z) * (light.origin.z - intersectionPoint.z);
                        
                        const lightPower = light.intensity / (intensityDenom * d);

                        let thisLightColor = minObject.color.clone();
                        thisLightColor.scale(normalObject.dot(fromObjectToLight));
                        thisLightColor.scale(lightPower);
                        color.add(thisLightColor);
                    }
                });

                this.setColor(x, y, color);
            }
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}

class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static normalized(x: number, y: number, z: number) {
        const norm = Math.sqrt(x * x + y * y + z * z);
        return new Vector3(x / norm, y / norm, z / norm);
    }

    static fromToNormalized(from: Point3, to: Point3): Vector3 {
        const x = to.x - from.x;
        const y = to.y - from.y;
        const z = to.z - from.z;
        return Vector3.normalized(x, y, z);
    }

    dot(otherVector: Vector3) {
        return this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    normalize(): Vector3 {
        const n = this.norm()
        return new Vector3(this.x / n, this.y / n, this.z / n);
    }
}

class Ray {
    origin: Point3;
    direction: Vector3;
    constructor(origin: Point3, direction: Vector3) {
        this.origin = origin;
        this.direction = direction;
    }

    static finalPoint(origin: Point3, direction: Vector3, distance: number): Point3 {
        const x = origin.x + direction.x * distance;
        const y = origin.y + direction.y * distance;
        const z = origin.z + direction.z * distance;
        return new Point3(x, y, z);
    }
}

class Point3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    minus(otherPoint: Point3): Vector3 {
        return new Vector3(this.x - otherPoint.x, this.y - otherPoint.y, this.z - otherPoint.z);  
    }
}

const ZeroPoint3 = new Point3(0, 0, 0);

interface Object {
    color: Color;
    intersectsWith(ray: Ray): number | null;
    normalAt(point: Point3): Vector3;
}

class Sphere {
    center: Point3;
    radious: number;
    color: Color;
 
    constructor(center: Point3, radious: number, color: Color) {
        this.center = center;
        this.radious = radious;
        this.color = color;
    }

    normalAt(point: Point3): Vector3 {
        return Vector3.fromToNormalized(this.center, point);
    }

    intersectsWith(ray: Ray): number|null {
        const l = this.center.minus(ray.origin);
        const adj = l.dot(ray.direction);
        const d2 = l.dot(l) - (adj * adj);
        const powRad = this.radious * this.radious;
        if (d2 > powRad) {
            return null;
        }
        const thc = Math.sqrt(powRad - d2);
        const t0 = adj - thc;
        const t1 = adj + thc;
        if (t0 < 0 && t1 < 0) {
            return null;
        }
        
        return t0 < t1 ? t0 : t1;
    }
}

class Plane {
    normal: Vector3;
    color: Color;
    origin: Point3;
    constructor(origin: Point3, normal: Vector3, color: Color) {
        this.origin = origin;
        this.normal = normal.normalize();
        this.color = color;
    }

    intersectsWith(ray: Ray): number | null { 
        const denom = this.normal.dot(ray.direction);
        if (Math.abs(denom) < 0.000005) {
            return null;
        }

        const v = this.origin.minus(ray.origin)
        const distance = v.dot(this.normal) / denom;
        return distance > 0 ? distance : null;
    }

    normalAt(point: Point3): Vector3 { 
        return this.normal;
    }
}

class Light {
    origin: Point3; 
    color: Color;
    intensity: number;
    constructor(origin: Point3, color: Color, intensity: number) {
        this.origin = origin;
        this.color = color;
        this.intensity = intensity;
    }
}

const scene = new Scene(canvas as HTMLCanvasElement);
scene.addObject(new Sphere(new Point3(3, 5, -20), 3, new Color(1, 0, 0)));
scene.addObject(new Sphere(new Point3(10, 5, -10), 4, new Color(0, 1, 0)));
scene.addObject(new Sphere(new Point3(-5, 1, -9), 3, new Color(0, 0, 1)));
scene.addObject(new Plane(new Point3(0, -10, 0), new Vector3(0, 1, 0), new Color(0.8, 0.8, 0.8)));

function move(t) {
    scene.lights[0].origin.x = Math.sin(t / 10) * 10 + 10;
    scene.cameraPosition.x = Math.sin(t / 30) * 5;

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