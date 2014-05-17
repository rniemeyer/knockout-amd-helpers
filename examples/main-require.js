require.config({
    paths: {
        "knockout": "../ext/knockout-3.1.0",
        "knockout-amd-helpers": "../build/knockout-amd-helpers",
        "text": "../ext/require/text"
    }
});

require(["knockout", "modules/app", "knockout-amd-helpers", "text"], function(ko, App) {
    ko.bindingHandlers.module.baseDir = "modules";

    //fruits/vegetable modules have embedded template
    ko.bindingHandlers.module.templateProperty = "embeddedTemplate";

    setTimeout(function() {
        ko.applyBindings(new App());
    }, 0);
});
