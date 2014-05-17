define({
    template: "<div>I have my own template.</div>",

    templateFunction: function() {
        //using "this" to help to verify that it is called with appropriate context
        return this.template + "<div>(from a function)</div>";
    }
});
