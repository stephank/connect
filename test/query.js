
var connect = require('../')
  , utils = connect.utils;

var app = connect();

app.use(connect.query());

app.use(utils.withUpgrade(function(req, res){
  res.end(JSON.stringify(req.query));
}));

describe('connect.query()', function(){
  it('should parse the query-string', function(done){
    app.request()
    .get('/?user[name]=tobi')
    .end(function(res){
      res.body.should.equal('{"user":{"name":"tobi"}}');
      done();
    });
  })
  
  it('should default to {}', function(done){
    app.request()
    .get('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    });
  })

  it('should handle upgrade requests', function(done){
    app.request()
    .upgrade('Dummy')
    .get('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    });
  })
})
