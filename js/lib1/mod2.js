define(["lib/mod3"], function(mod3){
    
    return {
        run : run
    };
    
    function run() {
        
        console.log(mod3, "run ....");
        
        mod3.inc();
        mod3.inc();
        mod3.inc();
        console.log(mod3.getCount(), "licznik");
    }
    
});