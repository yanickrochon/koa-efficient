# Koa Efficient

[`co-efficient`](https://github.com/yanickrochon/co-efficient) template engine middleware for Koa


## Features

* Asynchronous templates with `co-efficient`.
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
    config: {
      paths: './layouts'
    }
  },
  viewOptions: {
    config: {
      paths: './views'
    },
    helpers: {
      foo: function * (stream, ctx, chunk, params) {
        stream.write('FOO!');
      }
    }
  }
}))
```


## Options

* **data** *{Object}* : an object of global data passed to the template.
* **layout** *{String}* : set the layout's name. Set to false to disable the layout.
* **layoutOptions** *{Object}* : passed directly to `co-efficient` engine's layout
instance. See [co-efficent](https://github.com/yanickrochon/co-efficient#configuration)'s
configuration for more information.
* **layoutEngine** *{coefficient.Engine}* : the coefficient template engine to use
when rendering the layouts. When this is specified, **layoutOptions** are ignored.
* **viewOptions** *{Object}* : passed directly to `co-efficient` engine's view
instance. See [co-efficent](https://github.com/yanickrochon/co-efficient#configuration)'s
configuration for more information.
* **viewEngine** *{coefficient.Engine}* : the coefficient template engine to use
when rendering the views. When this is specified, **viewOptions** are ignored.
* **handleErrors** *{Boolean}* : optionally handle errors automatically and set
the status and response body. *(default `false`)*


## Usage

You can always enable compression by setting `this.compress = true`.
You can always disable compression by setting `this.compress = false`.
This bypasses the filter check.

```js
app.use(function (next) {
  yield this.render('view-template', {
    title: 'Hello world!'
  }, 'other-layout');
})
```

The above snippet, given the configuration above, will render `./views/view-template.coeft.html`,
using the layout `./layouts/other-layout.coeft.html`.

To disable the layout (render only the view), pass `false` as layout name.

```js
app.use(function (next) {
  yield this.render('view-template', {
    title: 'Hello world!'
  }, false);
})
```


## License

The MIT License (MIT)

Copyright (c) 2014 Mind2Soft <yanick.rochon@mind2soft.com>

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
