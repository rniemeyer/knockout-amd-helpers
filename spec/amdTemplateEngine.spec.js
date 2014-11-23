define(["knockout", "knockout-amd-helpers"], function(ko) {
    describe("AMD template engine", function() {
        //add an area to place our elements
        var sandbox = document.createElement("div"),
            container;

        sandbox.style.display = "none";
        document.body.appendChild(sandbox);

        //helper to apply bindings, wait, and check result
        var applyBindings = function(bindingString, data, children, callback, done) {
            container = document.createElement("div");
            container.setAttribute("data-bind", bindingString);
            container.innerHTML = children || "";

            sandbox.appendChild(container);

            ko.cleanNode(sandbox);
            ko.applyBindings(data, sandbox);

            setTimeout(callback, 50);
        };

        //clear the sandbox before each test
        afterEach(function() {
            if (sandbox.firstChild) {
                ko.removeNode(sandbox.firstChild);
            }
        });

        it("should load the template properly", function(done) {
            applyBindings("template: 'person'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                expect(container.innerText).toEqual("person: Jon Black");
                done();
            });
        });

        describe("options", function() {
            var path = ko.amdTemplateEngine.defaultPath,
                suffix = ko.amdTemplateEngine.defaultSuffix,
                plugin = ko.amdTemplateEngine.defaultRequireTextPluginName;

            //reset defaults
            afterEach(function() {
                ko.amdTemplateEngine.defaultPath = path;
                ko.amdTemplateEngine.defaultSuffix = suffix;
                ko.amdTemplateEngine.defaultRequireTextPluginName = plugin;
            });

            it("should respect the 'defaultPath' option", function(done) {
                ko.amdTemplateEngine.defaultPath = "templates/alternate-path/";
                applyBindings("template: 'alternate-path'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                    expect(container.innerText).toEqual("alternate-path: Jon Black");
                    done();
                });
            });

            it("should respect the 'defaultSuffix' option", function(done) {
                ko.amdTemplateEngine.defaultSuffix = ".html";
                applyBindings("template: 'person-without-tmpl'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                    expect(container.innerText).toEqual("person-without-tmpl: Jon Black");
                    done();
                });
            });

            it("should respect the 'defaultRequireTextPluginName' option", function(done) {
                ko.amdTemplateEngine.defaultRequireTextPluginName = "text-alternate";
                applyBindings("template: 'text-plugin-name-test'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                    expect(container.innerText).toEqual("text-plugin-name-test: Jon Black");
                    done();
                });
            });
        });

        it("should call the afterRender function only after the template is ready", function(done) {
            var vm = {
                first: ko.observable("Jon"),
                last: ko.observable("Black"),
                rendered: jasmine.createSpy()
            };

            applyBindings("template: { name: 'fresh', afterRender: rendered }", vm, null, function() {
                expect(container.innerText).toEqual("fresh: Jon Black");
                expect(vm.rendered.calls.count()).toEqual(1);
                done();
            });
        });

        it("should call the afterRender function, even if the initial template was empty", function(done) {
            var vm = {
                templateName: ko.observable(""),
                first: ko.observable("Jon"),
                last: ko.observable("Black"),
                rendered: jasmine.createSpy()
            };

            applyBindings("template: { name: templateName, afterRender: rendered }", vm, null, function() {
                vm.templateName("fresh");

                setTimeout(function() {
                    expect(container.innerText).toEqual("fresh: Jon Black");
                    expect(vm.rendered.calls.count()).toEqual(1);
                    done();
                }, 50);
            });
        });

        it("should still first use a template in a script tag", function(done) {
            var template = document.createElement("script");
            template.type = "text/html";
            template.id = "person";
            template.text = "<span data-bind='text: first() + \":\" + last()'></span>";
            sandbox.appendChild(template);

            applyBindings("template: 'person'", { first: ko.observable("Jon"), last: ko.observable("Black") }, null, function() {
                expect(container.innerText).toEqual("Jon:Black");
                done();
            });
        });
    });
});