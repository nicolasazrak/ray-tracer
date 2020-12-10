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
	if ray.direction.z > 0 {
		hit.normal = Vector3{0, 0, -1}
	} else {
		hit.normal = Vector3{0, 0, 1}
	}
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
	if ray.direction.x > 0 {
		hit.normal = Vector3{-1, 0, 0}
	} else {
		hit.normal = Vector3{1, 0, 0}
	}
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
	if ray.direction.y > 0 {
		hit.normal = Vector3{0, -1, 0}
	} else {
		hit.normal = Vector3{0, 1, 0}
	}
	hit.material = rect.material
	hit.point = finalPoint(ray, t)
	return true
}
