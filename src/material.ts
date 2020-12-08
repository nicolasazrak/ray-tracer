import { Point3, Ray, Vector3 } from "./algebra";
import { Color } from "./color";
import { Hit } from "./hit"

export interface Material {
    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean;
    emmited(): Color;
    reflected(): number;
}


export class Lamberian {
    color: Color;
    refraction: number;

    constructor(color: Color) {
        this.color = color;
        this.refraction = (Math.min(color.red, 1) + Math.min(color.blue, 1) + Math.min(color.green, 1)) / 6;
    }

    emmited(): Color {
        return new Color(0, 0, 0);
    }

    reflected() {
        return this.refraction;
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

    emmited(): Color {
        return new Color(0, 0, 0);
    }

    reflected() {
        return 0.9;
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

    emmited(): Color {
        return this.color.clone();
    }

    reflected(): number {
        return 1;
    }

    scatter(ray: Ray, hit: Hit, attenuation: Color, scattered: Ray): boolean {
        attenuation.set(this.color);
        scattered.origin = hit.point;
        scattered.direction = Vector3.randomAlterate(hit.normal); 
        return true;
    }
}