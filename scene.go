package main

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"
	"time"

	"github.com/cheggaaa/pb"
)

type Scene struct {
	width           float64
	height          float64
	objects         []Object
	cameraPosition  Point3
	aspectRatio     float64
	fovAdjustment   float64
	samplesPerPixel int
	buffer          *image.RGBA
}

func newScene(width int, height int, samplesPerPixel int) *Scene {
	s := &Scene{
		width:           float64(width),
		height:          float64(height),
		aspectRatio:     float64(width) / float64(height),
		samplesPerPixel: samplesPerPixel,
		fovAdjustment:   math.Pi / 4,
		cameraPosition:  Point3{0, 1, 10},
	}

	upLeft := image.Point{0, 0}
	lowRight := image.Point{width, height}

	s.buffer = image.NewRGBA(image.Rectangle{upLeft, lowRight})

	return s
}

func (scene *Scene) addObject(obj Object) {
	scene.objects = append(scene.objects, obj)
}

func (scene *Scene) updateRay(x float64, y float64, ray *Ray) {
	sensorX := (((x+0.5)/scene.width)*2 - 1) * scene.aspectRatio * scene.fovAdjustment
	sensorY := 1 - ((y+0.5)/scene.height)*2.0*scene.fovAdjustment

	ray.origin = scene.cameraPosition
	ray.direction = normalizedVector(sensorX, sensorY, -1)
}

func (scene *Scene) hit(ray *Ray, minDistance float64, hit *Hit) bool {
	somethingMatched := false
	for _, object := range scene.objects {
		if object.intersectsWith(ray, minDistance, hit.distance, hit) {
			somethingMatched = true
		}
	}

	return somethingMatched
}

func (scene *Scene) colorOf(ray *Ray, minDistance float64, depth float64) Color {
	if depth <= 0 {
		return Color{0, 0, 0}
	}

	hit := newHit()
	if !scene.hit(ray, minDistance, &hit) {
		return Color{0, 0, 0}
	}

	color := Color{0, 0, 0}
	nextRay := Ray{}
	if hit.material.scatter(ray, &hit, &color, &nextRay) {
		nextColor := scene.colorOf(&nextRay, minDistance, depth-1)
		color.times(nextColor)
		color.add(hit.material.emmited())
	}

	return color
}

func (scene *Scene) setColor(x int, y int, colors []Color) {
	red := float64(0)
	green := float64(0)
	blue := float64(0)
	for _, color := range colors {
		red += color.red
		green += color.green
		blue += color.blue
	}
	colorsLen := float64(len(colors))

	rgba := color.RGBA{
		R: uint8(math.Max(0, math.Min(math.Sqrt(red/colorsLen), 1)) * 255),
		G: uint8(math.Max(0, math.Min(math.Sqrt(green/colorsLen), 1)) * 255),
		B: uint8(math.Max(0, math.Min(math.Sqrt(blue/colorsLen), 1)) * 255),
		A: 255,
	}

	scene.buffer.SetRGBA(x, y, rgba)
}

func (scene *Scene) render() {
	width := int(scene.width)
	height := int(scene.height)
	// samplesPerPixel := scene.samplesPerPixel
	ray := &Ray{}
	samples := make([]Color, scene.samplesPerPixel, scene.samplesPerPixel)
	bar := pb.StartNew(width)
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			for sample := 0; sample < scene.samplesPerPixel; sample++ {
				scene.updateRay(float64(x), float64(y), ray)
				samples[sample] = scene.colorOf(ray, 0.0001, 5)
			}
			scene.setColor(x, y, samples)
		}
		bar.Increment()
	}
	bar.Finish()

	// Encode as PNG.
	f, err := os.Create("image.png")
	if err != nil {
		panic(err)
	}
	err = png.Encode(f, scene.buffer)
	if err != nil {
		panic(err)
	}
}

func (scene *Scene) runBench(iterations int) {
	start := time.Now()
	width := int(scene.width)
	height := int(scene.height)
	hit := Hit{distance: 999999}
	ray := &Ray{}
	objs := len(scene.objects)
	matched := 0
	for iteration := 0; iteration < iterations; iteration++ {
		for x := 0; x < width; x++ {
			for y := 0; y < height; y++ {
				scene.updateRay(float64(x), float64(y), ray)
				for i := 0; i < objs; i++ {
					obj := scene.objects[i]
					if obj.intersectsWith(ray, 0, 99999999, &hit) {
						matched++
					}
				}
			}
		}
	}

	elapsed := time.Since(start)
	fmt.Println("matched", matched, elapsed)
}
