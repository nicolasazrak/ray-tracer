package main

type Hit struct {
	point    Point3
	normal   Vector3
	distance float64
	material Material
}

func newHit() Hit {
	return Hit{
		distance: 999999999999,
	}
}
