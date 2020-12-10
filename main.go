package main

func main() {
	solidRed := newLambertian(Color{0.65, 0.05, 0.05})
	solidGreen := newLambertian(Color{0.12, 0.45, 0.15})
	solidCyan := newLambertian(Color{0.01, 0.49, 0.66})
	solidBlue := newLambertian(Color{0.01, 0.01, 0.95})
	solidGrey := newLambertian(Color{0.1, 0.1, 0.1})
	solidWhite := newLambertian(Color{0.73, 0.73, 0.73})
	lightMaterial := &Light{Color{5, 5, 5}}
	metal := &Metal{Color{0.95, 0.95, 0.95}}

	sphere1 := newSphere(Point3{x: 0, y: 5, z: -8}, 1, solidGrey)
	sphere2 := newSphere(Point3{x: 7, y: 0, z: -5}, 2, solidCyan)
	sphere3 := newSphere(Point3{x: -6, y: 0, z: -1}, 2, solidBlue)
	sphere4 := newSphere(Point3{x: -3, y: 0, z: -5}, 3, metal)

	floor := &Plane{Point3{0, -3, 0}, Vector3{0, 1, 0}, solidWhite}
	lightPlane1 := &XZRectangle{-2, 2, -5, -1, 9.99, lightMaterial}
	leftPlane := &YZRectangle{-3, 10, -10, 10, -7, solidGreen}
	rightPlane := &YZRectangle{-3, 10, -10, 10, 7, solidRed}
	farPlane := &XYRectangle{-10, 10, -10, 10, -10, solidWhite}
	ceilingPlane := &Plane{Point3{0, 10, 0}, Vector3{0, -1, 0}, solidWhite}

	scene := newScene(500, 500, 50)

	if false {
		scene.addObject(&sphere1)
		scene.addObject(&sphere2)
		scene.addObject(&sphere3)
		scene.addObject(&sphere4)
	}
	scene.addObject(floor)
	scene.addObject(lightPlane1)
	scene.addObject(leftPlane)
	scene.addObject(rightPlane)
	scene.addObject(farPlane)
	scene.addObject(ceilingPlane)

	scene.render()
}
