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
