
/*!
 * Connect - vhost
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , utils = require('../utils');

/**
 * Vhost:
 * 
 *   Setup vhost for the given `hostname` and `server`.
 *
 *     connect()
 *       .use(connect.vhost('foo.com', fooApp))
 *       .use(connect.vhost('bar.com', barApp))
 *       .use(connect.vhost('*.com', mainApp))
 *
 *  The `server` may be a Connect server, middleware or
 *  a regular Node `http.Server`. 
 *
 * @param {String} hostname
 * @param {Server} server
 * @return {Function}
 * @api public
 */

module.exports = function vhost(hostname, server){
  if (!hostname) throw new Error('vhost hostname required');
  if (!server) throw new Error('vhost server required');
  var regexp = new RegExp('^' + hostname.replace(/[*]/g, '(.*?)') + '$', 'i');
  if (server.onvhost) server.onvhost(hostname);

  return utils.withUpgrade(function vhost(req, res, next){
    if (!req.headers.host) return next();
    var host = req.headers.host.split(':')[0];
    if (!regexp.test(host)) return next();

    // sub-app
    if ('function' == typeof server.handle) {
      server.handle(req, res, next);
    }

    // vanilla http.Server
    else if (server instanceof http.Server) {
      if (req.upgrade) {
        if (server.listeners('upgrade').length) {
          var sock = res.socket;
          res.detachSocket(sock);
          server.emit('upgrade', req, sock, res.upgradeHead);
        } else {
          next();
        }
      } else {
        server.emit('request', req, res);
      }
    }

    // middleware
    else {
      if (!req.upgrade || server.supportsUpgrade) {
        server(req, res, next);
      } else {
        next();
      }
    }
  });
};
