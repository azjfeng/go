package main

import "fmt"

func main(){
	fmt.Println("aaa")
	s := square()
	fmt.Println(s())
	fmt.Println(s())
	fmt.Println(s())
	fmt.Println(s())
	dobule(2)
}

func square() func() int {
	x := 0
	return func () int {
		x++
		return x*x
	}
}


func dobule(x int) (result int)  {
	defer func ()  {
		fmt.Printf("dobule(%d)= %d",x, result)
	}()
	return x+x
}