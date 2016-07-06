var ko = require( "knockout" );
require( "knockout-amd-helpers" );

var moduleContext = require.context( "./modules", true );
var templateContext = require.context( "html!./templates", true );

ko.bindingHandlers.module.loader = function( moduleName, done ) {
	var mod = moduleContext( "./" + moduleName );
	done( mod );
}

ko.amdTemplateEngine.defaultSuffix = ".html";
ko.amdTemplateEngine.loader = function( templateName, done ) {
	var template = templateContext( "./" + templateName + ko.amdTemplateEngine.defaultSuffix );
	done( template );
}

ko.applyBindings( {
	message: "Webpack Test"
} );
