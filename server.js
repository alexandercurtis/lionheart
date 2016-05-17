/*
 * server.js
 *
 * Created on 20-Aug-2012 at 13:59
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */

var router = require( "./router" );
var handler = require( "./handler" );
var logger = require( "./logger" );
var config = require( "./config" );
var http = require( "http" );
var https = require('https');
fs = require('fs'); // Global
url = require('url'); // Global
var path = require( "path" );


//var handle = {};
//handle["/"] = requestHandlers.start;
//handle["/start"] = requestHandlers.start;
//handle["/upload"] = requestHandlers.upload;
//handle["/show"] = requestHandlers.show;

VERSION = "0.1";
APPNAME = "Lionheart " + VERSION;

configFile = process.argv[2];
if( !configFile )
{
  configFile = "./lionheart.cfg";
}
var aConfig = new config.Config( logger );
aConfig.load( configFile, function( error ) {

if( error )
{
  console.log( error.toString() );
}
else
{
  APPDOMAIN = aConfig.get( 'domain' );
  if( !APPDOMAIN )
  {
    console.log( "No domain specified." );
  }
  else
  {
    APPPORT = aConfig.get( 'port' );
    if( !APPPORT ) // TODO: Check port is numeric, and < 65536, and not already bound.
    {
      console.log( "No port specified." );
    }
    else
    {
      WEBROOT = aConfig.get( 'webroot' );
      if( !WEBROOT )
      {
        console.log( "No webroot specified." );
      }
      else
      {
        // TODO: Build GET controller list and POST controller list    
        http.createServer( http_handler ).listen( APPPORT, function() {
          logger.log( logger.INFO, "Lionheart HTTP server started for " + APPDOMAIN + ":" + APPPORT );    
        });
      }
    }
  }
}

} );

    
function Request( request )
{
  this.method = request.method;
  var parsedUrl = url.parse( request.url );
  this.setPathname( parsedUrl.pathname );
  
  // IP of client
  var clientIp = null;
  var remoteAddress = request.connection.remoteAddress;
  try {
    clientIp = request.headers['x-forwarded-for'];
  }
  catch ( error ) {
  }
  if( !clientIp )
  {
    clientIp = remoteAddress;
  }    
  this.clientIp = clientIp;
  
  //var query = parsedUrl.query;
}

Request.prototype.setPathname = function( pathname )
{
  // Force pathname to start with a slash
  if( pathname.charAt(0) != '/' )
  {
    pathname = '/' + pathname;
  }  
  this.pathname = pathname; // Includes leading '/'    
  this.path = this.pathname.split( '/' );    // Note, don't use path.sep here because HTTP URLs always use forward slashes.
}

Request.prototype.rewrite = function()
{    
  // Rewrite pathname ( '', '/' => 'index.html'; 'Default.aspx' => 'index.html' ); 
  // TODO: Don't hardcode, allow configurable URL rewriting
  // TODO: Most of these should be answered with a 3xx redirect instead
  if( this.pathname === '' 
  || this.pathname === '/' 
  || this.pathname.substr(0,13).toLowerCase() === '/default.aspx' )
  {
    logger.log( logger.INFO, this.clientIp + " Rewriting request for " + this.pathname + " to /app/home." );
    this.setPathname( 'index.html' );
  }    
}

var http_handler = function (req, res) {
  // wrap calls in a try catch
  // or the node js server will crash upon any code errors
  //try
  {
    // Extract useful information from the request and keep it in our
    // own wrapper class.
    var areq = new Request( req );
    service(false,areq,res);
  }
  //catch( err ) {
  //  // handle errors gracefully
  //  logger.log(logger.ERROR, err);
  //  res.writeHead(500);
  //  res.end('Internal HTTP Server Error');
  //}
};

var https_handler = function( req, res ) {
  // wrap calls in a try catch
  // or the node js server will crash upon any code errors
  try
  {
    // Extract useful information from the request and keep it in our
    // own wrapper class.
    var areq = new Request( req );
    service(true,areq,res);
  }
  catch( err ) {
    // handle errors gracefully
    logger.log(logger.ERROR, err);
    res.writeHead(500);
    res.end('Internal HTTPS Server Error');
  }
};


function service( bSecure, req, response ) 
{
  // TODO: Sessions

  
  // Log the request
  logger.log( logger.INFO, req.clientIp + " " + req.method + (bSecure?"/S ":" ") + req.pathname );
  
  // Rewrite URL if it matches any of our rewrite rules
  req.rewrite();
      
  
  // Find a suitable handler
  var aHandler = null;
  var sendHeadersOnly = false;
  switch( req.method ) {
    case "HEAD":
      // HEAD is the same as GET but we only return the headers
      sendHeadersOnly = true;
      // Fall through to GET
    case "GET":
      // Select a servlet based on first part of path URL (path[0] is blank because of leading '/' in pathname)
      switch( req.path[1] )
      {
        case 'app':
          aHandler = handler.VIEW; // CMS pages
          break;
        case 'media':
          aHandler = handler.MEDIA; // Dynamically resized images
          break;
        default:
          aHandler = handler.FILE; // Static pages, css, js, images etc.
          break;
      }
      break;
    case "POST":
      // TODO: aHandler = handler.find( req.path );
      var aHandler = handler.VIEW;
      aHandler.setResponseCode( 404 );
      req.pathname = "/app/404";       
      break;
    case "PUT":
    case "DELETE":
    case "OPTIONS":
    case "TRACE":
    case "CONNECT":
      aHandler = handler.VIEW; // Returns a 405 Not Allowed response.
      aHandler.setResponseCode( 405 );
      req.pathname = "/app/405.html";
      break;
    default:
      aHandler = handler.VIEW; // Returns a 501 Not Implemented response.
      aHandler.setResponseCode( 501 );
      req.pathname = "/app/501.html";
      break;
  }

  // We should have found a 404 controller if nothing else. If not,
  // it indicates a program error.
  if( !aHandler )
  {
    logger.log( logger.ERROR, "No handler found" );
    aHandler = handler.VIEW; // Returns a 500 Internal Server Error response
    aHandler.setResponseCode( 500 );
    req.pathname = "/app/500.html";
  }
  
  aHandler.setSendHeadersOnly( sendHeadersOnly );
  aHandler.service( req, response );
}



      
/*      
  var httpsOptions =
  {
    key: fs.readFileSync('sovereign-privatekey.pem'),
    cert: fs.readFileSync('sovereign-certificate.pem')
  };
      

  https.createServer( httpsOptions, https_handler ).listen( APPSPORT, function() {
    logger.log( logger.INFO, "Lionheart HTTPS server started for " + APPDOMAIN + ":" + APPSPORT );      
  });   
*/
    
      
  // How to handle POST    
  // done by formidable:    request.setEncoding( "utf8" );
  //    request.addListener( "data", function( postDataChunk ) {
  //      postData += postDataChunk;
  //      console.log( "Received POST data chunk '" + postDataChunk + "'." );
  //    });
  //    
  //    request.addListener( "end", function() {
  //      console.log( "End listener" );
  //      route( handle, pathname, response, postData );
  //    });

  
