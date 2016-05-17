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

function getCredentialsContext( cer ) {
  return crypto.createCredentials( {
    key: fs.readFileSync( path.join( __dirname, 'certs', cer + '.key' ) ),
    cert: fs.readFileSync( path.join( __dirname, 'certs', cer + '.crt' ) )
  }).context;
}

// TODO: Read routes from a file, and watch the file for changes


var certs = {
  "alexandercurtis.net": getCredentialsContext( "alexandercurtis" ),
  "arcitus.co.uk": getCredentialsContext( "arcitus" ),
  "logicmill.com": getCredentialsContext( "logicmill" )
};

var options = {
  https: {
    SNICallback: function( hostname ) {
      return certs[hostname];
    }
  },
  hostnameOnly: true,
  router: {
    'alexandercurtis.net': 'localhost:8002',
    'logicmill.com': 'localhost:8001',
    'arcitus.co.uk': 'localhost:8000'
  }
}

var proxyServer = httpProxy.createServer( options );

proxyServer.on('end', function() {
  console.log("The request was proxied.");
});

proxyServer.listen(80);
