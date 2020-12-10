package main

type Material interface {
	scatter(ray *Ray, hit *Hit, attenuation *Color, scattered *Ray) bool
	emmited() Color
}

type Lamberian struct {
	color      Color
	refraction float64
}

func newLambertian(color Color) *Lamberian {
	return &Lamberian{
		color: color,
	}
}

func (l *Lamberian) emmited() Color {
	return Color{0, 0, 0}
}

func (l *Lamberian) scatter(ray *Ray, hit *Hit, attenuation *Color, scattered *Ray) bool {
	attenuation.set(l.color)
	scattered.origin = hit.point
	scattered.direction = randomAlterate(hit.normal)
	return true
}

type Metal struct {
	color Color
}

func (metal *Metal) reflect(v *Vector3, n *Vector3) Vector3 {
	s := n.times(2 * v.dot(n))
	return fromToNormalizedVector2(&s, v)
}

func (metal *Metal) emmited() Color {
	return Color{red: 0, green: 0, blue: 0}
}

func (metal *Metal) scatter(ray *Ray, hit *Hit, attenuation *Color, scattered *Ray) bool {
	reflected := metal.reflect(&ray.direction, &hit.normal)
	scattered.origin = hit.point
	scattered.direction = reflected
	attenuation.set(metal.color)
	return scattered.direction.dot(&hit.normal) > 0
}

type Light struct {
	color Color
}

func (light *Light) emmited() Color {
	return light.color.clone()
}

func (light *Light) scatter(ray *Ray, hit *Hit, attenuation *Color, scattered *Ray) bool {
	attenuation.set(light.color)
	// scattered.origin = hit.point
	// scattered.direction = randomAlterate(hit.normal)
	return false
}
