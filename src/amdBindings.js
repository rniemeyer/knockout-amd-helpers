//an AMD helper binding that allows declarative module loading/binding
ko.bindingHandlers.module = {
    init: function(element, valueAccessor, allBindingsAccessor, data, context) {
        var extendedContext,
            value = valueAccessor(),
            options = unwrap(value),
            templateBinding = {},
            initializer = ko.bindingHandlers.module.initializer || "initialize";

        //build up a proper template binding object
        if (options && typeof options === "object") {
            //initializer function name can be overridden
            initializer = options.initializer || initializer;

            templateBinding.templateEngine = options.templateEngine;

            //afterRender could be different for each module, create a wrapper
            templateBinding.afterRender = function() {
                var options = unwrap(valueAccessor());

                if (options && typeof options.afterRender === "function") {
                    options.afterRender.apply(this, arguments);
                }
            };
        }

        //if this is not an anonymous template, then build a function to properly return the template name
        if (!isAnonymous(element)) {
            templateBinding.name = function() {
                var template = unwrap(value);
                return ((template && typeof template === "object") ? unwrap(template.template || template.name) : template) || "";
            };
        }

        //set the data to an observable, that we will fill when the module is ready
        templateBinding.data = ko.observable();
        templateBinding["if"] = templateBinding.data;

        //actually apply the template binding that we built. extend the context to include a $module property
        ko.applyBindingsToNode(element, { template: templateBinding }, extendedContext = context.extend({ $module: null }));

        //now that we have bound our element using the template binding, pull the module and populate the observable.
        ko.computed({
            read: function() {
                //module name could be in an observable
                var moduleName = unwrap(value),
                    initialArgs;

                //observable could return an object that contains a name property
                if (moduleName && typeof moduleName === "object") {
                    //get the current copy of data to pass into module
                    initialArgs = [].concat(unwrap(moduleName.data));

                    //name property could be observable
                    moduleName = unwrap(moduleName.name);
                }

                //ensure that data is cleared, so it can't bind against an incorrect template
                templateBinding.data(null);

                //at this point, if we have a module name, then require it dynamically
                if (moduleName) {
                    require([addTrailingSlash(ko.bindingHandlers.module.baseDir) + moduleName], function(mod) {
                        //if it is a constructor function then create a new instance
                        if (typeof mod === "function") {
                            mod = construct(mod, initialArgs);
                        }
                        else {
                            //if it has an appropriate initializer function, then call it
                            if (mod && mod[initializer]) {
                                //if the function has a return value, then use it as the data
                                mod = mod[initializer].apply(mod, initialArgs || []) || mod;
                            }
                        }

                        //update the data that we are binding against
                        extendedContext.$module = mod;
                        templateBinding.data(mod);
                    });
                }
            },
            disposeWhenNodeIsRemoved: element
        });

        return { controlsDescendantBindings: true };
    },
    baseDir: "",
    initializer: "initialize"
};

//support KO 2.0 that did not export ko.virtualElements
if (ko.virtualElements) {
    ko.virtualElements.allowedBindings.module = true;
}
