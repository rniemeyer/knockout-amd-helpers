define(["knockout"], function(ko) {
    return {
        first: ko.observable(),
        last: ko.observable(),
        initialize: function(data) {
            data = data || {};
            this.first(data.first || "Jane");
            this.last(data.last || "Black");
        },
        customInitialize: function(data) {
            data = data || {};
            this.first(data.last || "Sarah");
            this.last(data.first || "Wade");
        }
    }
});