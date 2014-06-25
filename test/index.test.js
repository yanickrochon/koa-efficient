
var request = require('supertest');
var koa = require('koa');
var path = require('path');

var middleware = require('..');

describe('Test middleware', function () {

  it('should render', function (done) {
    var app = koa();

    app.use(middleware({
      layout: 'layout',
      layoutOptions: {
        config: {
          paths: path.join(__dirname, 'fixtures')
        },
      },
      viewOptions: {
        config: {
          paths: path.join(__dirname, 'fixtures')
        },
      },
      data: {
        'title': 'Test Template',
        'header': 'Page'
      },
      debug: true
    }));

    app.use(function * () {
      yield this.render('template', {
        'header': 'Hello world',
        'tags': [ 'Poor', 'Average', 'Good' ]
      });
    });

    request(app.listen())
      .get('/')
      .expect(200)
      .end(function(err, result){
        if (err) return done(err);

        result.res.text.indexOf('Test Template').should.be.greaterThan(-1);
        result.res.text.indexOf('Page').should.be.equal(-1);
        result.res.text.indexOf('Hello world').should.be.greaterThan(-1);
        result.res.text.indexOf('Poor').should.be.greaterThan(-1);
        result.res.text.indexOf('Average').should.be.greaterThan(-1);
        result.res.text.indexOf('Good').should.be.greaterThan(-1);

        done();
      });

    this.timeout(500);

  });


  it('should map context data correctly', function (done) {
    var app = koa();

    app.use(middleware({
      layout: 'layout',
      layoutOptions: {
        config: {
          paths: path.join(__dirname, 'fixtures')
        },
      },
      viewOptions: {
        config: {
          paths: path.join(__dirname, 'fixtures')
        },
      },
      data: {
        'title': 'Test Template',
        'header': 'Page'
      },
      contextMap: {
        'req.foo.user.login': 'user',
        'req.foo.a.b.c.d.e.f': 'str.hello',
        'unknown.key': 'INVALID.value'
      },
      debug: true
    }));

    app.use(function * (next) {

      this.req.foo = {
        user: {
          login: 'foo.bar@domain.com'
        },
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: 'Hello'
                }
              }
            }
          }
        }
      };

      yield next;
    });

    app.use(function * () {
      yield this.render('context');
    });

    request(app.listen())
      .get('/')
      .expect(200)
      .end(function(err, result){
        if (err) return done(err);

        result.res.text.indexOf('Hello').should.be.greaterThan(-1);
        result.res.text.indexOf('foo.bar@domain.com').should.be.greaterThan(-1);

        done();
      });

    this.timeout(500);

  });

});
