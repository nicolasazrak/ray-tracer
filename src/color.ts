export class Color {

    red: number;
    green: number;
    blue: number;

    constructor(red: number, green: number, blue: number) {
        this.red = Math.max(Math.min(red, 1), 0);
        this.green = Math.max(Math.min(green, 1), 0);
        this.blue = Math.max(Math.min(blue, 1), 0);
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

    times(otherColor: Color) {
        this.red *= otherColor.red;
        this.green *= otherColor.green;
        this.blue *= otherColor.blue;
    }

    clone(): Color {
        return new Color(this.red, this.green, this.blue);
    }

    set(color: Color) {
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
    }
}