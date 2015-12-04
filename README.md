# Koa Efficient

[![Build Status](https://travis-ci.org/yanickrochon/koa-efficient.svg)](https://travis-ci.org/yanickrochon/koa-efficient)
[![Coverage Status](https://coveralls.io/repos/yanickrochon/koa-efficient/badge.svg?branch=master&service=github)](https://coveralls.io/github/yanickrochon/koa-efficient?branch=master)


[`Efficient`](https://github.com/yanickrochon/efficient) template engine middleware for Koa


# BREAKING CHANGE

This package now use a new template engine slightly incompatible with the previous one, but faster, more flexible and easy to use. This notice will remain up until February 2016. Open issues if you have any trouble upgrading.

Here are notable changes :
* Template syntax (i.e. context paths, segment types, no more helpers, etc.)
* Engine configuration options
* Context mapping keys and values have swapped now.


## Features

* Asynchronous templates with `efficient`.
* Dual engines configuration (layouts + views)
* Preset global data
* Optional basic error handling in response


## Install

`npm install koa-efficient --save`


## Example

```js
var efficient = require('koa-efficient');
var koa = require('koa');

var app = koa();
app.use(efficient({
  layout: 'main',
  layoutOptions: {
    paths: {
      '*': './layouts'
    }
  },
  viewOptions: {
    paths: {
      '*': './layouts'
    }
  },

  // expose passport's user to the views and layouts as 'identity'
  contextMap: {
    'passport.user': 'identity'
  }
}))
```


## Options

* **data** *{Object}* : an object of global data passed to the template.
* **layout** *{String}* : set the layout's name. Set to false to disable the layout.
* **layoutOptions** *{Object}* : passed directly to `efficient` engine's layout instance. See [efficent](https://github.com/yanickrochon/efficient#configuration)'s configuration for more information.
* **layoutEngine** *{coefficient.Engine}* : the coefficient template engine to use when rendering the layouts. When this is specified, **layoutOptions** are ignored.
* **viewOptions** *{Object}* : passed directly to `efficient` engine's view instance. See [efficent](https://github.com/yanickrochon/efficient#configuration)'s configuration for more information.
* **viewEngine** *{coefficient.Engine}* : the coefficient template engine to use when rendering the views. When this is specified, **viewOptions** are ignored.
* **handleErrors** *{Boolean}* : optionally handle errors automatically and set the status and response body. *(default `false`)*
* **httpHeaders** *{Object}* : define any HTTP headers to set *after* successful rendering. The object may specify getters for dynamic headers.
* **contextMap** *{Object}* : if any request's context data needs to be exposed to the view, this will map the context (`this`) object's value to the data, overwritting any previous value.


## Usage

```js
app.use(function (next) {
  yield this.render('view-template', {
    title: 'Hello world!'
  }, 'other-layout');
})
```

The above snippet, given the configuration above, will render `./views/view-template.coeft.html`, using the layout `./layouts/other-layout.coeft.html`.

To disable the layout (render only the view), pass `false` as layout name.

```js
app.use(function (next) {
  yield this.render('view-template', {
    title: 'Hello world!'
  }, false);
})
```


## ContextMap

When rendering a template and/or layout, instead of manually processing the current request's `this` context, mapping a `data` object to send to the rendering engines, `koa-efficient` can perform a automated transformation instead.

For example, you may transform

```javascript
var efficient = require('koa-efficient');

app.use(efficient({
  ...
}));

app.use(function * () {
  var data = {
    username: this.passport.identifier,
    cartItems: this.session.cartItems
  };

  this.render('foo', data);
});
```

into

```javascript
var efficient = require('koa-efficient');

app.use(efficient({
  ...
  contextMap: {
    'username': 'passport.identifier',
    'cartItems': 'session.cartItems'
  }
}));

app.use(function * () {
  this.render('foo');
});
```


## License

The MIT License (MIT)

Copyright (c) 2015 Mind2Soft <yanick.rochon@mind2soft.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
