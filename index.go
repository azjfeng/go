package main

import (
   "fmt"
)

type Weekday int

const (
   sunday Weekday = iota
   monday
)


func main() {
   x := 1;
   // p := &x;
   // *p = 22
   // fmt.Println(*p)
   // a := 1.2222
   // fmt.Println(int(a))
   // fmt.Println(x)
   // fmt.Println("Hello, World!")

   // num := gcd(2,4)
   // fmt.Println(num)

   // count := flb(1);
   // fmt.Println(count)
   // tmp()
   // mandelbot()
   y := fmt.Sprintf("%d", x)
   fmt.Printf("%T\n",y)
   // for r, v := range "世界" {
   //    fmt.Printf("%d %q\t",r,v)
   // }

   fmt.Println(sunday, monday)
   
   slice := []int{1,2,3,4,5,5,6} 
   fmt.Println(remove(slice,2))

   args := map[string]int{
      "aa":11,
      "bb":22,
   }
   fmt.Println(args,args["aa"])
}

func gcd(x,y int) int {
   for y !=0 {
      x, y = y, x%y
   }
   return x
}

func flb(n int) int {
   x, y := 0, 1;
   if n == 1 {
      return x
   }
   for i := 0; i < n; i++ {
      x, y = y, x + y;
   }
   return x
}

func remove(s []int,i int) []int {
   fmt.Println(s[i:],s[i+1:])
   copy(s[i:],s[i+1:])   //copy函数将后一个数组赋值给前一个数组，数组是引用类型数据
   return s[:len(s)-1];
}
