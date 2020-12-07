import { Object } from "./objects";
import { Point3, Vector3 } from "./algebra";
import { Material } from "./material";

export class Hit {
    point: Point3;
    normal: Vector3;
    distance: number;
    material: Material;

    constructor() {
        this.distance = Infinity;
    }

}