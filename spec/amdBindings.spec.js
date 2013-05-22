define(["knockout", "knockout-amd-helpers"], function(ko) {

    describe("module binding", function() {
        //add an area to place our elements
        var sandbox = document.createElement("div"),
            container;

        sandbox.style.display = "none";
        document.body.appendChild(sandbox);

        //helper to apply bindings, wait, and check result
        var applyBindings = function(bindingString, data, children, callback, containerless) {
            runs(function() {
                container = document.createElement("div");
                if (!containerless) {
                    container.setAttribute("data-bind", bindingString);
                    container.innerHTML = children || "";
                }
                else {
                    var opening = document.createComment("ko " + bindingString),
                       closing = document.createComment("/ko");

                    container.appendChild(opening);
                    container.appendChild(closing);
                }

                sandbox.appendChild(container);

                ko.applyBindings(data, sandbox);
            });

            waits(100);

            runs(callback);
        };

        //helper to update an observable, wait, and check result
        var updateObservable = function(observable, value, callback) {
            runs(function() {
                observable(value);
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

        ko.bindingHandlers.module.baseDir = "modules/";

        it("should create the binding handler", function() {
            expect(ko.bindingHandlers.module).toBeDefined();
        });

        describe("just passing module name", function() {
            describe("module returns constructor", function() {
                describe("creating instances", function() {
                    it("should create an instance", function() {
                        applyBindings("module: 'has-constructor'", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Ted","last":"Jones"}');
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function() {
                        applyBindings("module: 'has-constructor'", {}, "<span data-bind='text: first() + \" \" + last()'></span>", function() {
                            expect(container.innerText).toEqual("Ted Jones");
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the module name as the template, if none specified and no child elements", function() {
                        applyBindings("module: 'has-constructor'", {}, null, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });
                    });
                });

                describe("using s containerless binding", function() {
                   it("should respect the containerless binding syntax", function() {
                       applyBindings("module: 'has-constructor'", {}, null, function() {
                           expect(container.innerText).toEqual("has-constructor: Ted Jones");
                       }, true);
                   });
                });
            });

            describe("module returns data", function() {
                describe("initialization", function() {
                    describe("object includes initialize function", function() {
                        describe("initialize that does not return value", function() {
                            it("should call initialize", function() {
                                applyBindings("module: 'static-with-initialize'", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Jane","last":"Black"}');
                                });
                            });
                        });

                        describe("initialize returns value", function() {
                            it("should call initialize and bind against returned value", function() {
                                applyBindings("module: 'static-with-initialize-that-returns-object'", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Sue","last":"Greene"}');
                                    expect(data.initialize).toBeUndefined();
                                });
                            });
                        });
                    });

                    describe("object does not include initialize function", function() {
                        it("should not try to call the initialize function", function() {
                            applyBindings("module: 'static-no-initialize'", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Bob","last":"Smith"}');
                            });
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function() {
                        applyBindings("module: 'static-no-initialize'", {}, "<span data-bind='text: first() + \" \" + last()'></span>", function() {
                            expect(container.innerText).toEqual("Bob Smith");
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the module name as the template, if none specified and no child elements", function() {
                        applyBindings("module: 'static-no-initialize'", {}, null, function() {
                            expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        });
                    });
                });
            });

            describe("binding module name against an observable", function() {
                it("should initially load the proper data/template", function() {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function() {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });

                    updateObservable(observable, "has-constructor", function() {
                        expect(container.innerText).toEqual("has-constructor: Ted Jones");
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });
                    });

                    it("should handle an observable going back to empty", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });

                        updateObservable(observable, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });
                });
            });
        });

        describe("passing options object", function() {
            describe("when supplying an afterRender function", function() {
                it("should call the afterRender function", function() {
                    var afterRenderCallback = jasmine.createSpy();
                    applyBindings("module: { name: 'has-constructor', afterRender: mycallback }", { mycallback: afterRenderCallback }, "<span></span>", function() {
                        expect(afterRenderCallback).toHaveBeenCalled();
                    });
                });
            });

            describe("using s containerless binding", function() {
                it("should respect the containerless binding syntax", function() {
                    applyBindings("module: { name: 'has-constructor' }", {}, null, function() {
                        expect(container.innerText).toEqual("has-constructor: Ted Jones");
                    }, true);
                });
            });

            describe("module returns constructor", function() {
                describe("creating instances", function() {
                    it("should create an instance", function() {
                        applyBindings("module: { name: 'has-constructor' }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Ted","last":"Jones"}');
                        });
                    });

                    it("should pass data to the constructor", function() {
                        applyBindings("module: { name: 'has-constructor', data: { first: 'Rod', last: 'Redd' } }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Rod","last":"Redd"}');
                        });
                    });

                    it("should pass multiple args to constructor", function() {
                        applyBindings("module: { name: 'constructor-with-multiple-args', data: ['Stan', 'Vance'] }", {}, "<span></span>", function() {
                            var data = ko.dataFor(container.firstChild);
                            expect(ko.toJSON(data)).toEqual('{"first":"Stan","last":"Vance"}');
                        });
                    });
                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function() {
                        applyBindings("module: { name: 'has-constructor' }", {}, "<span data-bind='text: last() + \" \" + first()'></span>", function() {
                            expect(container.innerText).toEqual('Jones Ted');
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the specified template", function() {
                        applyBindings("module: { name: 'has-constructor', template: 'person' }", {}, null, function() {
                            expect(container.innerText).toEqual('person: Ted Jones');
                        });
                    });

                    it("should use the module name as the template, if none specified and no child elements", function() {
                        applyBindings("module: { name: 'has-constructor' }", {}, null, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });
                    });
                });
            });

            describe("module returns data", function() {
                describe("initialization", function() {
                    describe("object includes initialize function", function() {
                        it("should call the initialize function", function() {
                            applyBindings("module: { name: 'static-with-initialize' }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Jane","last":"Black"}');
                            });
                        });

                        it("should pass data to the initialize function", function() {
                            applyBindings("module: { name: 'static-with-initialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Lisa","last":"Peterson"}');
                            });
                        });

                        it("should pass multiple args to the initialize function", function() {
                            applyBindings("module: { name: 'static-with-initialize-multiple-args', data: ['Nina', 'Klinke'] }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Nina","last":"Klinke"}');
                            });
                        });

                        describe("call custom initializer", function() {
                            describe("specified in binding", function() {
                                it("should call the custom initialize function", function() {
                                    applyBindings("module: { name: 'static-with-initialize', initializer: 'customInitialize' }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Sarah","last":"Wade"}');
                                    });
                                });

                                it("should pass data to the custom initialize function", function() {
                                    applyBindings("module: { name: 'static-with-initialize', initializer: 'customInitialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Peterson","last":"Lisa"}');
                                    });
                                });
                            });

                            describe("specified globally", function() {
                                var initializer = ko.bindingHandlers.module.initializer;
                                afterEach(function() {
                                    ko.bindingHandlers.module.initializer = initializer;
                                })

                                it("should call the custom initialize function", function() {
                                    ko.bindingHandlers.module.initializer = "customInitialize";
                                    applyBindings("module: { name: 'static-with-initialize' }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Sarah","last":"Wade"}');
                                    });
                                });

                                it("should pass data to the custom initialize function", function() {
                                    ko.bindingHandlers.module.initializer = "customInitialize";
                                    applyBindings("module: { name: 'static-with-initialize', data: { first: 'Lisa', last: 'Peterson' } }", {}, "<span></span>", function() {
                                        var data = ko.dataFor(container.firstChild);
                                        expect(ko.toJSON(data)).toEqual('{"first":"Peterson","last":"Lisa"}');
                                    });
                                });
                            });
                        });

                        describe("initialize returns value", function() {
                            it("should bind against the returned data", function() {
                                applyBindings("module: { name: 'static-with-initialize-that-returns-object', data: { first: 'Andy', last: 'Arnold' } }", {}, "<span></span>", function() {
                                    var data = ko.dataFor(container.firstChild);
                                    expect(ko.toJSON(data)).toEqual('{"first":"Andy","last":"Arnold"}');
                                    expect(data.initialize).toBeUndefined();
                                });
                            });
                        });
                    })

                    describe("object does not include initialize function", function() {
                        it("should not try to call the initialize function", function() {
                            applyBindings("module: { name: 'static-no-initialize' }", {}, "<span></span>", function() {
                                var data = ko.dataFor(container.firstChild);
                                expect(ko.toJSON(data)).toEqual('{"first":"Bob","last":"Smith"}');
                            });
                        });
                    });

                });

                describe("using anonymous template", function() {
                    it("should bind properly against the anonymous template", function() {
                        applyBindings("module: { name: 'static-no-initialize' }", {}, "<span data-bind='text: last() + \"/\" + first()'></span>", function() {
                            expect(container.innerText).toEqual("Smith/Bob");
                        });
                    });
                });

                describe("using a named template", function() {
                    it("should use the specified template", function() {
                        applyBindings("module: { name: 'static-no-initialize', template: 'person' }", {}, null, function() {
                            expect(container.innerText).toEqual("person: Bob Smith");
                        });
                    });

                    it("should use the module name as the template, if none specified and no child elements", function() {
                        applyBindings("module: { name: 'static-no-initialize' }", {}, null, function() {
                            expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                        });
                    });
                });
            });

            describe("binding module as options object against an observable", function() {
                it("should initially load the proper data/template", function() {
                    var observable = ko.observable({ name: "static-no-initialize" });
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function() {
                    var observable = ko.observable({ name: "static-no-initialize" });
                    applyBindings("module: test", { test: observable }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });

                    updateObservable(observable, { name: "has-constructor" }, function() {
                        expect(container.innerText).toEqual("has-constructor: Ted Jones");
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });

                    it("should not error out when made null", function() {
                        var observable = ko.observable(null);
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, { name: "has-constructor" }, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });
                    });

                    it("should handle an observable going back to empty", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: observable }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, { name: "has-constructor" }, function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });

                        updateObservable(observable, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });
                });
            });

            describe("binding options object with observable module name", function() {
                it("should initially load the proper data/template", function() {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: { name: observable } }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function() {
                    var observable = ko.observable("static-no-initialize");
                    applyBindings("module: test", { test: { name: observable } }, null, function() {
                        expect(container.innerText).toEqual("static-no-initialize: Bob Smith");
                    });

                    updateObservable(observable, "has-constructor", function() {
                        expect(container.innerText).toEqual("has-constructor: Ted Jones");
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });
                    });

                    it("should handle an observable going back to empty", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "has-constructor", function() {
                            expect(container.innerText).toEqual("has-constructor: Ted Jones");
                        });

                        updateObservable(observable, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });
                });
            });

            describe("binding options object with observable template name", function() {
                it("should initially load the proper data/template", function() {
                    var observable = ko.observable("person");
                    applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                        expect(container.innerText).toEqual("person: Bob Smith");
                    });
                });

                it("should react to an updated observable by rendering the new data/template", function() {
                    var observable = ko.observable("person");
                    applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                        expect(container.innerText).toEqual("person: Bob Smith");
                    });

                    updateObservable(observable, "has-constructor", function() {
                        expect(container.innerText).toEqual("has-constructor: Bob Smith");
                    });
                });

                describe("observable is empty", function() {
                    it("should not error out initially", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });

                    it("should react to an updated observable by rendering the data/template", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "person", function() {
                            expect(container.innerText).toEqual("person: Bob Smith");
                        });
                    });

                    it("should handle an observable going back to empty", function() {
                        var observable = ko.observable();
                        applyBindings("module: test", { test: { name: "static-no-initialize", template: observable } }, null, function() {
                            expect(container.innerText).toEqual("");
                        });

                        updateObservable(observable, "person", function() {
                            expect(container.innerText).toEqual("person: Bob Smith");
                        });

                        updateObservable(observable, null, function() {
                            expect(container.innerText).toEqual("");
                        });
                    });
                });
            });
        });
    });
});