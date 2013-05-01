define(["knockout"], function(ko) {
    return {
        first: ko.observable(),
        last: ko.observable(),
        initialize: function(first, last) {
            this.first(first || "Shirley");
            this.last(last || "Hanson");
        }
    }
});