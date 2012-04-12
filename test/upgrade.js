
var connect = require('../')
  , http = require('http');

describe('HTTP Upgrade requests', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  describe('with middleware', function(){
    it('should call the upgrade handler', function(done){
      var hello = function(req, res, next){
        req.url.should.equal('/');
        res.writeHead(101, { 'Connection': 'Upgrade', 'Upgrade': 'Dummy' });
        res.switchProtocols(function(sock) {
          sock.end('Hello world!');
        });
      };
      hello.supportsUpgrade = true;

      app.use('/hello', hello);

      app.request()
      .upgrade('Dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('with a connect app', function(){
    it('should call the upgrade handler', function(done){
      var hello = function(req, res, next){
        req.url.should.equal('/');
        res.writeHead(101, { 'Connection': 'Upgrade', 'Upgrade': 'Dummy' });
        res.switchProtocols(function(sock) {
          sock.end('Hello world!');
        });
      };
      hello.supportsUpgrade = true;

      var subapp = connect().use(hello);
      app.use('/hello', subapp);

      app.request()
      .upgrade('Dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('with a node app', function(){
    it('should call the upgrade listener', function(done){
      var server = http.createServer(function(req, res){ res.end(); });
      server.on('upgrade', function(req, sock, head){
        req.url.should.equal('/');
        sock.end('HTTP/1.1 101 Switching Protocols\r\n' +
                 'Connection: Upgrade\r\n' +
                 'Upgrade: Dummy\r\n' +
                 '\r\n' +
                 'Hello world!');
      });

      app.use('/hello', server);

      app.request()
      .upgrade('Dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('without an upgrade handler', function(){
    it('should close the socket', function(done){
      app.request()
      .upgrade('Dummy')
      .get('/hello')
      .end(function(err, body){
        err.message.should.equal('socket hang up');
        done();
      });
    });
  });

})
