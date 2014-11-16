define([], function(){
    
    return {
        renderBox2 : renderBox2
    };
    
    function renderBox2(node) {
        
        console.log(node, "renderBox2");
        
        console.info(require.toUrl("lib2/jakis.css"), "rozwiązanie ścieżki lib2/jakis.css");
    }
});