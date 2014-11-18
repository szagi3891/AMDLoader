package main


import (
    "os"
    "fmt"
    "io/ioutil"
    "unicode/utf8"
    "strconv"
)

func main() {
    
    if len(os.Args) != 2 {
        
        fmt.Println("Spodziewano się dokładnie jednego parametru");
        os.Exit(1)
    }
    
    
    file := os.Args[1]
    
    content, err := ioutil.ReadFile(file)
    
    if err != nil {
        
        fmt.Println(err)
        os.Exit(1)
    }
    
    
    out := []byte{}
    
    
	for len(content) > 0 {
        
		char, size := utf8.DecodeRune(content)
        
        if char == utf8.RuneError {
            
            for _, charIter := range content[0:size] {
                
                out = append(out, []byte("<" + strconv.FormatInt(int64(charIter), 16) + ">")...);
            }
            
        } else {
        
            out = append(out, content[0:size]...)
        }
        
        content = content[size:]
	}
    
    
    info, errStat := os.Stat(file)
    
    if errStat != nil {
        
        fmt.Println(errStat)
        os.Exit(1)
    }
    
    perm := info.Mode()
    
    
    errWrite := ioutil.WriteFile(file, out, perm)
    
    if errWrite != nil {
        
        fmt.Println(errWrite)
        os.Exit(1)
    }
    
}
