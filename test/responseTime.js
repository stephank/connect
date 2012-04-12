
var connect = require('../')
  , utils = connect.utils;

var app = connect();

app.use(connect.responseTime());

app.use(utils.withUpgrade(function(req, res){
  setTimeout(function(){
    res.end();
  }, 30);
}));

describe('connect.responseTime()', function(){
  it('should set X-Response-Time', function(done){
    app.request()
    .get('/')
    .end(function(res){
      var n = parseInt(res.headers['x-response-time']);
      n.should.be.above(20);
      done();
    });
  })

  it('should handle upgrade requests', function(done){
    app.request()
    .upgrade('Dummy')
    .get('/')
    .end(function(res){
      res.should.have.header('x-response-time');
      done();
    });
  })
})
