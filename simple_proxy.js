/*
 * proxy.js
 *
 * Created on 20-Aug-2012 at 14:00
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */
 
var http = require( 'http' );
var https = require( 'https' );
var httpProxy = require( 'http-proxy' );
var fs = require( 'fs' );
var crypto = require( 'crypto' );
var path = require( 'path' );


var options = {
  router: {
    'arcitus.co.uk': '127.0.0.1:8000',
    'www.arcitus.co.uk': '127.0.0.1:8000',
    'logicmill.com': '127.0.0.1:8001',
    'www.logicmill.com': '127.0.0.1:8001',
    'alexandercurtis.net': '127.0.0.1:8002',
    'www.alexandercurtis.net': '127.0.0.1:8002'
  }
};

var proxyServer = httpProxy.createServer(options); 
proxyServer.listen(80);


