package main

import (
	"image"
	"image/color"
	"image/png"
	"math/cmplx"
	"os"
)

func mandelbot()  {
	const (
		xmin, ymin, xmax, ymax = -2, -2, +2, +2
		width, height = 1024, 1024
	)
	
	file, err := os.Create("test.png")
	if err != nil{
		return
	}
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for py := 0; py < height; py++ {
		y := float64(py) / height * (ymax - ymin) + ymin
		for px := 0; px < width; px++ {
			x := float64(px) / width * (xmax - xmin) + xmin
			z := complex(x, y)
			img.Set(px, py, bot(z))
		}
	}
	png.Encode(file, img)
}

func bot(z complex128) color.Color  {
	const iterions = 200
	const contrast = 15
	var v complex128
	for i := uint8(0); i < iterions; i++ {
		v = v*v +z 
		if cmplx.Abs(v) > 2{
			return color.Gray{255 - contrast*i}
			// return color.RGBA{3,102,214,uint8(1)}
		}
	}

	return color.Black
}