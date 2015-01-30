(function(){
    
    /*
    1  : "Config: Niepoprawna zawartość klucza 'paths'"
    2.1 : "Config: próba konfiguracji z zewnątrz"
    2.2 : "Config: wielokrotna inicjacja"
    3  : "Require: nie została zainicjowana mapa z plikami"
    4  : "define: nie została zainicjowana mapa z plikami"
    5  : "getBasePath: brak znaku /: " + path
    6  : "Problem ze zbudowaniem ścieżki z :" + baseDir + " , " + dirModule + " -> " + outPath
    7  : "combinePath: Nieprawidłowy drugi argument: " + dirModule
    8  : "Problem z pobraniem względnej ścieżki z : "
    9  : "requireModulesWithModuleBase, pierwszy parametr powinien być niepustym stringiem: "
    10 : "requireModules: powtórzona nazwa modułu: "
    11 : "requireModules: wielokrotne wywołanie funkcji zwrotnej: "
    12.1 : "wykryto zależności kołowe w module: "
    12.2 : "doczytany moduł nie wywołał funkcji define"
    13 : "pushDefine - not defined: "
    14 :  "Błąd przy evaluacji modułu: " + nameModule
    15 : "createModule: setDefine: moduł był już zainicjowany -> " + nameModule
    16 : "brak wspiercia dla ścieżek względnych: " + path
    17 : "Problem z rozwiązaniem : " + path
    18 : "Problem z rozwiązaniem : " + path
    19 : "queryCallback: exec: zdublowane wywołanie"
    20 : "queryCallback: exec: array expected"
    21 : "queryCallback: ready -> function expected"
    22 : crosdomain prop - wielokrotnie zdefiniowana
    23 : crosdomain prop - parametr nie jest "niepustym stringiem"
    
    24 : requireGlobal - nieprawidłowe parametry wejściowe
    25 : defineGlobal  - nieprawidłowe parametry wejściowe
        ->1 : drugi argument powinien być funkcją
        ->2 : spodziewano się tablicy
    
    26 : spodziewano się niepustego stringa na wejściu funkcji toUrl

                                poprawne properties
    27 : błędy związane z property window.require
    28 : błędy związane z property window.define
    29 : błędy związane z property window.require.runnerBox
    30 : błędy związane z property window.require.runnerBox.runElement
    31 : błędy związane z property window.require.runnerBox.whenRun
    32 : błedy zwiazane z property window.require.getLogs
    33 : błedy zwiazane z property window.require.defined
    
                                zdeprecjonowane properties
    35 : błędy związane z property window.require.toUrl
    37 : błędy związane z property window.define.amd
    38 : błędy związane z property window.require.isBrowser
    39 : błędy związane z property window.require.specified
    
    //40 ...
    
        ->1 : odczyt zdeprecjonowanej property
        ->2 : próba zapisu zabezpieczonej property
    
    41 : zdublowane uruchomienie kolejki callbacków
    42 : zdublowane przypisane do obiektu
    43 : próba uruchomienia require.runnerBox.whenRun na elemencie który nie jest modułem
    44 : setAsRun - nieprawidłowy stan
    45 : próba wykonania funkcji setDefine na zamkniętym module
    46 : defineOne, brak odpowiednika dla aktualnie wczytywanego pliku na liście modułów
    */
    
    
    var modulesList    = createModuleList();    //mapa z modułami (oraz zależnościami)
    var scriptLoader   = null;                    //obiekt którym ładujemy pliki (tworzony po podaiu mapy z konfiguracją)
    var logs           = createLogs();            //logi
    
    
                                        //interfejs publiczny
    
    freezProperty(window                 , "require"   , requireGlobal                     , false, 27);
    freezProperty(window                 , "define"    , defineGlobal                      , false, 28);
    freezProperty(requireGlobal          , "runnerBox" , createRunnerBox(requireGlobal)    , false, 29);
    freezProperty(requireGlobal.runnerBox, "runElement", requireGlobal.runnerBox.runElement, false, 30);
    freezProperty(requireGlobal.runnerBox, "whenRun"   , requireGlobal.runnerBox.whenRun   , false, 31);
    freezProperty(requireGlobal          , "getLogs"   , logs.getLogs                      , false, 32);
    
    freezProperty(requireGlobal          , "defined"   , isLoad                            , false, 33);
    
    
                                        //depreceted
    
    freezProperty(requireGlobal          , "toUrl"     , toUrl                             , true , 35);
    freezProperty(defineGlobal           , "amd"       , {}                                , true , 37);
    freezProperty(requireGlobal          , "isBrowser" , true                              , true , 38);
    freezProperty(requireGlobal          , "specified" , globalSpecified                   , true , 39);
    
    
                                        //uruchomienie startera
    runStarter(configGlobal, requireGlobal);
    
    function isLoad(path) {
        
        if (scriptLoader === null) {
            return false;
        } else {
            return scriptLoader.isLoad(path);
        }
    }
    
    function globalSpecified(path) {
        
        if (scriptLoader !== null && scriptLoader.isSpecified) {
            return scriptLoader.isSpecified(path);
        }
        
        return false;
    }
    
    function createLogs() {
        
        var list = [];
        
        return {
            error   : error,
            warn    : warn,
            getLogs : getLogs
        };
        
        function error(num, caption) {
            
            push("err", num, caption);
            throwError(num, caption);
        }
        
        function warn(num, caption) {
            
            push("warn", num, caption);
        }
        
        function throwError(num, caption) {

            var messFormat = "amdLoader: errorNumber: " + num;
            
            if (typeof(caption) === "string" && caption !== "") {
                messFormat += ": " + caption;
            }

            var err = Error(messFormat );

            setTimeout(throwErr, 0);

            function throwErr(){
                throw err;
            }
        }
        
        function push(type, num, caption) {
            
            var record = {
                type    : "warn",
                num     : num,
                caption : caption
            };
            
            list.push(record);
            
            //console.warn(record);
        }
        
        function getLogs() {
            
            var copy = [];
            
            for (var i=0; i<list.length; i++) {
                copy.push(list[i]);
            }
            
            return copy;
        }
    }
    
    function freezProperty(obj, prop, value, isDepreceted, errorCode, errorCaption) {
        
        try {
            
            defProp(false);
        
        } catch (e1) {

            try {
            
                defProp(true);
            
            } catch (e2) {
                
                obj[prop] = value;
            }
        }
        
        function defProp(isConfigurable) {
            
            Object.defineProperty(obj, prop, {
                
                get: function() {
                    
                    if (isDepreceted === true) {
                        logs.warn(errorCode + "->1", errorCaption);
                    }
                    
                    return value;
                
                }, set: function(/*val*/) {
                    
                    logs.error(errorCode + "->2", errorCaption);
                
                }, configurable : isConfigurable
            });
        }
    }
    
    function toUrl(url) {
        
        if (isNoEmptyString(url)) {
            
            return scriptLoader.resolvePath(url, "js", true);
            
        } else {
            
            logs.error(26);
        }
    }
    
    function configGlobal(conf) {

        if (scriptLoader === null) {
            
            if (valid(conf.paths)) {

                scriptLoader = createScriptLoader(conf.paths, getMapCrossorigin(conf.crossorigin));
            
            } else {
                
                logs.error(1);
            }

        } else {
            
            logs.error(2.2);
        }
        
                                        //konwertuje na tablicę, która posiada niepuste stringi
                                        //(w przypadku innego typu na wejściu pusta tablica)
        function getMapCrossorigin(list) {
            
            var ret = {};
            
            if (list && list.length > 0) {
                
                for (var i=0; i<list.length; i++) {
                    
                    var prop = list[i];
                    
                    if (isNoEmptyString(prop)) {
                        
                        if (prop in ret) {
                            
                            logs.error(22, prop);
                        
                        } else {
                            
                            ret[prop] = true;
                        }
                    
                    } else {
                        
                        logs.error(23, prop);
                    }
                }
            }
            
            return ret;
        }
        
        
        function valid(paths) {
            
            var count = 0;
            
            for (var prop in paths) {
                
                if (isNoEmptyString(paths[prop])) {
                    count++;
                }
            }

            if (count > 0) {
                return true;
            }
        }
    }

    function requireGlobal(deps, callback) {
        
        if (scriptLoader === null) {
            
            logs.error(3);

        } else {
            
            if (isValidParams(deps, callback, 24.1)) {
                
                if (deps.length > 0) {
                
                    modulesList.requireModules(deps, callback);
                
                } else {
                    
                    logs.error(24.2);
                }
            }
        }
    }
    
    function defineGlobal(deps, moduleDefine, thirdArgs) {

        if (scriptLoader === null) {
            
            logs.warn(4);
        
        } else {
            
            if (arguments.length === 1) {
                
                if (isValidParams([], deps, "25.1")) {
                    modulesList.define([], deps);
                }
            
            } else if (arguments.length === 2) {
                
                if (isValidParams(deps, moduleDefine, "25.2")) {
                    modulesList.define(deps, moduleDefine);
                }
            
            } else if (arguments.length === 3) {
                
                if (isNoEmptyString(deps)) {
                    logs.warn("25.4", deps);
                } else {
                    logs.warn("25.4");
                }
                
                if (isValidParams(moduleDefine, thirdArgs, "25.4")) {
                    modulesList.define(moduleDefine, thirdArgs);
                }
                
            } else {
                
                logs.error("25.5");
            }
        }
    }
    
    function isValidParams(deps, callback, code) {

        if (isArray(deps)) {

            if (typeof(callback) === "function") {

                //ok
                return true;

            } else {

                logs.error(code + "->1");        //, prop
            }

        } else {

            logs.error(code + "->2");
        }
        
        return false;
    }
    
    function createModuleList() {
        
        var list          = {};    //lista z modułami
        var waitingDefine = [];    //to co wpadło za pomocą funkcji define, wpada na tąże listę
        
        return {

            requireModulesWithModuleBase : requireModulesWithModuleBase,
            requireModules               : requireModules,
            requireOne                   : requireOne,
            define                       : defineOne
        };
        
        
        function getBasePath(path, callback) {
            
            var chunks = path.split("/");
            
            if (chunks.length < 2) {
                
                logs.error(5, path);
                return;
            }
            
            chunks.pop();
            
            callback(chunks.join("/"));
        }
        
        
        function combinePath(baseDir, dirModule) {
            
            
            var chunk1 = baseDir.split("/");
            var chunk2 = dirModule.split("/");
            
            
            
            if (chunk2.length > 0) {
                
                if (chunk2[0] === ".") {
                    
                    var outChunks = [];

                    forEach(chunk1, function(item){

                        outChunks.push(item);
                    });
                    
                    forEach(chunk2, function(item){

                        if (item === ".") {
                            //nic nie rób z tym członem
                        } else {
                            outChunks.push(item);
                        }
                    });
                    
                    var outPath = outChunks.join("/");

                    if (outPath.indexOf(baseDir) === 0) {

                        return outPath;

                    } else {

                        logs.error(6, baseDir + " , " + dirModule + " -> " + outPath);
                    }
                
                } else {
                    
                    return dirModule;
                }
            
            } else {
                
                logs.error(7, dirModule);
            }
        }
        
        
        function requireModulesWithModuleBase(moduleName, deps, callback) {
            
            if (isNoEmptyString(moduleName)) {
                
                getBasePath(moduleName, function(basePathModule){

                    var newDeps = [];

                    for (var i=0; i<deps.length; i++) {

                        var newDepItem = combinePath(basePathModule, deps[i]);

                        if (typeof(newDepItem) === "string" && newDepItem !== "") {

                            newDeps.push(newDepItem);

                        } else {
                            
                            logs.error(8, basePathModule + " -> " + deps[i]);
                            return;
                        }
                    }

                    requireModules(newDeps, callback);
                });
                
            } else {
                
                logs.error(9, moduleName);
            }
        }
        
        
        //zwraca listę modułów - pod warunkiem że wszystkei zostały poprawnie zainicjowane
        function requireModules(deps, callback) {
            
            var isExec   = false;
            var retValue = {};
            
            
            forEach(deps, function(depsName){
                
                if (depsName in retValue) {
                    
                    logs.error(10, depsName);
                    
                } else {
                    
                    retValue[depsName] = {
                        isInit : false,
                        value  : null
                    };
                    
                    requireOne(depsName, function(moduleValue){

                        var moduleInfo = retValue[depsName];

                        if (moduleInfo.isInit === false) {

                            moduleInfo.isInit = true;
                            moduleInfo.value  = moduleValue;

                            refreshStatus();

                        } else {

                            logs.error(11, depsName);
                        }
                    });
                }
            });
            
            refreshStatus();
            
            function refreshStatus() {
                
                if (isExec === false) {
                    
                    isExec = true;
                    
                    
                    var arrReturn = [];
                    
                    for (var i = 0; i < deps.length; i++) {
                        
                        var modName = deps[i];
                        
                        if (retValue[modName].isInit === true) {
                            arrReturn.push(retValue[modName].value);
                        } else {
                            return;
                        }
                    }
                    
                                                            //dozwolone jest wywołanie bez funkcji zwrotnej
                    if (typeof(callback) === "function") {
                        callback.apply(null, arrReturn);
                    }
                }
            }
        }
        
        
        function requireOne(path, callback) {
            
            var fullPath = scriptLoader.resolvePath(path, "js", true);
            
            if (fullPath in list) {
                
                //ok
            
            } else  {
                
                list[fullPath] = createModule(path);
                
                scriptLoader.load(fullPath, function(){
                    
                    definePushToModule(fullPath);
                });
            }
            
            list[fullPath].get(callback);
        }

        function definePushToModule(actualLoadingPath) {
                        
            if (actualLoadingPath in list) {
                
                while (waitingDefine.length > 0) {

                    var item = waitingDefine.shift();

                    if (isCircleDeps(actualLoadingPath, item.deps)) {

                        logs.error(12.1, actualLoadingPath);

                    } else {
                        
                        list[actualLoadingPath].setDefine(item.deps, item.define);
                    }
                }
                                            //dla doczytywanych plików które nie robią define na końcu pliku
                list[actualLoadingPath].closeDefine();
                
            } else {
                
                logs.error(13, actualLoadingPath);
            }
        }
        

        function defineOne(deps, moduleDefine) {
            
            var actualLoading = scriptLoader.getActialLoading();
            
            if (isNoEmptyString(actualLoading)) {
                
                if (actualLoading in list) {
                    
                    list[actualLoading].setDefine(deps, moduleDefine);
                
                } else {
                    
                    logs.error(46, actualLoading);
                }
            
            } else {
            
                waitingDefine.push({
                    deps: deps,
                    define : moduleDefine
                });
            }
        }
        
        
        function isCircleDeps(path, depsList) {
            
            var isScan  = {};
            var waiting = [];
            
            appendArray(waiting, depsList);
            
            while (waiting.length > 0) {
                
                process();
            }
            
            
            return (path in isScan);
            
            
            function appendArray(target, newElements) {
                
                forEach(newElements, function(item){
                    target.push(item);
                });

            }
            
            function process() {
                
                var depsItem = waiting.shift();
                
                if (depsItem in isScan) {
                    
                    //pomijam, zależnośc była skanowana
                    
                } else {
                    
                    isScan[depsItem] = true;
                    
                    if (depsItem in list) {
                        
                        var newDeps = list[depsItem].getDeps();
                        
                        appendArray(waiting, newDeps);
                        
                    } else {
                    
                        //brak wiadomych obecnie zależności
                    }
                }
            }
        }  
    }
    
    function createModule(nameModule) {
        
        var isInit        = false;
        var isClose       = false;
        
        var depsNamesSave = null;
        var evalValue     = null;

        var waiting       = queryCallbackAsync();
        
        
        return {
            isDefine    : isDefine,
            setDefine   : setDefine,
            getDeps     : getDeps,
            get         : get,
            closeDefine : closeDefine
        };
        
        
        function closeDefine() {
            
            isClose = true;
            
            if (isInit === false) {
                
                isInit = true;
                waiting.exec([undefined]);
            }
        }
        
        
        function isDefine() {
            return isInit;
        }
        
        
        function get(callback) {
            
            waiting.add(callback);
        }
        
        
        function setDefine(depsName, defineModuleFunction) {
            
            if (isClose === true) {
                
                logs.error(45, nameModule);
                return;
            }
            
            if (isInit === false) {
                
                isInit = true;
                
                depsNamesSave = depsName;
                
                setTimeout(function(){
                    
                    modulesList.requireModulesWithModuleBase(nameModule, depsName, function(){
                        
                        var depsValue = Array.prototype.slice.call(arguments, 0);
                        
                        try {

                            evalValue = defineModuleFunction.apply(null, depsValue);

                        } catch (errEval) {

                            logs.error(14, nameModule);

                            setTimeout(function(){
                                throw errEval;
                            }, 0);

                            return;
                        }


                        waiting.exec([evalValue]);
                    });
                });

            } else {
            
                logs.error(15, nameModule);
            }
        }
        
        
        function getDeps() {
            
            if (isInit === true) {
                
                return depsNamesSave;
            
            } else {
            
                return [];
            }
        }
    }
        
    function createScriptLoader(configPath, crossorigin) {
        
                                            //znaczniki script, z aktualnie ładowanymi modułami
        var loadingScriprs = {};
        
        
        return {
            load             : load,
            getActialLoading : getActialLoading,
            resolvePath      : resolvePath,
            isLoad           : isLoadLocal,
            isSpecified      : isSpecified
        };
        
        
        function isSpecified(path) {
            
            var fullPath = resolvePath(path, "js", false);
            
            if (isNoEmptyString(fullPath)) {
                 
                if (fullPath in loadingScriprs) {
                    return true;
                }
            }
            
            return false;
        }
        
        function resolvePath(path, extension, errReport) {
            
            if (path.length > 0 && path[0] === ".") {
                
                if (errReport === true) {
                    logs.error(16, path);
                }
            
                return;
            }
            
            if (path.substr(0, 8) === "https://") {
                
                return path;
                
            } else if (path.substr(0, 7) === "http://") {
                
                return path;
            
            } else if (path.substr(0, 2) === "//") {
                
                return path;
            
                                                            //path typu platforma/zasob
            } else {
            
                for (var alias in configPath) {
                                                            //alias na samym pocz<b9>tku musi si<ea> znajdowa<e6>
                    if (path.indexOf(alias + "/") === 0) {

                        var newPath = path.replace(alias, configPath[alias]);

                        if (path !== newPath) {
                            
                            return newPath + "." + extension;

                        } else {
                            
                            if (errReport === true) {
                                logs.error(17, path);
                            }
                            
                            return;
                        }
                    }
                }
            }
            
            if (errReport === true) {
                logs.error(18, path);
            }
        }
        
        function getActialLoading() {
            
            for (var prop in loadingScriprs) {
                 
                if (loadingScriprs[prop].script.readyState === 'interactive') {
                    
                    return prop;
                }
            }
            
            return null;
        }
        
        function isLoadLocal(path) {
            
            var fullPath = resolvePath(path, "js", true);
            
            if (isNoEmptyString(fullPath)) {
                 
                if (fullPath in loadingScriprs) {
                    return loadingScriprs[fullPath].query.isExec();
                }
            }
            
            return false;
        }
        
        function load(fullPath, callback) {
            
            if (isNoEmptyString(fullPath)) {
                 
                if (fullPath in loadingScriprs) {

                    //ok

                } else {

                    var script = loadScript(fullPath, function(){
                        
                        loadingScriprs[fullPath].query.exec([]);
                    });
                    
                    loadingScriprs[fullPath] = {
                        script: script,
                        query : queryCallbackSync()
                    };
                    
                                            //ze względu na kesze IE.
                    appendToDom(script);
                }

                loadingScriprs[fullPath].query.add(callback);
            
            } else {
                
                //... nie złądowano ...
            }
        }
        
                                            //sprawdzam, czy dla tej domeny włączyć nagłówek crossorigin="anonimus"
        function isCrossorigin(path) {
            
            for (var prefix in crossorigin) {
                
                if (path.substr(0, prefix.length) === prefix) {
                    return true;
                }
            }
            
            return false;
        }
        
        function appendToDom(script) {
            
            document.getElementsByTagName('head')[0].appendChild(script);
        }
        
        function loadScript(path, callback) {
            
                                            //Opcja do testowania zachowania ładowania pod IE
            var ieTestBehavior = false;
            
            var isExec    = false;                    
            var script    = document.createElement('script');

            script.type   = 'text/javascript';
            script.src    = path;
            script.onload = runCallback;
            script.async  = true;
            script.defer  = true;
            
            if (ieTestBehavior === true) {
                script.readyState = 'interactive';
            }
            
            if (isCrossorigin(path)) {
                script.setAttribute("crossorigin", "anonymous");
            }            
            
            script.onreadystatechange = onreadystatechange;
            
            return script;
            
            
            function onreadystatechange() {
                
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    runCallback();
                }
            }

            function runCallback() {
                
                if (isExec === true) {
                    return;
                }
                
                if (ieTestBehavior === true) {
                    script.readyState = undefined;
                }
                
                isExec = true;
                
                callback(script);
            }
            
            /*
            crossorigin:
            
            http://danlimerick.wordpress.com/2014/01/18/how-to-catch-javascript-errors-with-window-onerror-even-on-chrome-and-firefox/
            http://blog.errorception.com/2012/12/catching-cross-domain-js-errors.html

            crossorigin
            crossorigin="anonymous"

            http://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
            https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
            
            
            https://github.com/stacktracejs/stacktrace.js
            https://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/0.6.4/stacktrace.js
            */
        }
    }

    function forEach(list, callback){
        
        for (var i=0; i<list.length; i++) {
            callback(list[i]);
        }
    }
    
    function isNoEmptyString(value) {

        return typeof(value) === "string" && value !== "";
    }
    
                                    //kolejka żądań opróżniana jest synchronicznie
    function queryCallbackSync() {
        return queryCallback(true);
    }
    
                                    //kolejka żądań oprózniana jest asynchronicznie
    function queryCallbackAsync() {
        return queryCallback(false);
    }
    
    function queryCallback(isSync) {
        
        var isExec   = false;
        var waitList = [];
        var argsEmit = null;
        
        
        return {
            
            'exec'   : exec,
            'add'    : add,
            'isExec' : isExecFn
        };
        
        function isExecFn() {
            return isExec;
        }
        
        function exec(args) {
            
            if (isArray(args)) {
                
                if (isExec === false) {
                    
                    isExec   = true;
                    argsEmit = args;                    
                    refreshState();
                    
                } else {
                    
                    logs.error(19);
                }
            
            } else {
                
                logs.error(20);
            }
        }
        
        function refreshState() {
            
            if (isExec === true) {
                
                while (waitList.length > 0) {
                    
                    if (isSync === true) {
                        runCallbackSync(waitList.shift());
                    } else {
                        runCallbackAsync(waitList.shift());
                    }
                }
            }
        }
        
        function runCallbackAsync(functionItem) {
            setTimeout(function(){
                functionItem.apply(null, argsEmit);
            }, 0);
        }
        
        function runCallbackSync(functionItem) {
            functionItem.apply(null, argsEmit);
        }
        
        function add(call) {
            
            if (typeof(call) === "function") {
                
                waitList.push(call);
                refreshState();
                
            } else {
                
                logs.error(21);
            }
        }
    }
    
    function isArray(arg) {
        
        if(typeof(Array.isArray) === "function") {
            
            return Array.isArray(arg);
        
        } else {
        
            return Object.prototype.toString.call(arg) === '[object Array]';
        }
    }

    function createRunnerBox(require){

        var attrNameToRun   = "data-run-module";
        var propStorageName = 'runnerBoxElementProp' + ((new Date()).getTime());
        
        
        return {
            "runElement"  : runElement,
            "whenRun"     : whenRun
        };
        
        
        function getObject(item) {
            
            if (propStorageName in item) {
                //ok
            } else {
                item[propStorageName] = createMapper();
            }
            
            return item[propStorageName];
        }
                
        function createEventHard() {

            var isReady  = false;
            var callback = [];

            return {
                on : on,
                exec : exec
            };

            function refresh() {
                if (isReady === true) {
                    while (callback.length > 0) {
                        runCallback(callback.shift());
                    }
                }
            }

            function runCallback(callback) {
                setTimeout(callback, 0);
            }

            function exec() {
                if (isReady === false) {
                    isReady = true;
                    refresh();
                } else {
                    logs.error(41);
                    refresh();
                }
            }

            function on(newCallback) {
                callback.push(newCallback);
                refresh();
            }
        }

        function createMapper() {

            var isRunFlag = false;
            var value     = null;
            var event     = createEventHard();
            
            return {
                onReady  : onReady,
                setAsRun : setAsRun,
                setValue : setValue,
                isRun    : isRun
            };
            
            function isRun() {
                return isRunFlag;
            }
            
            function onReady(callback) {
                event.on(function(){
                    callback(value);
                });
            }
            
            function setAsRun() {
                
                if (isRunFlag === false) {
                    isRunFlag = true;
                } else {
                    logs.error(44);
                }
            }
            
            function setValue(newValue) {

                if (isRunFlag === true) {
                    
                    value     = newValue;
                    event.exec();
                
                } else {
                    logs.error(42);
                }
            }
        }
        
        function runElement(domElementToRun) {

            
            var list = findFromDocument(domElementToRun);
            
            
            forEachRun(list, function(item){
                
                
                var widgetName = getRunModuleName(item);


                var part = widgetName.split(".");

                if (part.length !== 2) {
                    throw Error("Nieprawidłowy format uruchamianego modułu: " + widgetName);
                }
                                
                
                var moduleName   = part[0];
                var moduleMethod = part[1];


                require([moduleName], function(module){
                    
                    if (toRunnable(item) === true) {
                        
                        if (module && typeof(module[moduleMethod]) === "function") {
                            
                            getObject(item).setAsRun();
                            
                            var modEval = module[moduleMethod](item);
                            
                            getObject(item).setValue(modEval);
                            
                            item.setAttribute(attrNameToRun + "-isrun", "1");

                        } else {

                            throw Error("Brak zdefiniowanej funkcji \"" + moduleMethod + "\" dla : " + moduleName);
                        }
                    }
                });

            });
        }
        
        
        function forEachRun(list, callback) {
                                                    //utwórz kopię
            var copy = [];

            for (var i=0; i<list.length; i++) {
                copy.push(list[i]);
            }
                                                    //uruchom dla wszystkich elementów
            for (var k=0; k<copy.length; k++) {
                runCallback(copy[k]);
            }

            function runCallback(item) {

                setTimeout(function(){

                    callback(item);
                }, 0);
            }
        }
        
        function findFromDocument(elementSearch) {
            
            var listWidgetsRun = elementFindAll(elementSearch, "*[" + attrNameToRun + "]", attrNameToRun);
            
            var result = [];
            var item   = null;
            
            for (var i=0; i<listWidgetsRun.length; i++) {

                item = listWidgetsRun[i];

                if (isAddToExec(item) === true) {
                    result.push(item);
                }
            }
            
            return result;
            
            
            function isAddToExec(elementTest) {

                var countRecursion = 0;

                return isAddToExecInner(elementTest.parentNode);

                function isAddToExecInner(element) {

                    countRecursion++;

                    if (countRecursion > 200) {
                        recursionError();
                        return true;
                    }
                    
                    if (toRunnable(element) === true) {
                        return false;
                    }

                    if (element.tagName === "HTML") {
                        return true;
                    }

                    if (element.parentNode) {
                        return isAddToExecInner(element.parentNode);
                    }

                    return true;
                }
                
                function recursionError() {

                    var error = Error("Too much recursion");

                    setTimeout(function(){
                        throw error;
                    }, 0);
                }
            }
        }
        
        function elementFindAll(element, selector, attribute) {

            if (element === document) {
                element = document.documentElement;
            }


            //dla nowych przeglądarek

            if (typeof(element.querySelectorAll) === "function") {
                return convertToArray(element.querySelectorAll(selector));
            }


            //dla starszych przeglądarek

            var outList = [];

            scan(element);
            
            return outList;
            

            function scan(node) {

                var child = node.childNodes;

                for (var i=0; i<child.length; i++) {

                    checkNode(child[i]);
                }

                function checkNode(scanNode) {

                    if (scanNode.nodeType === 1 && attrMatch(scanNode)) {

                        outList.push(scanNode);
                        return;
                    }

                    scan(scanNode);
                }

                function attrMatch(scanNode) {

                    var value = scanNode.getAttribute(attribute);

                    return (typeof(value) === "string" && value !== "");
                }
            }


            function convertToArray(list) {

                var out = [];

                for (var i=0; i < list.length; i++) {
                    out.push(list[i]);
                }

                return out;
            }
        }

        function whenRun(element, callback) {
            
            if (hasClassRunnable(element)) {
                
                getObject(element).onReady(callback);
            
            } else {
            
                logs.error(43);
            }
        }
        
        function hasClassRunnable(element) {
            
            var value = element.getAttribute(attrNameToRun);
            
            return (typeof(value) === "string" && value !== "");
        }
        
        function toRunnable(element) {
            
            return (hasClassRunnable(element) && getObject(element).isRun() === false);
        }
        
        function getRunModuleName(item) {
            
            var widgetName = item.getAttribute(attrNameToRun);
            
            if (typeof(widgetName) === "string" && widgetName !== "") {
                
                return widgetName;
            }
            
            return null;
        }
    }
    
                                //amd module starter
    function runStarter(configGlobal, require){

        var JSONParse = createJSONParser();

        var scriptList = document.getElementsByTagName('script');

        for (var i=0; i<scriptList.length; i++) {

            if (runRequire(scriptList[i]) === true) {
                return;
            }
        }

        function runRequire(node) {

            var map = node.getAttribute("data-static-amd-map");

            if (typeof(map) === "string" && map !== "") {

                var mapAmd = JSONParse(map);

                runRequireMap(configGlobal, mapAmd, getListPreLoad(), getTimeoutStart(), getCrossorigin());

                return true;
            }

            function getListPreLoad() {

                var list = node.getAttribute("data-amd-preload");

                if (isNoEmptyString(list)) {
                    return list.split(",");
                } else {
                    return [];
                }
            }

            function getTimeoutStart() {

                var timeoutStart = node.getAttribute("data-timeout-start");

                if (isInt(timeoutStart) && timeoutStart > 0) {
                    return timeoutStart;
                } else {
                    return 2000;
                }
            }

            function getCrossorigin() {

                var value = node.getAttribute("data-crossorigin");

                if (isNoEmptyString(value)) {
                    return value.split(",");
                } else {
                    return [];
                }
            }

            function isInt(value){

                return (typeof(value) === 'number' && !isNaN(value) && (value === (value | 0)));
            }
        }

        function runRequireMap(configGlobal, pathConfig, listPreload, timeoutStart, listCrossorigin){

            var runMain = onlyOnce(function(){
                setTimeout(main, 0);
            });

            addEvent(window, "load", runMain);
            addTimeoutAfterDocumentReady(runMain, timeoutStart);        //timeout, po document.ContentLoad który odpala uruchamianie

            function main() {

                configGlobal({
                    paths: pathConfig,
                    crossorigin: listCrossorigin
                });

                if (listPreload.length > 0) {
                    require(listPreload, function(){});
                }

                require.runnerBox.runElement(document);
            }
        }


        function onlyOnce(func) {

            var isExec = false;

            return function(){

                if (isExec === false) {

                    isExec = true;

                    func();
                }
            };
        }

        function addTimeoutAfterDocumentReady(runFunc, time) {

            var isTimeoutRun = false;

            if (isReady()) {
                runTimeout();
            }
            
            addEvent(document, 'DOMContentLoaded', runTimeout);
            addEvent(document, 'readystatechange', function(){
                
                if (isReady()) {
                    runTimeout();
                }
            });
            
            
            if (isVisibility() === false) {
                runTimeout();
            }
            
            
            function runTimeout() {

                if (isTimeoutRun === false) {

                    isTimeoutRun = true;
                    setTimeout(runFunc, time);
                }
            }

            function isReady() {

                return (document.readyState === "complete" || document.readyState === "loaded");
            }    
            
            function isVisibility() {
                
                var value = getValue();
                
                if (value === "hidden" || value === "prerender") {
                    return false;
                }
                
                return true;
                
                function getValue() {
                    
                    var keys = [
                              "visibilityState",
                           "mozVisibilityState",
                            "msVisibilityState",
                             "oVisibilityState",
                        "webkitVisibilityState"
                    ];
                    var prop, i;
                    
                    try {

                        for (i = 0; i < keys.length; i++) {

                            prop = keys[i];

                            if (prop in document) {
                                return document[prop];
                            }
                        }

                        return undefined;

                    } catch (e) {

                        return undefined;
                    }
                }
            }
        }


        function createJSONParser(){

            if (typeof(JSON) !== "undefined" && typeof(JSON.parse) === "function") {

                return function() {

                    return JSON.parse.apply(JSON, arguments);
                };
            }        
            
            return function(data) {

                var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

                var requireNonComma,
                    depth = null,
                    str = trim( data + "" );

                return str && !trim(str.replace(rvalidtokens, function(token, comma, open, close) {

                    if (requireNonComma && comma) {
                        depth = 0;
                    }

                    if (depth === 0) {
                        return token;
                    }

                    requireNonComma = open || comma;

                    depth += !close - !open;

                    return "";
                })) ?
                    (Function("return " + str))() :
                    null;
            };
        }

        function trim(text) {

            var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

            if (typeof(text.trim) === "function") {

                return text.trim();

            } else {

                return text === null ? "" : (text + "").replace(rtrim, "");
            }
        }


        function addEvent(element, event, callback) {

            if (element.addEventListener) {
                element.addEventListener(event, callback, false);

            } else if (element.attachEvent) {
                element.attachEvent('on' + event, callback);

            } else {
                throw Error('jsstarter -> addEvent -> nieprawidlowe odgalezienie');
            }
        }
    }
    
}());


