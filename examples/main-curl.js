curl({
    paths: {
        "knockout": "../ext/knockout-3.1.0",
        "knockout-amd-helpers": "../build/knockout-amd-helpers.min"
    },
    pluginPath: "../ext/curl/plugins"
});

curl(["knockout", "modules/app", "knockout-amd-helpers"], function(ko, App) {
    ko.bindingHandlers.module.baseDir = "modules";

    //fruits/vegetable modules have embedded template
    ko.bindingHandlers.module.templateProperty = "embeddedTemplate";

    ko.applyBindings(new App());
});
