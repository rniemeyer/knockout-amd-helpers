require.config({
    paths: {
        "knockout": "../ext/knockout-3.0.0",
        "knockout-amd-helpers": "../build/knockout-amd-helpers",
        "text": "../ext/require/text"
    }
});

require(["knockout", "modules/app", "knockout-amd-helpers", "text"], function(ko, App) {
    ko.bindingHandlers.module.baseDir = "modules";
    ko.bindingHandlers.module.templateProperty = "template";

    setTimeout(function() {
        ko.applyBindings(new App());
    }, 0);
});
