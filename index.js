
/**
 * Module dependencies.
 */
var Engine = require('co-efficient').Engine;
var delegate = require('delegates');
var merge = require('merge-descriptors');
var debug = require('debug')('koa-efficient');

/**
 * Exports `coefficient`.
 */
module.exports = coefficient;

/**
 * Add `render` method and define `locals` getter and
 * setters.
 *
 *   Options :
 *    - viewEngine {Engine}     the Co-Efficient engine to render views
 *    - layoutEngine {Engine}   the Co-Efficient engine to render layouts
 *    - data {Object}           (Optional) a global data object which will be merged with the rendering data
 *    - debug {Boolean}         print debug traces
 *
 * @param {Object} options    the module options.
 * @api public
 */
function coefficient(options) {
  options = options || {};

  var viewEngine = options.viewEngine;
  var layoutEngine = options.layoutEngine;
  var showDebug = options.debug;

  return function * (next) {
    var req = this.request;
    var res = this.app.response;
    var ctx = this.app.context;

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
    }
    if (!layoutEngine) {
      layoutEngine = new Engine(options.layoutOptions || {});
    }

    res.render = function * (view, data, layout) {
      view = view || defaultView(req);

      if (layout !== false) {
        layout = layout || options.layout || false;
      }

      data = options.data && combine(options.data, data || {}) || {};
      data.req = this.req; // make visible the current request in the view

      if (layout) {
        showDebug && debug('render view `%s` with %s', view, JSON.stringify(data, stringifyReplacer(), 2));
        data.body = yield viewEngine.render(view, data);

        showDebug && debug('render layout `%s` with %s', layout, JSON.stringify(data, stringifyReplacer(), 2));
        this.body = yield layoutEngine.render(layout, data);
      } else {
        showDebug && debug('render `%s` with %s', view, JSON.stringify(data, stringifyReplacer(), 2));
        this.body = yield viewEngine.render(view, data);
      }
    };

    delegate(ctx, 'response').method('render');

    if (options.handleErrors) {
      try {
        yield next;
      } catch (err) {
        this.status = err.status || 500;
        this.body = err.message || require('http').STATUS_CODES[this.status];
        this.app.emit('error', err, this);
      }
    } else {
      yield next;
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

function stringifyReplacer() {
  var cache = [];
  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return '[Circular]';
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  };
}
