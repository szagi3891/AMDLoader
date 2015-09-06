define([], function(){
    
    return {
        renderBox2 : renderBox2,
        submodule  : submodule
    };
    
    function renderBox2(node) {
        
        console.log(node, "renderBox2");
        
        console.info(require.toUrl("lib2/jakis.css"), "rozwiązanie ścieżki lib2/jakis.css");
        
        addEvent(node, 'click', function(){
            
            console.info("kliknięto, odpalam zagnieżdżony moduł");
            require.runnerBox.runElement(node);
        });
    }
    
    /*
    require.runnerBox.runElement(document.querySelectorAll('*[data-run-module="lib2/box2.renderBox2"]')[0])
    require.runnerBox.runElement(document)
    */
    function submodule(domElement) {
        console.info("IIIII odpaliłem zagnieżdżony element", domElement);
    }
    
    function addEvent(element, event, callback) {

        if (element.addEventListener) {
            element.addEventListener(event, callback, false);
        } else {
            element.attachEvent('on' + event, callback);
        }
    }
});