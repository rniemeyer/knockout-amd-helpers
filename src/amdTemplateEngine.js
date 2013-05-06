//an AMD template engine that uses the text plugin to pull templates
(function(ko, require) {
    //get a new native template engine to start with
    var engine = new ko.nativeTemplateEngine(),
        sources = {};

    engine.defaultPath = "templates";
    engine.defaultSuffix = ".tmpl.html";

    //create a template source that loads its template using the require.js text plugin
    ko.templateSources.requireTemplate = function(key) {
        this.key = key;
        this.template = ko.observable(" "); //content has to be non-falsey to start with
        this.requested = false;
    };

    ko.templateSources.requireTemplate.prototype.text = function(value) {
        //when the template is retrieved, check if we need to load it
        if (!this.requested && this.key) {
            require(["text!" + addTrailingSlash(engine.defaultPath) + this.key + engine.defaultSuffix], this.template);
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

        //if a name is specified, then use the
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

    //expose the template engine at least to be able to customize the "defaultPath" at run-time
    ko.amdTemplateEngine = engine;

    //make this new template engine our default engine
    ko.setTemplateEngine(engine);

})(ko, require);