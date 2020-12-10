package main

import (
	"math"
	"math/rand"
)

type Point3 struct {
	x float64
	y float64
	z float64
}

func squaredDistance(p1 Point3, p2 Point3) float64 {
	return (p1.x-p2.x)*(p1.x-p2.x) +
		(p1.y-p2.y)*(p1.y-p2.y) +
		(p1.z-p2.z)*(p1.z-p2.z)
}

type Vector3 struct {
	x float64
	y float64
	z float64
}

func normalizedVector(x float64, y float64, z float64) Vector3 {
	norm := math.Sqrt(x*x + y*y + z*z)
	return Vector3{x: x / norm, y: y / norm, z: z / norm}
}

func fromToVector(from Point3, to Point3) Vector3 {
	x := to.x - from.x
	y := to.y - from.y
	z := to.z - from.z
	return Vector3{x: x, y: y, z: z}
}

func fromToNormalizedVector(from Point3, to Point3) Vector3 {
	x := to.x - from.x
	y := to.y - from.y
	z := to.z - from.z
	norm := math.Sqrt(x*x + y*y + z*z)
	return Vector3{x: x / norm, y: y / norm, z: z / norm}
}

func fromToNormalizedVector2(from *Vector3, to *Vector3) Vector3 {
	x := to.x - from.x
	y := to.y - from.y
	z := to.z - from.z
	norm := math.Sqrt(x*x + y*y + z*z)
	return Vector3{x: x / norm, y: y / norm, z: z / norm}
}

// TODO this won't work if the render is multithreaded
var r = rand.New(rand.NewSource(1))

func randomAlterate(vec Vector3) Vector3 {
	x := r.Float64()*2 - 1
	y := r.Float64()*2 - 1
	z := r.Float64()*2 - 1
	norm := math.Sqrt(x*x + y*y + z*z)
	return Vector3{x: vec.x + x/norm, y: vec.y + y/norm, z: vec.z + z/norm}
}

func (vec *Vector3) dot(otherVector *Vector3) float64 {
	return vec.x*otherVector.x + vec.y*otherVector.y + vec.z*otherVector.z
}

func (vec *Vector3) cross(otherVector Vector3) Vector3 {
	cx := vec.y*otherVector.z - vec.z*otherVector.y
	cy := vec.z*otherVector.x - vec.x*otherVector.z
	cz := vec.x*otherVector.y - vec.y*otherVector.x
	return Vector3{x: cx, y: cy, z: cz}
}

func (vec *Vector3) norm() float64 {
	return math.Sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z)
}

func (vec *Vector3) negate() Vector3 {
	return Vector3{-vec.x, -vec.y, -vec.z}
}

func (vec *Vector3) normalize() Vector3 {
	n := vec.norm()
	return Vector3{vec.x / n, vec.y / n, vec.z / n}
}

func (vec *Vector3) times(val float64) Vector3 {
	return Vector3{vec.x * val, vec.y * val, vec.z * val}
}

type Ray struct {
	origin    Point3
	direction Vector3
}

func finalPoint(ray *Ray, distance float64) Point3 {
	x := ray.origin.x + ray.direction.x*distance
	y := ray.origin.y + ray.direction.y*distance
	z := ray.origin.z + ray.direction.z*distance
	return Point3{x: x, y: y, z: z}
}
