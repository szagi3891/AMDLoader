use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;


fn main() {
    
    
    let amdloader = read_file("../../../amdloader.js".to_owned());
    let parser    = read_file("../parse.js".to_owned());
    
    
    let lines = amdloader.as_str().lines();
    
    
    let mut out = Vec::new();
    
    enum State {
        Begin,
        In,
        End,
    };
    
    let marker_begin = "//parseFuncBeginForBuilder".to_owned();
    let marker_end   = "//parseFuncEndForBuilder".to_owned();
    
    let mut state    = State::Begin;
    
    for line in lines {
        
        state = match state {
            
            State::Begin => {
                
                if line == marker_begin.as_str() {
                    
                    out.push(parser.as_str());
                    State::In
                
                } else if line == marker_end.as_str() {
                    
                    panic!("Nieprawidłowa koleność markerów");
                    
                } else {
                    
                    out.push(line.clone());
                    State::Begin
                }
            },
            
            State::In => {
                
                if line == marker_begin.as_str() {
                    
                    panic!("Nieprawidłowa koleność markerów");
                    
                } else if line == marker_end.as_str() {
                    
                    State::End
                    
                } else {
                    
                    State::In
                }
            },
            
            State::End => {
                
                if line == marker_begin.as_str() {
                    
                    panic!("Nieprawidłowa koleność markerów");
                    
                } else if line == marker_end.as_str() {
                    
                    panic!("Nieprawidłowa koleność markerów");
                    
                } else {
                    
                    out.push(line);
                    State::End
                }
            },
        };
    }
    
    
    match state {
        
        State::End => {

            let mut file_out = File::create("../../amdloader.js").unwrap();

            for line in out {
                file_out.write_all(line.as_bytes()).unwrap();
                file_out.write_all("\n".as_bytes()).unwrap();
            }

            println!("plik zbudowano ...");
        },
        
        _ => {
            panic!("Nieprawidłowy stan");
        }
    }
}


fn read_file(path_str: String) -> String {
    
    let path    = Path::new(path_str.as_str());
    let display = path.display();
    
    let mut file = match File::open(&path) {
        // The `description` method of `io::Error` returns a string that
        // describes the error
        Err(why) => panic!("couldn't open {}: {}", display, Error::description(&why)),
        Ok(file) => file,
    };
    
    
    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Err(why) => panic!("couldn't read {}: {}", display, Error::description(&why)),
        Ok(_) => {
            
            return s;
        },
    }
}