package main

type Color struct {
	red   float64
	green float64
	blue  float64
}

func (color *Color) scale(val float64) {
	color.red *= val
	color.green *= val
	color.blue *= val
}

func (color *Color) add(otherColor Color) {
	color.red += otherColor.red
	color.green += otherColor.green
	color.blue += otherColor.blue
}

func (color *Color) times(otherColor Color) {
	color.red *= otherColor.red
	color.green *= otherColor.green
	color.blue *= otherColor.blue
}

func (color *Color) clone() Color {
	return Color{red: color.red, green: color.green, blue: color.blue}
}

func (color *Color) set(other Color) {
	color.red = other.red
	color.green = other.green
	color.blue = other.blue
}
