define(["./mod1"], function(mod1){
    
    console.info(mod1, "mod1 doczytany względnie");
    
    console.log("inicjuję moduł box");
    
    
    console.log("odpalam ściąganie mod5");
    require(["lib/mod5"]);
    
    
        //testowe pobranie
    require(["lib/mod1"], function(mod1){

        console.log(mod1, "----- mod1 zwrócony -----");
    });

    require(["lib/mod2"], function(mod2){

        console.log(mod2, "----- mod2 zwrócony -----");

        mod2.run();
    });
    
    
    return {
        renderTime: renderTime
    };
    
    function renderTime(node) {
        console.log(node, "render time");
        
        var color = node.getAttribute("data-color");
        node.style.color = color;
    }
    
});