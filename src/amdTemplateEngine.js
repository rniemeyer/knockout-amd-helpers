//an AMD template engine that uses the text plugin to pull templates
(function(ko, require) {
    //get a new native template engine to start with
    var engine = new ko.nativeTemplateEngine(),
        sources = {};

    engine.defaultPath = "templates";
    engine.defaultSuffix = ".tmpl.html";
    engine.defaultRequireTextPluginName = "text";

    //create a template source that loads its template using the require.js text plugin
    ko.templateSources.requireTemplate = function(key) {
        this.key = key;
        this.template = ko.observable(" "); //content has to be non-falsey to start with
        this.requested = false;
        this.retrieved = false;
    };

    ko.templateSources.requireTemplate.prototype.text = function(value) {
        //when the template is retrieved, check if we need to load it
        if (!this.requested && this.key) {
            require([engine.defaultRequireTextPluginName + "!" + addTrailingSlash(engine.defaultPath) + this.key + engine.defaultSuffix], function(templateContent) {
                this.retrieved = true;
                this.template(templateContent);
            }.bind(this));

            this.requested = true;
        }

        //if template is currently empty, then clear it
        if (!this.key) {
            this.template("");
        }

        //always return the current template
        if (arguments.length === 0) {
            return this.template();
        }
    };

    //our engine needs to understand when to create a "requireTemplate" template source
    engine.makeTemplateSource = function(template, doc) {
        var el;

        //if a name is specified
        if (typeof template === "string") {
            //if there is an element with this id and it is a script tag, then use it
            el = (doc || document).getElementById(template);

            if (el && el.tagName.toLowerCase() === "script") {
                return new ko.templateSources.domElement(el);
            }

            //otherwise pull the template in using the AMD loader's text plugin
            if (!(template in sources)) {
                sources[template] = new ko.templateSources.requireTemplate(template);
            }

            //keep a single template source instance for each key, so everyone depends on the same observable
            return sources[template];
        }
        //if there is no name (foreach/with) use the elements as the template, as normal
        else if (template && (template.nodeType === 1 || template.nodeType === 8)) {
            return new ko.templateSources.anonymousTemplate(template);
        }
    };

    //override renderTemplate to properly handle afterRender prior to template being available
    engine.renderTemplate = function(template, bindingContext, options, templateDocument) {
        var templateSource,
            existingAfterRender = options && options.afterRender,
            localTemplate = options && options.templateProperty && bindingContext.$module && bindingContext.$module[options.templateProperty];

        //restore the original afterRender, if necessary
        if (existingAfterRender) {
            existingAfterRender = options.afterRender = options.afterRender.original || options.afterRender;
        }

        //if a module is being loaded, and that module has the template property (of type `string` or `function`) - use that as the source of the template.
        if (localTemplate && (typeof localTemplate === "function" || typeof localTemplate === "string")) {
            templateSource = {
                text: function() {
                    return typeof localTemplate === "function" ? localTemplate.call(bindingContext.$module) : localTemplate;
                }
            };
        }
        else {
            templateSource = engine.makeTemplateSource(template, templateDocument);
        }

        //wrap the existing afterRender, so it is not called until template is actually retrieved
        if (typeof existingAfterRender === "function" && templateSource instanceof ko.templateSources.requireTemplate && !templateSource.retrieved) {
            options.afterRender = function() {
                if (templateSource.retrieved) {
                    existingAfterRender.apply(this, arguments);
                }
            };

            //keep track of the original, so we don't double-wrap the function when template name changes
            options.afterRender.original = existingAfterRender;
        }

        return engine.renderTemplateSource(templateSource, bindingContext, options, templateDocument);
    };

    //expose the template engine at least to be able to customize the path/suffix/plugin at run-time
    ko.amdTemplateEngine = engine;

    //make this new template engine our default engine
    ko.setTemplateEngine(engine);

})(ko, require);
