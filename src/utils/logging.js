'use strict';

// var winston = require('winston');
// winston.emitErrs = true;

// var logger = new winston.Logger({
//     transports: [
//         // new winston.transports.File({
//         //     level: 'info',
//         //     filename: './logs/all-logs.log',
//         //     handleExceptions: true,
//         //     json: true,
//         //     maxsize: 5242880, //5MB
//         //     maxFiles: 5,
//         //     colorize: false
//         // }),
//         new winston.transports.Console({
//             level: 'debug',
//             handleExceptions: true,
//             json: false,
//             colorize: true
//         })
//     ],
//     exitOnError: false
// });

var util = require('util'),
    winston = require('winston'),
    logger = new winston.Logger({ 
        exitOnError: false 
    }),
    production = false; //(process.env.NODE_ENV || '').toLowerCase() === 'production';

module.exports = {
    middleware: function(req, res, next){
        console.info(req.method, req.url, res.statusCode);
        next();
    },
    production: production,
    stream: {
        write: function(message, encoding){
            console.info(message);
        }
    }
};

// Override the built-in console methods with winston hooks
switch((process.env.NODE_ENV || '').toLowerCase()){
    // case 'production':
    //     production = true;
    //     logger.add(winston.transports.File, {
    //         filename: __dirname + '/application.log',
    //         handleExceptions: true,
    //         exitOnError: false,
    //         level: 'warn'
    //     });
    //     break;
    // case 'test':
    //     // Don't set up the logger overrides
    //     throw 'test'
    default:
        logger.add(winston.transports.Console, {
            colorize: true,
            timestamp: false,
            handleExceptions: true,
            level: 'debug'
        });
        break;
}

function formatArgs(args){
    return [util.format.apply(util.format, Array.prototype.slice.call(args))];
}

console.log = function(){
    logger.info.apply(logger, formatArgs(arguments));
};
console.info = function(){
    logger.info.apply(logger, formatArgs(arguments));
};
console.warn = function(){
    logger.warn.apply(logger, formatArgs(arguments));
};
console.error = function(){
    logger.error.apply(logger, formatArgs(arguments));
};
console.debug = function(){
    logger.debug.apply(logger, formatArgs(arguments));
};

