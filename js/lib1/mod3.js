define([], function(){
    
    var count = 0;
    
    return {
        getCount : getCount,
        inc      : inc
    };
    
    function getCount() {
        return count;
    }
    
    function inc() {
        count++;
    }
    
});