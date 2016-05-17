/*
 * config.js
 *
 * Created on 20-Aug-2012 at 17:22
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */
 
var logger = require( "./logger" );
var lazy = require("lazy");
var fs = require("fs");

function Config()
{
  this.data = {'dbname':'lionheart'};
}

// Synchronous function
Config.prototype.load = function( filename, callback )
{
  // Filename must be a UTF8 file
  var self = this;
  // TODO: read properties from file
  logger.log( logger.INFO, "Reading config from " + filename );

  var rs = fs.createReadStream( filename );
  rs.setEncoding('utf8'); // Ensure returned lines are strings
  rs.on( 'end', function() { callback( null ); } );
  rs.on( 'error', function(exception) { callback( exception ); } );
  new lazy( rs )
    .lines
    .map(String)
    .forEach(function(line){
      // 23-aug-2012: Work around a bug in Lazy: (see https://github.com/pkrumins/node-lazy/issues/11)
      if( line != "0" )
      {
        var pos = line.indexOf( '=' );            
        var aKey, aValue;
        if( pos >= 0 )
        {
          aKey = line.substr(0, pos);
          aValue = line.substr(pos+1);
        }
        else
        {
          aKey = line;
          aValue = null;
        }
        if( aKey )
        {
          aKey = aKey.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // TODO: Make this a common trim function, or use a node.js lib function
          if( aKey.length > 0 )
          {
            if( aValue )
            {
              aValue = aValue.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // TODO: Make this a common trim function, or use a node.js lib function
            }
            self.data[aKey] = aValue;
            console.log( "(" + aKey + ") => (" + aValue + ")" );
          }          
        }
      }
    }
  );  
}

Config.prototype.get = function( key )
{
  return this.data[key];
}

Config.prototype.set = function( key, value )
{
  this.data[key] = value;
}

exports.Config = Config;
