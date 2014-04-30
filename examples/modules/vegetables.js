define([
    'knockout'
], function(ko) {

    var vegetables = {

        'tpl': "<div class='vegetables large-12 columns'><p><ul data-bind='foreach: vegetables'><li data-bind='html: $data'></li></ul></p></div>",

        'vegetables': ['Spinach', 'Arugula', 'Broccoli', 'Peas', 'Carrots']

    };

    return vegetables;

});
