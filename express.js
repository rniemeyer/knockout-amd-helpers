var express = require('express'),
    path = require('path'),
    server = express();

server.use('/', express.static(__dirname));

server.listen(4000);
