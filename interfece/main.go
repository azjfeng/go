package main

import (
	"fmt"
	"net/http"
)

type dollars float32
type database map[string]dollars
func (d dollars) String() string { return fmt.Sprintf("$%.2f", d) } //格式化数据
func main()  {
	db := database{"shoes": 213,"tshirt":23112}

	http.ListenAndServe("localhost:8000", db)
	fmt.Println(db)
}

func (db database) ServeHTTP(w http.ResponseWriter, req *http.Request)  {
	for item, v := range db {
		fmt.Fprintf(w, "%s : %s\n",item, v)
	}
}