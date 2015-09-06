define(function(){
    
    return {
        render : render
    };
    
    function render(loader, domElement) {
        
        console.info("niezależna trzecia biblioteka ... ver2", domElement);
        
        loader.get(["sub/komponent"], function(komponent){
            
            console.info("komponent : ", komponent);
            
            var inst = komponent.init(loader);
            
            console.info("instancja komponentu", inst);
        });
    }
    
});