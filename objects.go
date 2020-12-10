package main

import (
	"math"
)

type Object interface {
	intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool
}

type Sphere struct {
	center   Point3
	radious  float64
	powRad   float64
	material Material
}

func newSphere(center Point3, radious float64, material Material) Sphere {
	return Sphere{
		center:   center,
		radious:  radious,
		powRad:   radious * radious,
		material: material,
	}
}

func (sphere *Sphere) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	l := fromToVector(ray.origin, sphere.center)
	adj := l.dot(&ray.direction)
	d2 := l.dot(&l) - (adj * adj)
	if d2 > sphere.powRad {
		return false
	}
	thc := math.Sqrt(sphere.powRad - d2)
	t0 := adj - thc
	t1 := adj + thc
	if t0 < 0 && t1 < 0 {
		return false
	}

	distance := float64(0)
	if t0 > t1 {
		distance = t1
	} else {
		distance = t0
	}

	if distance < minDistance || distance > maxDistance {
		return false
	}

	hit.material = sphere.material
	hit.distance = distance
	hit.point = finalPoint(ray, hit.distance)
	hit.normal = fromToNormalizedVector(sphere.center, hit.point)

	return true
}

type Plane struct {
	origin   Point3
	normal   Vector3
	material Material
}

func (plane *Plane) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	denom := plane.normal.dot(&ray.direction)
	if math.Abs(denom) < minDistance {
		return false
	}

	v := fromToVector(ray.origin, plane.origin)
	distance := v.dot(&plane.normal) / denom

	if distance < minDistance || distance > maxDistance {
		return false
	}

	hit.material = plane.material
	hit.distance = distance
	hit.point = finalPoint(ray, hit.distance)
	hit.normal = plane.normal

	return true
}

type XYRectangle struct {
	x0       float64
	x1       float64
	y0       float64
	y1       float64
	z        float64
	normal   float64
	material Material
}

func (rect *XYRectangle) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	t := (rect.z - ray.origin.z) / ray.direction.z
	if t < minDistance || t > maxDistance {
		return false
	}

	x := ray.origin.x + t*ray.direction.x
	y := ray.origin.y + t*ray.direction.y

	if x < rect.x0 || x > rect.x1 || y < rect.y0 || y > rect.y1 {
		return false
	}

	hit.distance = t
	hit.normal = Vector3{0, 0, rect.normal}
	hit.material = rect.material
	hit.point = finalPoint(ray, t)
	return true
}

type YZRectangle struct {
	y0       float64
	y1       float64
	z0       float64
	z1       float64
	x        float64
	normal   float64
	material Material
}

func (rect *YZRectangle) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	t := (rect.x - ray.origin.x) / ray.direction.x
	if t < minDistance || t > maxDistance {
		return false
	}

	y := ray.origin.y + t*ray.direction.y
	z := ray.origin.z + t*ray.direction.z
	if y < rect.y0 || y > rect.y1 || z < rect.z0 || z > rect.z1 {
		return false
	}

	hit.distance = t
	hit.normal = Vector3{rect.normal, 0, 0}
	hit.material = rect.material
	hit.point = finalPoint(ray, t)
	return true
}

type XZRectangle struct {
	x0       float64
	x1       float64
	z0       float64
	z1       float64
	y        float64
	normal   float64
	material Material
}

func (rect *XZRectangle) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	t := (rect.y - ray.origin.y) / ray.direction.y
	if t < minDistance || t > maxDistance {
		return false
	}

	x := ray.origin.x + t*ray.direction.x
	z := ray.origin.z + t*ray.direction.z

	if x < rect.x0 || x > rect.x1 || z < rect.z0 || z > rect.z1 {
		return false
	}

	hit.distance = t
	hit.normal = Vector3{0, rect.normal, 0}
	hit.material = rect.material
	hit.point = finalPoint(ray, t)
	return true
}

type RotatedY struct {
	object   Object
	senTheta float64
	cosTheta float64
}

func rotateY(object Object, angle float64) *RotatedY {
	radians := angle * (math.Pi / 180)
	senTheta := math.Sin(radians)
	cosTheta := math.Cos(radians)

	return &RotatedY{object: object, senTheta: senTheta, cosTheta: cosTheta}
}

func (rect *RotatedY) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	origin := ray.origin
	direction := ray.direction

	origin.x = rect.cosTheta*ray.origin.x - rect.senTheta*ray.origin.z
	origin.z = rect.senTheta*ray.origin.x + rect.cosTheta*ray.origin.z

	direction.x = rect.cosTheta*ray.direction.x - rect.senTheta*ray.direction.z
	direction.z = rect.senTheta*ray.direction.x + rect.cosTheta*ray.direction.z

	rotatedRay := Ray{origin: origin, direction: direction}

	if !rect.object.intersectsWith(&rotatedRay, minDistance, maxDistance, hit) {
		return false
	}

	point := hit.point
	normal := hit.normal

	point.x = rect.cosTheta*hit.point.x + rect.senTheta*hit.point.z
	point.z = -rect.senTheta*hit.point.x + rect.cosTheta*hit.point.z

	normal.x = rect.cosTheta*hit.normal.x + rect.senTheta*hit.normal.z
	normal.z = -rect.senTheta*hit.normal.x + rect.cosTheta*hit.normal.z

	hit.point = point
	hit.normal = normal

	return true
}

type Box struct {
	rectangles []Object
	material   Material
}

func newBox(center Point3, sizeX float64, sizeY float64, sizeZ float64, material Material) *Box {
	left := &YZRectangle{y0: center.y - sizeY/2, y1: center.y + sizeY/2, z0: center.z - sizeZ/2, z1: center.z + sizeZ/2, x: center.x - sizeX/2, normal: -1, material: material}
	right := &YZRectangle{y0: center.y - sizeY/2, y1: center.y + sizeY/2, z0: center.z - sizeZ/2, z1: center.z + sizeZ/2, x: center.x + sizeX/2, normal: 1, material: material}
	far := &XYRectangle{x0: center.x - sizeX/2, x1: center.x + sizeX/2, y0: center.y - sizeY/2, y1: center.y + sizeY/2, z: center.z - sizeZ/2, normal: -1, material: material}
	near := &XYRectangle{x0: center.x - sizeX/2, x1: center.x + sizeX/2, y0: center.y - sizeY/2, y1: center.y + sizeY/2, z: center.z + sizeZ/2, normal: 1, material: material}
	top := &XZRectangle{x0: center.x - sizeX/2, x1: center.x + sizeX/2, z0: center.z - sizeZ/2, z1: center.z + sizeZ/2, y: center.y + sizeY/2, normal: 1, material: material}
	bottom := &XZRectangle{x0: center.x - sizeX/2, x1: center.x + sizeX/2, z0: center.z - sizeZ/2, z1: center.z + sizeZ/2, y: center.y - sizeY/2, normal: -1, material: material}

	return &Box{
		material:   material,
		rectangles: []Object{far, near, left, right, top, bottom},
	}
}

func (box *Box) intersectsWith(ray *Ray, minDistance float64, maxDistance float64, hit *Hit) bool {
	// TODO check https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
	matched := false
	for _, rectangle := range box.rectangles {
		if rectangle.intersectsWith(ray, minDistance, hit.distance, hit) {
			matched = true
		}
	}

	return matched
}
