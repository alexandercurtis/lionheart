/*
 * logger.js
 *
 * Created on 20-Aug-2012 at 17:00
 *
 * Copyright (c) 2012 Arcitus Solutions Ltd..  All Rights Reserved.
 * This software is the proprietary information of Arcitus Solutions Ltd.
 *
 * @author Alex Curtis <alex@arcitus.co.uk>
 */
 
 
var moment = require( "moment" ); // Time & date manipulation


exports.DEBUG = 0;
exports.INFO = 1;
exports.WARNING = 2;
exports.ERROR = 3;
exports.log = function( level, message )
{
  var prefix;
  switch( level )
  {
    case exports.DEBUG:
      prefix = "DEBUG   ";
      break;
    case exports.INFO:
      prefix = "INFO    ";
      break;
    case exports.WARNING:
      prefix = "WARNING ";
      break;
    case exports.ERROR:
      prefix = "ERROR   ";
      break;
    default:
      prefix = "????    ";
      break;
   }
   
   var now = moment().format("YYMMDDHHmmssSSS");
   
   console.log( now + " " + prefix + " " + message );
}
