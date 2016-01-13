'use strict';

describe('Test middleware', function () {

  const request = require('supertest');
  const koa = require('koa');
  const path = require('path');

  const Engine = require('efficient').Engine;

  const middleware = require('..');


  it('should render', function (done) {
    const app = koa();

    app.use(middleware({
      layout: 'layout',
      layoutOptions: {
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
      },
      viewOptions: {
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
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
    const app = koa();

    app.use(middleware({
      layout: 'layout',
      layoutOptions: {
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
      },
      viewOptions: {
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
      },
      data: {
        'title': 'Test Template',
        'header': 'Page'
      },
      contextMap: {
        'user': 'req.foo.user.login',
        'str.hello': 'req.foo.a.b.c.d.e.f',
        'INVALID.value': 'unknown.key'
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


  it('should send headers', function (done) {
    const app = koa();
    let headerValue;

    app.use(middleware({
      httpHeaders: {
        get foo() { 
          return headerValue = Math.random() + '-' + Date.now();
        }
      },
      layoutEngine: Engine({
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
      }),
      viewEngine: Engine({
        paths: {
          '*': path.join(__dirname, 'fixtures')
        }
      }),
      debug: true
    }));

    app.use(function * () {
      yield this.render('template');
    });

    request(app.listen())
      .get('/')
      .expect(200)
      .end(function(err, result){
        if (err) return done(err);

        result.header.foo.should.equal(headerValue);

        done();
      });

    this.timeout(500);

  })

});
