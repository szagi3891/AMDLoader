        function mapParser(node) {
            
            var data = node.getAttribute("data-static-amd-map");
            
            if (typeof(data) === "string" && data !== "") {
            } else {
                return null;
            }
            
            if (typeof(JSON) !== "undefined" && typeof(JSON.parse) === "function") {
                return JSON.parse(data);
            }
            
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
            
            function trim(text) {

                var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

                if (typeof(text.trim) === "function") {

                    return text.trim();

                } else {

                    return text === null ? "" : (text + "").replace(rtrim, "");
                }
            }
        }