define(["knockout"], function(ko) {
    return function() {
        this.articlePath = "articles";
        this.currentArticle = ko.observable("one");
        this.currentArticle.full = ko.computed(function() {
            var current = this.currentArticle();
            return current && this.articlePath + "/" + current;
        }, this);
    };
});