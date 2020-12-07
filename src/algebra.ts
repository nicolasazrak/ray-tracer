
export class Point3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static squaredDistance(p1: Point3, p2: Point3) {
       return (p1.x - p2.x) * (p1.x - p2.x) +
        (p1.y - p2.y) * (p1.y - p2.y) +
        (p1.z - p2.z) * (p1.z - p2.z)
    }
}

export class Vector3 {
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

    static fromTo(from: Point3, to: Point3): Vector3 {
        const x = to.x - from.x;
        const y = to.y - from.y;
        const z = to.z - from.z;
        return new Vector3(x, y, z);
    }

    static fromToNormalized(from: Point3, to: Point3): Vector3 {
        const x = to.x - from.x;
        const y = to.y - from.y;
        const z = to.z - from.z;
        return Vector3.normalized(x, y, z);
    }

    static randomAlterate(vec: Vector3) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const z = Math.random() * 2 - 1;
        const norm = Math.sqrt(x * x + y * y + z * z);
        return new Vector3(vec.x + x / norm, vec.y + y / norm, vec.z + z / norm);
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

    times(val: number): Vector3 {
        return new Vector3(this.x * val, this.y * val, this.z * val);
    }
}

export class Ray {
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
