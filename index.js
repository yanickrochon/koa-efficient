
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
  var viewEngine;
  var layoutEngine;

  return function * (next) {
    var req = this.request;
    var res = this.app.response;
    var ctx = this.app.context;

    options = options || {};

    if (!ctx.viewData) {
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
        },

        /**
         * Get the layout to use
         *
         * @return {name} layout
         * @api public
         */
        get layout() {
          return options.layout;
        },

        /**
         * Get the layout to use
         *
         * @return {name} layout
         * @api public
         */
        set layout(name) {
          options.layout = name;
          debug('set layout to %s', options.layout);
        }

      });
    }

    if (!viewEngine) {
      viewEngine = new Engine(options.viewOptions || {});
      layoutEngine = new Engine(options.layoutOptions || {});
    }

    res.render = function * (view, data, layout) {
      view = view || defaultView(req);

      layout = layout || options.layout || false;

      options.data && (data = combine(options.data || {}, data)) || {};

      if (layout) {
        debug('render view `%s` with %s', view, JSON.stringify(data));
        data.body = yield viewEngine.render(view, data);

        debug('render layout `%s` with %s', layout, JSON.stringify(data));
        this.body = yield layoutEngine.render(layout, data);
      } else {
        debug('render `%s` with %s', view, JSON.stringify(data));
        this.body = yield viewEngine.render(view, data);
      }
    };

    delegate(ctx, 'response').method('render');

    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = err.message || require('http').STATUS_CODES[this.status];
      this.app.emit('error', err, this);
    }
  };
}


function defaultView(req) {
  var view = req.url.substr(1); //.split('/').pop();
  var paramIndex = view.indexOf('?');
  if (paramIndex > -1) {
    view = view.substr(0, paramIndex - 1);
  }
  return view || 'index';
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
  var r = {};
  for (var k in a) { r[k] = a[k]; }
  for (var k in b) { r[k] = b[k]; }
  return r;
}
