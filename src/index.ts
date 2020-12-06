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

    times(val: number) {
        return new Color(this.red * val, this.green * val, this.blue * val, this.alpha);
    }
}

class Scene {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    imageData: ImageData;
    objects: Object[];
    light: Vector3;
    cameraPosition: Point3;
    fovAdjustment: number;
    aspectRatio: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
        this.cameraPosition = new Point3(0, 0, 0);
        this.fovAdjustment = Math.PI / 3.5; // 90 angles field of view
        this.aspectRatio = this.width() / this.height();
        this.light = new Vector3(10, 10, -7);
    }


    addObject(object: Object) {
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

    createRay(x: number, y: number) {
        const sensorX = (((x + 0.5) / this.width()) * 2 - 1) * this.aspectRatio * this.fovAdjustment; 
        const sensorY = 1 - ((y + 0.5) / this.height()) * 2.0 * this.fovAdjustment;
        return new Ray(this.cameraPosition, Vector3.normalized(sensorX, sensorY, -1));
    }

    render() {
        const background = new Color(135, 206, 235);
        for (let x = 0; x < this.width(); x++) {
            for (let y = 0; y < this.height(); y++) {
                const ray = this.createRay(x, y);
                
                let minDistance = Infinity;
                let minObject = null;
                
                this.objects.forEach(object => {
                    if (x == 799 && y == 599 && object instanceof Plane) {
                        // debugger;
                    }
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

                let intersectionPoint = ray.direction.times(minDistance).plus(ray.origin);
                const normalObject = minObject.normalAt(intersectionPoint);
                const cos = normalObject.cos(this.light);
                const color = minObject.color.times(cos);

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

    dot(otherVector: Vector3) {
        const A = this.norm();
        const B = otherVector.norm();
        const num = this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
        const cos0 = num / (A * B);
        return A * B * cos0;
    }

    cos(otherVector: Vector3) {
        const A = this.norm();
        const B = otherVector.norm();
        const num = this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
        return num / (A * B);
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    times(distance: number): Vector3 {
        return new Vector3(this.x * distance, this.y * distance, this.z * distance);
    }

    plus(point: Point3) {
        return new Vector3(this.x + point.x, this.y + point.y, this.z + point.z);
    }

    negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }
}

class Ray {
    origin: Point3;
    direction: Vector3;
    constructor(origin: Point3, direction: Vector3) {
        this.origin = origin;
        this.direction = direction;
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

    /**
     * Returns a normalized vector with the direction from this point to otherPoint
     */
    minus(otherPoint: Point3): Vector3 {
        return new Vector3(this.x - otherPoint.x, this.y - otherPoint.y, this.z - otherPoint.z);  
    }

    times(val: number): Point3 {
        return new Point3(this.x * val, this.y * val, this.z * val);
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
        return this.center.minus(point);
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
        this.normal = normal;
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
    direction: Vector3; 
    color: Color;
    intensity: number;
    constructor(direction: Vector3, color: Color, intensity: number) {
        this.direction = direction;
        this.color = color;
        this.intensity = intensity;
    }
}

const scene = new Scene(canvas as HTMLCanvasElement);
scene.addObject(new Sphere(new Point3(3, 5, -20), 3, new Color(255, 0, 0)));
scene.addObject(new Sphere(new Point3(10, 5, -10), 4, new Color(0, 255, 0)));
scene.addObject(new Sphere(new Point3(-5, 1, -9), 3, new Color(0, 0, 2550)));
scene.addObject(new Plane(new Point3(0, -10, 0), new Vector3(0, 1, 0), new Color(80, 80, 80)));
scene.render();
