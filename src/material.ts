import { Ray, Vector3 } from "./algebra";
import { Color } from "./color";
import { Hit } from "./hit"

export interface Material {
    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean;
}


export class Lamberian {
    color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean {
        attenuation.set(this.color);
        scattered.origin = hit.point;
        scattered.direction = Vector3.randomAlterate(hit.normal); 
        return true;
    }
}


export class Metal {
    color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    reflect(v: Vector3, n: Vector3): Vector3 {
        const s = n.times(2 * v.dot(n));
        return Vector3.fromToNormalized(s, v);
    }

    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean {
        const reflected = this.reflect(ray.direction, hit.normal);
        scattered.origin = hit.point;
        scattered.direction = reflected;
        attenuation.set(this.color);
        return scattered.direction.dot(hit.normal) > 0;
    }
}


export class Light {
    color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean {
        attenuation.set(this.color);
        return false;
    }
}