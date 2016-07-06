var path = require( "path" );

module.exports = {
    entry: "./app.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    resolve: {
        alias: {
            "knockout-amd-helpers": path.join( __dirname, "../../build/knockout-amd-helpers" ),
            knockout: path.join( __dirname, "../../ext/knockout-3.4.1" )
        }
    }
};
