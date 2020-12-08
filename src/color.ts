export class Color {

    red: number;
    green: number;
    blue: number;

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
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