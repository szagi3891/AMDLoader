package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "regexp"
    //"strings"
)


func main() {
    
    contentAmdLoader, errRead := ioutil.ReadFile("../../amdloader.js")
    
    if errRead != nil {
        fmt.Println(errRead)
        os.Exit(1)
    }
    
    contentParserFunc, errReadParser := ioutil.ReadFile("./parse.js")
    
    if errReadParser != nil {
        fmt.Println(errReadParser)
        os.Exit(1)
    }
    
    reg, errCompile := regexp.Compile("(?s)//parseFuncBeginForBuilder.*//parseFuncEndForBuilder")
    
    if errCompile != nil {
        fmt.Println(errCompile)
        os.Exit(1)
    }
    
    out := reg.ReplaceAllString(string(contentAmdLoader), string(contentParserFunc))
    
    if string(contentAmdLoader) == out {
        fmt.Println("Problem z podmianą funkcji parsującej")
        os.Exit(1)
    }
    
    
    errWrite := ioutil.WriteFile("../amdloader.js", []byte(out), 0644)
    
    if errWrite != nil {
        fmt.Println(errWrite)
        os.Exit(1)
    }
    
    fmt.Println("plik zbudowano ...");
}

