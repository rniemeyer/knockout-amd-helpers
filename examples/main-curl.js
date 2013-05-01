curl({
    paths: {
        "knockout": "../ext/knockout-2.2.1",
        "knockout-amd-helpers": "../build/knockout-amd-helpers.min"
    },
    pluginPath: "../ext/curl/plugins"
});

curl(["knockout", "modules/app", "knockout-amd-helpers"], function(ko, App) {
    ko.bindingHandlers.module.baseDir = "modules";
    ko.applyBindings(new App());
});
