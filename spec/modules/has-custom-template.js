define({
    tpl: "<div>I have a custom template.</div>",

    tplFunction: function() {
        //using "this" to help to verify that it is called with appropriate context
        return this.tpl + "<div>(from a function)</div>";
    }
});
