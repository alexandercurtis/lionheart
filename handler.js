/*
 * handler.js
 *
 * Created on 20-Aug-2012 at 13:59
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */

var util = require('util'); 
var fs = require( 'fs' );
var mime = require( 'mime' );
var logger = require( "./logger" );
var mongodb = require( 'mongodb' );

function Handler()
{
  this.sendHeadersOnly = false;
  this.responseCode = 200; // Default response code is 200 OK
      logger.log( logger.DEBUG, "0this.responseCode called too many times? stacktrace TODO: " + this.responseCode );        
  
}

Handler.prototype.setSendHeadersOnly = function( sendHeadersOnly )
{
  this.sendHeadersOnly = sendHeadersOnly;
}

Handler.prototype.setResponseCode = function( responseCode )
{
  this.responseCode = responseCode;
}


function ViewHandler()
{
  // Call the parent constructor
  Handler.call( this );
}

// Inherit Handler
ViewHandler.prototype = new Handler();

// Correct the constructor pointer
ViewHandler.prototype.constructor = ViewHandler;
ViewHandler.prototype.service = function( request, response )
{

//  exec( "ls -lah", function( error, stdout, stderr ) {
//    response.writeHead( this.responseCode, { "Content-Type": "text/plain" } );
//    response.write( stdout );
//    response.end();    
//  });
  this.dispatch( request.path[2], response );

}

ViewHandler.prototype.dispatch = function( urlKey, response )
{
  var self = this;
//  var content = contentFacade.findByUrlKey( urlKey );

var mongoserver = new mongodb.Server("127.0.0.1", mongodb.Connection.DEFAULT_PORT, {});
var db_connector = new mongodb.Db("arcitusdb", mongoserver, {native_parser:true});

db_connector.open( function( err, db ) {
  if( err )
  {
    logger.log( logger.ERROR, err.toString() );
    response.end(); // TODO: Return 5xx code
    db.close();
  }
  else
  {
    db.collection("content", function(err, collection) {
      if( err )
      {
        logger.log( logger.ERROR, err.toString() );
        response.end(); // TODO: Return 5xx code
        db.close();
      }
      else
      {
      //  logger.log( logger.INFO, "Looking up " + urlKey );
        collection.findOne( {urlKey: urlKey}, function(err, document) {
          if( err )
          {
            logger.log( logger.ERROR, err.toString() );
            response.end(); // TODO: Return 5xx code
            db.close();
          }
          else
          {
            var body = '<html>' 
            + '<head>'
            + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
            + '</head>'
            + '<body>'
            + '<h1>ViewHandler</h1>'
//            + '<p>' + request.pathname + '</p>'
            + '<p>' + (document?document.body:"null") + '</p>'
            + '</body>'
            + '</html>';
            
            response.writeHead( self.responseCode, { "Content-Type": "text/html", "Server": APPNAME } );
            if( !self.sendHeadersOnly )
            {
              response.write( body );
            }
            response.end();
            db.close();
          }
        });
      }
    });
  }
});

 
}


function MediaHandler()
{
  // Call the parent constructor
  Handler.call( this );
}

// Inherit Handler
MediaHandler.prototype = new Handler();

// Correct the constructor pointer
MediaHandler.prototype.constructor = MediaHandler;
MediaHandler.prototype.service = function( request, response )
{
  var body = '<html>' 
  + '<head>'
  + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
  + '</head>'
  + '<body>'
  + '<h1>MediaHandler</h1>'
  + '<p>' + request.pathname + '</p>'
  + '</body>'
  + '</html>';
  
  response.writeHead( this.responseCode, { "Content-Type": "text/html", "Server": APPNAME } );
  if( !this.sendHeadersOnly )
  {
    response.write( body );
  }
  response.end();  
}


function FileHandler()
{
  // Call the parent constructor
  Handler.call( this );  
}

// Inherit Handler
FileHandler.prototype = new Handler();

// Correct the constructor pointer
FileHandler.prototype.constructor = FileHandler;
FileHandler.prototype.service = function( request, response )
{
  var self = this;
  var pathname = request.pathname; // Always starts with a '/' (i.e. path starts at root directory)  
  
  // Ignore any hidden file and up-directory parts (to prevent attack)
  if( pathname.indexOf( "/.") >= 0 )
  {
    // TODO: Return 404 content page
  }
  else
  {
    // TODO: Don't hardcode    
    var file = WEBROOT + pathname
    fs.exists( file, function (exists) {
      if( exists )
      {      
        var stat = fs.stat( file , function(err,stats) {
          if( err )
          {
            logger.log( logger.ERROR, "FileHandler " + error );
            response.writeHead(500); // TODO: What happens if we're part way through sending the response and headers have already been sent?
            response.end('Internal HTTP Server Error');
          }
          else
          {
            var size = stats.size;
            var rs = fs.createReadStream( file );
            rs.on( 'error', function(error) {
              logger.log( logger.ERROR, "FileHandler " + error );
              response.writeHead(500); // TODO: What happens if we're part way through sending the response and headers have already been sent?
              response.end('Internal HTTP Server Error');
            });
            var contentType = mime.lookup( file );
            response.writeHead( self.responseCode, { "Content-Type": contentType, "Server": APPNAME, "Content-Length": size } );        
            if( !self.sendHeadersOnly )
            {
              rs.pipe( response );
              rs.on("end", function() {
                response.end(); });              
            }
          }
        });
      }
      else
      {
        // TODO: Return the 404 content page
        response.writeHead(404);
        response.end('Not found');
      }
    });
  }
   
 
}



exports.Handler = Handler;
// Stateless session beans. One instance handles all server requests.
exports.VIEW = new ViewHandler();
exports.MEDIA = new MediaHandler();
exports.FILE = new FileHandler(); // TODO: Should these all be called "servers" instead of "handlers"?



