
/**
 * Module dependencies.
 */
var Engine = require('co-efficient').Engine;
var delegate = require('delegates');
var merge = require('merge-descriptors');
var debug = require('debug');

/**
 * Exports `coefficient`.
 */
module.exports = coefficient;

/**
 * Add `render` method and define `locals` getter and
 * setters.
 *
 * @param {String} path (optional)
 * @param {String} ext
 * @param {Object} map (optional)
 * @api public
 */
function coefficient(options) {

  return function * (next) {
    var res = this.app.response;
    var ctx = this.app.context;
    var engine;

    if (res.render && ctx.viewData) {
      return;
    }

    options = options || {};

    merge(ctx, {
      /**
       * Get locals.
       *
       * @return {Object} locals
       * @api public
       */
      get viewData() {
        return options.data || {};
      },

      /**
       * Extend req locals with new locals.
       *
       * @param {Object} locals
       * @api public
       */
      set viewData(data) {
        options.data = combine(options.data || {}, data);
        debug('set view data to %s', JSON.stringify(options.data));
      }
    });

    engine = new Engine(options);

    res.render = function * (templateName, data) {
      // TODO : get default templateName

      options.data && (data = combine(options.data, data));

      debug('render `%s` with %s', templateName, JSON.stringify(data));
      this.body = yield engine.render(templateName, data);
    };

    delegate(ctx, 'response').method('render');

    yield next;
  };
}


/**
 * combine obj `a` with `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */
function combine (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}
