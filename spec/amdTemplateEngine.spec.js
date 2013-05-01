define(["knockout", "knockout-amd-helpers"], function(ko) {
    describe("AMD template engine", function() {
        //add an area to place our elements
        var sandbox = document.createElement("div"),
            container;

        sandbox.style.display = "none";
        document.body.appendChild(sandbox);

        //helper to apply bindings, wait, and check result
        var applyBindings = function(bindingString, data, children, callback) {
            runs(function() {
                container = document.createElement("div");
                container.setAttribute("data-bind", bindingString);
                container.innerHTML = children || "";

                sandbox.appendChild(container);

                ko.applyBindings(data, sandbox);
            });

            waits(100);

            runs(callback);
        };

        //clear the sandbox before each test
        afterEach(function() {
            if (sandbox.firstChild) {
                ko.removeNode(sandbox.firstChild);
            }
        });

        it("should load the template properly", function() {
            applyBindings("template: 'person'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                expect(container.innerText).toEqual("person: Jon Black");
            });
        });

        describe("options", function() {
            var path = ko.amdTemplateEngine.defaultPath,
                suffix = ko.amdTemplateEngine.defaultSuffix;

            //reset defaults
            afterEach(function() {
                ko.amdTemplateEngine.defaultPath = path;
                ko.amdTemplateEngine.defaultSuffix = suffix;
            });

            it("should respect the 'defaultPath' option", function() {
                ko.amdTemplateEngine.defaultPath = "templates/alternate-path/";
                applyBindings("template: 'alternate-path'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                    expect(container.innerText).toEqual("alternate-path: Jon Black");
                });
            });

            it("should respect the 'defaultSuffix' option", function() {
                ko.amdTemplateEngine.defaultSuffix = ".html";
                applyBindings("template: 'person-without-tmpl'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                    expect(container.innerText).toEqual("person-without-tmpl: Jon Black");
                });
            });
        });

        it("should still first use a template in a script tag", function() {
            var template = document.createElement("script");
            template.type = "text/html";
            template.id = "person";
            template.text = "<span data-bind='text: first() + \":\" + last()'></span>";
            sandbox.appendChild(template);

            applyBindings("template: 'person'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                expect(container.innerText).toEqual("Jon:Black");
            });

        });
    });
});