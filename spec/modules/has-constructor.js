define(["knockout"], function(ko) {
    return function(data) {
        data = data || {};
        this.first = ko.observable(data.first || "Ted");
        this.last = ko.observable(data.last || "Jones");
        this.afterTest = function(nodes, data) {
            data.first("Theodore");
        };
    };
});