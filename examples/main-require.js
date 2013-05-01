require.config({
    paths: {
        "knockout": "../ext/knockout-2.2.1.debug",
        "knockout-amd-helpers": "../build/knockout-amd-helpers",
        "text": "../ext/require/text"
    }
});

require(["knockout", "modules/app", "knockout-amd-helpers", "text"], function(ko, App) {
    ko.bindingHandlers.module.baseDir = "modules";
    ko.applyBindings(new App());
});
