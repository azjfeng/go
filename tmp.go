package main

import (
	"fmt"
	"os"
)

func tmp(){
	fmt.Println("aaa")
	f();
	open();
}

func f()  {
	fmt.Println("ffff")
}

//打开文件
func open()  {
	f, err := os.Open("./index.txt") 
	if err != nil {
		return 
	}
	
	fmt.Println(f.Stat())
	f.Close()
}