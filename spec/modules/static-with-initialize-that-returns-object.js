define(["knockout"], function(ko) {
    return {
        initialize: function(data) {
            data = data || {};
            return {
                first: ko.observable(data.first || "Sue"),
                last: ko.observable(data.last || "Greene")
            };
        }
    };
});