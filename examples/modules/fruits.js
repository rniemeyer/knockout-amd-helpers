define({
    embeddedTemplate: "<div class='fruits large-12 columns'><p><ul data-bind='foreach: fruits'><li data-bind='html: $data'></li></ul></p></div>",

    fruits: ["Orange", "Pineapple", "Strawberry", "Mango", "Grape"]
});
