//helper functions to support the binding and template engine (whole lib is wrapped in an IIFE)
var require = window.requirejs || window.require || window.curl,
    unwrap = ko.utils.unwrapObservable,
    //call a constructor function with a variable number of arguments
    construct = function(Constructor, args) {
        var instance,
            Wrapper = function() {
                return Constructor.apply(this, args || []);
            };

        Wrapper.prototype = Constructor.prototype;
        instance = new Wrapper();
        instance.constructor = Constructor;

        return instance;
    },
    addTrailingSlash = function(path) {
        return path && path.replace(/\/?$/, "/");
    },
    isAnonymous = function(node) {
        var el = ko.virtualElements.firstChild(node);

        while (el) {
            if (el.nodeType === 1 || el.nodeType === 8) {
                return true;
            }

            el = ko.virtualElements.nextSibling(el);
        }

        return false;
    };