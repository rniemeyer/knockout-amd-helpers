define(["knockout", "knockout-amd-helpers"], function(ko) {

    describe("module binding", function() {
        //add an area to place our elements
        var sandbox = document.createElement("div"),
            container;

        sandbox.style.display = "none";
        document.body.appendChild(sandbox);

        //helper to apply bindings, wait, and check result
        var applyBindings = function(bindingString, data, children, callback, containerless) {
            container = document.createElement("div");
            if (!containerless) {
                container.setAttribute("data-bind", bindingString);
                container.innerHTML = children || "";
            }
            else {
                var opening = document.createComment("ko " + bindingString),
                   closing = document.createComment("/ko"),
                    dummy = document.createTextNode("   \n  ");

                container.appendChild(opening);
                container.appendChild(dummy);
                container.appendChild(closing);
            }

            sandbox.appendChild(container);

            ko.cleanNode(sandbox);

            ko.applyBindings(data, sandbox);

            setTimeout(callback, 50);
        };

        //helper to update an observable, wait, and check result
        var updateObservable = function(observable, value, callback) {
            var subscription = observable.subscribe(function() {
               subscription.dispose();
               setTimeout(function() {

                   callback();

               }, 50);
            });

            observable(value);
        };

        //clear the sandbox before each test
        afterEach(function() {
            if (sandbox.firstChild) {
                ko.removeNode(sandbox.firstChild);
            }

            ko.bindingHandlers.module.templateProperty = "";
        });

        ko.bindingHandlers.module.baseDir = "modules/";

        it("should create the binding handler", function() {
            expect(ko.bindingHandlers.module).toBeDefined();
        });

        describe("just passing module name", function() {

            describe("module returns constructor", function() {

                describe("creating instances", function() {
                    it("should create an instance", function(done) {
                        applyBindings("module: 'has-constructor'", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Ted","last":"Jones"}');
                            done();
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function(done) {
                        applyBindings("module: 'has-constructor'", {}, "<span data-bind='text: first() + \" \" + last()'></span>", function() {
                            expect(container.innerText).toEqual("Ted Jones");
                            done();
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the module name as the template, if none specified and no child elements", function(done) {
                        applyBindings("module: 'has-constructor'", {}, null, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                describe("using a containerless binding", function() {
                   it("should respect the containerless binding syntax", function(done) {
                       applyBindings("module: 'has-constructor'", {}, null, function() {
                           expect(container.innerText).toEqual("has-constructor: Ted Jones");
                           done();
                       }, true);
                   });
                });

                describe("only text nodes inside of the element", function() {
                    it("should not consider only text nodes to be an anonymous template", function(done) {
                        applyBindings("module: 'has-constructor'", {}, "  \n  ", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                describe("only text nodes inside of a containerless binding", function() {
                    it("should not consider only text nodes to be an anonymous template", function(done) {
                        applyBindings("module: 'has-constructor'", {}, "  \n  ", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        }, true);
                    });
                });
            });

            describe("module returns data", function() {
                describe("initialization", function() {
                    describe("object includes initialize function", function() {
                        describe("initialize that does not return value", function() {
                            it("should call initialize", function(done) {
                                applyBindings("module: 'static-with-initialize'", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Jane","last":"Black"}');
                                    done();
                                });
                            });
                        });

                        describe("initialize returns value", function() {
                            it("should call initialize and bind against returned value", function(done) {
                                applyBindings("module: 'static-with-initialize-that-returns-object'", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Sue","last":"Greene"}');
                                    expect(data.initialize).toBeUndefined();
                                    done();
                                });
                            });
                        });
                    });

                    describe("object does not include initialize function", function() {
                        it("should not try to call the initialize function", function(done) {
                            applyBindings("module: 'static-no-initialize'", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Bob","last":"Smith"}');
                                done();
                            });
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function(done) {
                        applyBindings("module: 'static-no-initialize'", {}, "<span data-bind='text: first() + \" \" + last()'></span>", function() {
                            expect(container.innerText).toEqual("Bob Smith");
                            done();
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the module name as the template, if none specified and no child elements", function(done) {
                        applyBindings("module: 'static-no-initialize'", {}, null, function() {
                            expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                            done();
                        });
                    });
                });

                describe("using the template property", function() {
                    it("should default to using the template located at the module's `template` property (string)", function(done) {
                        ko.bindingHandlers.module.templateProperty = "template";
                        applyBindings("module: 'has-template'", {}, null, function() {
                            expect(container.innerText).toEqual("I have my own template.");
                            done();
                        });
                    });

                    it("should default to using the template located at the module's `template` property (function)", function(done) {
                        ko.bindingHandlers.module.templateProperty = "templateFunction";
                        applyBindings("module: 'has-template'", {}, null, function() {
                            expect(container.innerText).toEqual("I have my own template.(from a function)");
                            done();
                        });
                    });
                });

                describe("using a custom template property", function() {
                    it("should use the inline `templateProperty` option to locate the template on the module (string)", function(done) {
                        applyBindings("module: { name: 'has-custom-template', templateProperty: 'tpl' }", {}, null, function() {
                            expect(container.innerText).toEqual("I have a custom template.");
                            done();
                        });
                    });

                    it("should use the inline `templateProperty` option to locate the template on the module (function)", function(done) {
                        applyBindings("module: { name: 'has-custom-template', templateProperty: 'tplFunction' }", {}, null, function() {
                            expect(container.innerText).toEqual("I have a custom template.(from a function)");
                            done();
                        });
                    });

                    it("should support using an inline `templateProperty` option that is observable to locate the template on the module", function(done) {
                        var prop = ko.observable("tpl");

                        applyBindings("module: { name: 'has-custom-template', templateProperty: prop }", { prop: prop }, null, function() {
                            expect(container.innerText).toEqual("I have a custom template.");

                            //should update template when option is updated
                            prop("tplFunction");

                            expect(container.innerText).toEqual("I have a custom template.(from a function)");

                            done();
                        });
                    });

                    it("should ignore the inline `templateProperty` option when it does not exist on the module", function(done) {
                        applyBindings("module: { name: 'has-constructor', templateProperty: 'someTemplate' }", {}, null, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });
            });

            describe("binding module name against an observable", function() {
                it("should initially load the proper data/template", function(done) {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        done();
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function(done) {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                it("should respect observables accessed within the binding string", function(done) {
                    var observable = ko.observable("no-initialize");
                    applyBindings("module: 'static-' + test()", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");

                        updateObservable(observable, "with-initialize", function() {
                            expect(container.innerText).toEqual("static-with-initialize: Jane Black");
                            done();
                        });
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                            done();
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "has-constructor", function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");
                                done();
                            });
                        });
                    });

                    it("should handle an observable going back to empty", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "has-constructor", function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");

                                updateObservable(observable, null, function() {
                                    expect(container.innerText).toEqual("");
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("passing options object", function() {
            describe("when supplying an afterRender function", function() {
                it("should call the afterRender function", function(done) {
                    var afterRenderCallback = jasmine.createSpy();
                    applyBindings("module: { name: 'has-constructor', afterRender: mycallback }", { mycallback: afterRenderCallback }, "<span></span>", function() {
                        expect(afterRenderCallback).toHaveBeenCalled();
                        done();
                    });
                });
            });

            describe("using containerless binding", function() {
                it("should respect the containerless binding syntax", function(done) {
                    applyBindings("module: { name: 'has-constructor' }", {}, null, function() {
                        expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        done();
                    }, true);
                });
            });

            describe("module returns constructor", function() {
                describe("creating instances", function() {
                    it("should create an instance", function(done) {
                        applyBindings("module: { name: 'has-constructor' }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Ted","last":"Jones"}');
                            done();
                        });
                    });

                    it("should pass data to the constructor", function(done) {
                        applyBindings("module: { name: 'has-constructor', data: { first: 'Rod', last: 'Redd' } }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Rod","last":"Redd"}');
                            done();
                        });
                    });

                    it("should pass multiple args to constructor", function(done) {
                        applyBindings("module: { name: 'constructor-with-multiple-args', data: ['Stan', 'Vance'] }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Stan","last":"Vance"}');
                            done();
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function(done) {
                        applyBindings("module: { name: 'has-constructor' }", {}, "<span data-bind='text: last() + \" \" + first()'></span>", function() {
                            expect(container.innerText).toEqual('Jones Ted');
                            done();
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the specified template", function(done) {
                        applyBindings("module: { name: 'has-constructor', template: 'person' }", {}, null, function() {
                            expect(container.innerText).toEqual('person: Ted Jones');
                            done();
                        });
                    });

                    it("should use the module name as the template, if none specified and no child elements", function(done) {
                        applyBindings("module: { name: 'has-constructor' }", {}, null, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });
            });

            describe("module returns data", function() {
                describe("initialization", function() {
                    describe("object includes initialize function", function() {
                        it("should call the initialize function", function(done) {
                            applyBindings("module: { name: 'static-with-initialize' }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Jane","last":"Black"}');
                                done();
                            });
                        });

                        it("should pass data to the initialize function", function(done) {
                            applyBindings("module: { name: 'static-with-initialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Lisa","last":"Peterson"}');
                                done();
                            });
                        });

                        it("should pass multiple args to the initialize function", function(done) {
                            applyBindings("module: { name: 'static-with-initialize-multiple-args', data: ['Nina', 'Klinke'] }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Nina","last":"Klinke"}');
                                done();
                            });
                        });

                        describe("call custom initializer", function() {
                            describe("specified in binding", function() {
                                it("should call the custom initialize function", function(done) {
                                    applyBindings("module: { name: 'static-with-initialize', initializer: 'customInitialize' }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Sarah","last":"Wade"}');
                                        done();
                                    });
                                });

                                it("should pass data to the custom initialize function", function(done) {
                                    applyBindings("module: { name: 'static-with-initialize', initializer: 'customInitialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Peterson","last":"Lisa"}');
                                        done();
                                    });
                                });
                            });

                            describe("specified globally", function() {
                                var initializer = ko.bindingHandlers.module.initializer;
                                afterEach(function() {
                                    ko.bindingHandlers.module.initializer = initializer;
                                })

                                it("should call the custom initialize function", function(done) {
                                    ko.bindingHandlers.module.initializer = "customInitialize";
                                    applyBindings("module: { name: 'static-with-initialize' }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Sarah","last":"Wade"}');
                                        done();
                                    });
                                });

                                it("should pass data to the custom initialize function", function(done) {
                                    ko.bindingHandlers.module.initializer = "customInitialize";
                                    applyBindings("module: { name: 'static-with-initialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Peterson","last":"Lisa"}');
                                        done();
                                    });
                                });
                            });
                        });

                        describe("initialize returns value", function() {
                            it("should bind against the returned data", function(done) {
                                applyBindings("module: { name: 'static-with-initialize-that-returns-object', data: { first: 'Andy', last: 'Arnold' } }", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Andy","last":"Arnold"}');
                                    expect(data.initialize).toBeUndefined();
                                    done();
                                });
                            });
                        });
                    })

                    describe("object does not include initialize function", function() {
                        it("should not try to call the initialize function", function(done) {
                            applyBindings("module: { name: 'static-no-initialize' }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Bob","last":"Smith"}');
                                done();
                            });
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function(done) {
                        applyBindings("module: { name: 'static-no-initialize' }", {}, "<span data-bind='text: last() + \"/\" + first()'></span>", function() {
                            expect(container.innerText).toEqual("Smith/Bob");
                            done();
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the specified template", function(done) {
                        applyBindings("module: { name: 'static-no-initialize', template: 'person' }", {}, null, function() {
                            expect(container.innerText).toEqual("person: Bob Smith");
                            done();
                        });
                    });

                    it("should use the module name as the template, if none specified and no child elements", function(done) {
                        applyBindings("module: { name: 'static-no-initialize' }", {}, null, function() {
                            expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                            done();
                        });
                    });
                });
            });

            describe("binding module as options object against an observable", function() {
                it("should initially load the proper data/template", function(done) {
                    var observable = ko.observable({ name: "static-no-initialize" });
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        done();
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function(done) {
                    var observable = ko.observable({ name: "static-no-initialize" });
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");

                        updateObservable(observable, { name: "has-constructor" }, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                it("should run the appropriate afterRender function", function(done) {
                    var afterRenderOne = jasmine.createSpy("afterRenderOne"),
                        afterRenderTwo = jasmine.createSpy("afterRenderTwo"),
                        observable = ko.observable({ name: "static-no-initialize", afterRender: afterRenderOne }),
                        moduleTwo = { name: "has-constructor", afterRender: afterRenderTwo };

                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        expect(afterRenderOne).toHaveBeenCalled();
                        expect(afterRenderTwo).not.toHaveBeenCalled();

                        updateObservable(observable, moduleTwo, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            expect(afterRenderOne.calls.count()).toEqual(1);
                            expect(afterRenderTwo).toHaveBeenCalled();
                            done();
                        });
                    });
                });

                it("should call afterRender, even when initial value was null", function(done) {
                    var observable = ko.observable(null),
                        afterRender = jasmine.createSpy("afterRender");

                    applyBindings("module: test", { test: observable }, null, function() {
                        updateObservable(observable, {
                            name: "static-no-initialize",
                            afterRender: afterRender
                        }, function() {
                            expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                            expect(afterRender.calls.count()).toEqual(1);
                            done();
                        });
                    });
                });

                it("should be able to pass a string for afterRender, which is called off of the module, if it exists", function(done) {
                    var observable = ko.observable(null);

                    applyBindings("module: test", { test: observable }, null, function() {
                        updateObservable(observable, {
                            name: "has-constructor",
                            afterRender: "afterTest"
                        }, function() {
                            expect(container.innerText).toEqual("has-constructor: Theodore Jones");
                            done();
                        });
                    });
                });

                it("should be able to pass a string for afterRender, which does not error, if it does not exist on the module", function(done) {
                    var observable = ko.observable(null);

                    applyBindings("module: test", { test: observable }, null, function() {
                        updateObservable(observable, {
                            name: "has-constructor",
                            afterRender: "badAfterTest"
                        }, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                            done();
                        });
                    });

                    it("should not error out when made null", function(done) {
                        var observable = ko.observable(null);
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                            done();
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, { name: "has-constructor" }, function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");
                                done();
                            });
                        });
                    });

                    it("should handle an observable going back to empty", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, { name: "has-constructor" }, function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");

                                updateObservable(observable, null, function() {
                                    expect(container.innerText).toEqual("");
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            describe("binding options object with observable module name", function() {
                it("should initially load the proper data/template", function(done) {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: { name: observable } }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        done();
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function(done) {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: { name: observable } }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                            done();
                        });
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                            done();
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "has-constructor", function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");
                                done();
                            });
                        });
                    });

                    it("should handle an observable going back to empty", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "has-constructor", function() {
                                expect(container.innerText).toEqual("has-constructor: Ted Jones");

                                updateObservable(observable, null, function() {
                                    expect(container.innerText).toEqual("");
                                    done();
                                });
                            });
                        });
                    });
                });
            });

            describe("binding options object with observable template name", function() {
                it("should initially load the proper data/template", function(done) {
                    var observable = ko.observable("person");
                    applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                        expect(container.innerText).toEqual("person: Bob Smith");
                        done();
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function(done) {
                    var observable = ko.observable("person");
                    applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                        expect(container.innerText).toEqual("person: Bob Smith");

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Bob Smith");
                            done();
                        });
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                            done();
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "person", function() {
                                expect(container.innerText).toEqual("person: Bob Smith");
                                done();
                            });
                        });
                    });

                    it("should handle an observable going back to empty", function(done) {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");

                            updateObservable(observable, "person", function() {
                                expect(container.innerText).toEqual("person: Bob Smith");

                                updateObservable(observable, null, function() {
                                    expect(container.innerText).toEqual("");
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("when accessing $module context property", function() {

            it("should return the current module", function(done) {
                var observable = ko.observable();
                applyBindings("module: 'static-no-initialize'", {}, null, function() {
                    var context = ko.contextFor(container.firstChild);
                    expect(context.$module.first()).toEqual("Bob");
                    done();
                });
            });

            it("should return the current module from inner contexts", function(done) {
                applyBindings("module: { name: 'static-no-initialize' }", {}, "<div data-bind='with: first'><span data-bind='text: $module.last'></span></div>", function() {
                    expect(container.innerText).toEqual("Smith");
                    done();
                });
            });

            it("should return the current module even when inside a parent module", function(done) {
                applyBindings("module: { name: 'static-no-initialize' }", {}, "<span data-bind='text: $module.last'></span><span data-bind=\"module: 'has-constructor'\"><span data-bind='text: $module.last'></span></span>", function() {
                    expect(container.innerText).toEqual("SmithJones");
                    done();
                });
            });

            it("should update the current module when it is updated", function(done) {
                var observable = ko.observable("static-no-initialize");

                applyBindings("module: { name: test }", { test: observable }, "<span data-bind='text: $module.last'></span>", function() {
                    expect(container.innerText).toEqual("Smith");

                    updateObservable(observable, "has-constructor", function() {
                        expect(container.innerText).toEqual("Jones");
                        done();
                    });
                });
            });
        });

        describe("when using the disposeMethod option", function() {
            var mod, called, context,
                observable = ko.observable("static-no-initialize");

            it("should call \"dispose\" by default", function(done) {
                applyBindings("module: { name: test }", { test: observable }, "<span data-bind='text: $module.last'></span>", function() {
                    mod = ko.contextFor(container.firstChild).$module;

                    mod.dispose = function() {
                        called = true;
                        context = this;
                    };

                    updateObservable(observable, null, function() {
                        expect(called).toBeTruthy();
                        expect(context).toEqual(mod);
                        delete mod.dispose;

                        done();
                    });
                });
            });

            it("should allow overriding disposeMethod globally", function(done) {
                var mod, called, context,
                    existing = ko.bindingHandlers.module.disposeMethod,
                    observable = ko.observable("static-no-initialize");

                ko.bindingHandlers.module.disposeMethod = "myDisposeMethod";

                applyBindings("module: { name: test }", { test: observable }, "<span data-bind='text: $module.last'></span>", function() {
                    mod = ko.contextFor(container.firstChild).$module;

                    mod.myDisposeMethod = function() {
                        called = true;
                        context = this;
                    };

                    updateObservable(observable, null, function() {
                        expect(called).toBeTruthy();
                        expect(context).toEqual(mod);
                        delete mod.myDisposeMethod;
                        ko.bindingHandlers.module.disposeMethod = existing;

                        done();
                    });
                });
            });

            it("should allow overriding disposeMethod in binding", function(done) {
                var mod, called, context,
                    observable = ko.observable("static-no-initialize");

                applyBindings("module: { name: test, disposeMethod: 'cleanUp' }", { test: observable }, "<span data-bind='text: $module.last'></span>", function() {
                    mod = ko.contextFor(container.firstChild).$module;

                    mod.cleanUp = function() {
                        called = true;
                        context = this;
                    };

                    updateObservable(observable, null, function() {
                        expect(called).toBeTruthy();
                        expect(context).toEqual(mod);
                        delete mod.cleanUp;

                        done();
                    });
                });
            });

            it("should call the module's dispose when the element is removed", function(done) {
                var mod, called, context,
                    observable = ko.observable("static-no-initialize");

                applyBindings("module: { name: test }", { test: observable }, "<span data-bind='text: $module.last'></span>", function() {
                    mod = ko.contextFor(container.firstChild).$module;

                    mod.dispose = function() {
                        called = true;
                        context = this;
                    };

                    ko.removeNode(container);

                    expect(called).toBeTruthy();
                    expect(context).toEqual(mod);
                    delete mod.dispose;

                    done();
                });
            });
        });
    });
});
