/*
 * router.js
 *
 * Created on 20-Aug-2012 at 13:59
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */
 
function route( handle, pathname, response, request ) {
  console.log( "About to route a request for " + pathname );
  
  // TODO: Look at all "modules" (hopefully on the fly) and offer pathname to them.
  // If that fails, try static files
  // Else 404
  if( typeof handle[pathname] === 'function' ) {
    handle[pathname]( response, request );
  }
  else
  {
    console.log( "No request handler found for " + pathname );
    response.writeHead( 404, { "Content-Type": "text/plain" } );
    response.write( "404 Not Found" ); // TODO: 404 page
    response.end();    
  }
  
}

exports.route = route;
