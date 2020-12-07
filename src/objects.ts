import { Color } from './color';
import { Point3, Vector3, Ray } from './algebra';
import { Hit } from './hit';
import { Material } from './material';


export interface Object {
    intersectsWith(ray: Ray, minDistance: number, maxDistance: number, hit: Hit): boolean;
}

export class Sphere {
    center: Point3;
    radious: number;
    material: Material;
 
    constructor(center: Point3, radious: number, material: Material) {
        this.center = center;
        this.radious = radious;
        this.material = material;
    }

    intersectsWith(ray: Ray, minDistance: number, maxDistance: number, hit: Hit): boolean {
        const l = Vector3.fromTo(ray.origin, this.center);
        const adj = l.dot(ray.direction);
        const d2 = l.dot(l) - (adj * adj);
        const powRad = this.radious * this.radious;
        if (d2 > powRad) {
            return false;
        }
        const thc = Math.sqrt(powRad - d2);
        const t0 = adj - thc;
        const t1 = adj + thc;
        if (t0 < 0 && t1 < 0) {
            return false;
        }

        const distance = t0 > t1 ? t1 : t0;
        
        if (distance < minDistance || distance > maxDistance) {
            return false;
        }

        hit.material = this.material;
        hit.distance = distance;
        hit.point = Ray.finalPoint(ray.origin, ray.direction, hit.distance);
        hit.normal = Vector3.fromToNormalized(this.center, hit.point);

        return true;
    }
}

export class Plane {
    normal: Vector3;
    material: Material;
    origin: Point3;

    constructor(origin: Point3, normal: Vector3, material: Material) {
        this.origin = origin;
        this.normal = normal.normalize();
        this.material = material;
    }

    intersectsWith(ray: Ray, minDistance: number, maxDistance: number, hit: Hit): boolean {
        const denom = this.normal.dot(ray.direction);
        if (Math.abs(denom) < minDistance) {
            return false;
        }

        const v = Vector3.fromTo(ray.origin, this.origin);
        const distance = v.dot(this.normal) / denom;

        if (distance < minDistance || distance > maxDistance) {
            return false;
        }

        hit.material = this.material;
        hit.distance = distance;
        hit.point = Ray.finalPoint(ray.origin, ray.direction, hit.distance);
        hit.normal = this.normal;

        return true;
    }
}


export class Triangle {
    v0: Point3;
    v1: Point3;
    v2: Point3;
    edge1: Vector3;
    edge2: Vector3;
    normal: Vector3;
    material: Material;

    constructor(v0: Point3, v1: Point3, v2: Point3, normal: Vector3, material: Material) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;
        this.material = material;
        this.edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z -v0.z);
        this.edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
        this.normal = normal;
    }

    intersectsWith(ray: Ray, minDistance: number, maxDistance: number, hit: Hit): boolean {
        // https://en.wikipedia.org/wiki/Möller–Trumbore_intersection_algorithm
        const h = ray.direction.cross(this.edge2);
        const a = this.edge1.dot(h);
        if (a > -0.00001 && a < 0.00001) {
            return false;    // This ray is parallel to this triangle.
        }

        const f = 1.0 / a;
        const s = Vector3.fromTo(this.v0, ray.origin);
        const u = f * (s.dot(h));
        if (u < 0.0 || u > 1.0) {
            return false;
        }
        const q = s.cross(this.edge1);
        const v = f * ray.direction.dot(q);
        if (v < 0.0 || u + v > 1.0) {
            return false;
        }

        const t = f * this.edge2.dot(q);

        if (t < maxDistance && t > minDistance) {
            hit.material = this.material;
            hit.distance = t;
            hit.point = Ray.finalPoint(ray.origin, ray.direction, hit.distance);
            hit.normal = this.normal;
            return true;
        } else {
            // This means that there is a line intersection but not a ray intersection.
            return false;
        }
    }
}


export class Rectangle {
    triangles: Triangle[];

    constructor(p0: Point3, p1: Point3, p2: Point3, p3: Point3, normal: Vector3, material: Material) {
        this.triangles = [
            new Triangle(p0, p1, p2, normal, material),
            new Triangle(p0, p2, p3, normal, material),
        ]
    }

    intersectsWith(ray: Ray, minDistance: number, maxDistance: number, hit: Hit): boolean {
        for (const t of this.triangles) {
            if (t.intersectsWith(ray, minDistance, maxDistance, hit)) {
                return true;
            }
        }
        return false;
    }
}