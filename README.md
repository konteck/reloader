# reloader

Reload your Node.js application if some source changed

How to use:

require('reloader').start(function () {
    app.listen(3000);
});