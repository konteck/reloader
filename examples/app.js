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