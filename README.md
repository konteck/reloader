# reloader

Reload your Node.js application if it's source code changed.
Tested on Windows, Mac OSX, Linux.

### How to install:

```js
npm install reloader
```

### How to use:

To use it just include 'reloader' as usual NodeJS module
and put code that must be started after every restart in
'onReload' callback. eg.

```js
var reloader = require('reloader');
reloader({
    onReload: function () {
        app.listen(3000);
}});
```

In case if you go to use Reloader with Express framework:

```js
// Reloader setup demonstration
var app = require('express').createServer();

app.configure(function () {
    app.use(app.router);

    require('reloader')({
        watchModules: true,
        onStart: function () {
            console.log('Started on port: 3000');
        },
        onReload: function () {
            app.listen(3000);
        }});
});

app.get('/', function (req, res) {
    res.send('Work!');
});
```

### Parameters

```js
watchModules: false
onRestart: function() {}
onStart: function() {}
```