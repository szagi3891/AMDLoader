define([], function(){
    
    return {
        init : init
    };
    
    function init(libloader) {
        
        //dowolna z metod tego komponentu może sobie doładować cokolwiek za pomocą tego loaderka
        
        return {
            
            met1 : met1,
            met2 : met2,
            met3 : met3
        };
        
        
        function met1() {
            
            
        }
        
        function met2() {
        }
        
        function met3() {
        }
    }
    
});