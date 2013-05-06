//helper functions to support the binding and template engine (whole lib is wrapped in an IIFE)
var require = window.require || window.curl,
    unwrap = ko.utils.unwrapObservable,
    //call a constructor function with a variable number of arguments
    construct = function(Constructor, args) {
        var instance,
            Wrapper = function() {
                return Constructor.apply(this, args);
            };

        Wrapper.prototype = Constructor.prototype;
        instance = new Wrapper();
        instance.constructor = Constructor;

        return instance;
    },
    addTrailingSlash = function(path) {
        return path && path.replace(/\/?$/, "/");
    };