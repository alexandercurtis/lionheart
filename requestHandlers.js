/*
 * requestHandlers.js
 *
 * Created on 20-Aug-2012 at 13:59
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */
 
// This is the "front controller", or "dispatcher".
//var exec = require( "child_process" ).exec; // Executes shell commands
var querystring = require( "querystring" );
var fs = require( "fs" );
var formidable = require( "formidable" );

function start( response, request ) {
  console.log( "Request handler 'start' was called." );
  
//  exec( "ls -lah", function( error, stdout, stderr ) {
//    response.writeHead( 200, { "Content-Type": "text/plain" } );
//    response.write( stdout );
//    response.end();    
//  });
  
  var body = '<html>' 
  + '<head>'
  + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
  + '</head>'
  + '<body>'
  + '<form action="/upload" enctype="multipart/form-data" method="post">'
  + '<input type="file" name="upload" multiple="multiple">'
  + '<input type="submit" value="Upload file" />'
  + '</form>'
  + '</body>'
  + '</html>';
  
  response.writeHead( 200, { "Content-Type": "text/html", "Server": APPNAME } );
  response.write( body );
  response.end();   
}

function upload( response, request ) {
  console.log( "Request handler 'upload' was called." );
  
  var form = new formidable.IncomingForm();
  console.log( "about to parse" );
  form.parse( request, function( error, fields, files ) {
    console.log( "parsing done" );
    
    fs.rename( files.upload.path, "/tmp/test.png", function( err ) {
      if( err ) {
        fs.unlink( "/tmp/test.png" );
        fs.rename( files.upload.path, "/tmp/test.png" );
      }
    });
    response.writeHead( 200, { "Content-Type": "text/html", "Server": APPNAME } );
    response.write( "received image:<br/> " );
    response.write( "<img src='/show' />" );    
      //querystring.parse(postData).text );
    response.end();      
  });
}

function show( response, postData ) {
  console.log( "Request handler 'show' was called." );
  fs.readFile( "/tmp/test.png", "binary", function( error, file ) {
    if( error ) {
      response.writeHead( 500, {"Content-Type": "text/plain", "Server": APPNAME} ); // TODO: 404 if file not found
      response.write( error + "\n" );
      response.end();
    } else {
      response.writeHead( 200, {"Content-Type": "image/png", "Server": APPNAME} );
      response.write( file, "binary" );
      response.end();
    }
  });
}
      
exports.start = start;
exports.upload = upload;
exports.show = show;


