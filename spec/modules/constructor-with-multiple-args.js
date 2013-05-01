define(["knockout"], function(ko) {
    return function(first, last) {
        this.first = ko.observable(first || "James");
        this.last = ko.observable(last || "Zakos");
    };
});