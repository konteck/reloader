var child_process = require('child_process');
var fs = require('fs');

module.exports = function (config) {
    var _files_cache = [];
    var _child_args = [];
    var wait = false;
    var _child;
    var _config = config || {
        onStart: null,
        onRestart: null,
        watchModules: false
    };

    (function () {
        var colors = {
            'bold': ['\033[1m', '\033[22m'],
            'italic': ['\033[3m', '\033[23m'],
            'underline': ['\033[4m', '\033[24m'],
            'inverse': ['\033[7m', '\033[27m'],

            'white': ['\033[37m', '\033[39m'],
            'grey': ['\033[90m', '\033[39m'],
            'black': ['\033[30m', '\033[39m'],

            'blue': ['\033[34m', '\033[39m'],
            'cyan': ['\033[36m', '\033[39m'],
            'green': ['\033[32m', '\033[39m'],
            'magenta': ['\033[35m', '\033[39m'],
            'red': ['\033[31m', '\033[39m'],
            'yellow': ['\033[33m', '\033[39m']
        };

        for (var val in colors) {
            (function (c) {
                String.prototype.__defineGetter__(c, function () {
                    return colors[c][0] + this + colors[c][1];
                });
            })(val);
        }

        String.prototype.__defineGetter__('print', function () {
            console.log(this);
        })
    })();

    var _time = function () {
        var d = new Date();
        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var curr_sec = d.getSeconds();
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        curr_month++;
        var curr_year = d.getFullYear();

        return '[' + curr_hour + ":" + curr_min + ":" + +curr_sec + " " + curr_month + "/" + curr_date + "/" + curr_year + ']';
    }

    var _reload = function () {
        _child = child_process.spawn(process.execPath, _child_args);

        _child.stdout.addListener('data', function (data)
        {
            process.stdout.write(data);
        });


        _child.stderr.addListener('data', function (data)
        {
            process.stderr.write(data);
        });

        _child.addListener('exit', function (code)
        {
            if (code == 0) {
                console.log('[RELOADER]'.cyan + _time().bold + ' - Worker completed it\'s job. Exiting...');
                process.exit(code);
            } else if (!wait) {
                wait = true;
                _reload();
                wait = false;
            }
        });
    }

    var _watch = function () {
        for (var file in require.cache) {
            if (_files_cache.indexOf(file) == -1) {
                if (!_config.watchModules && file.indexOf('node_modules') > -1) {
                    continue;
                }

                _files_cache.push(file);

                fs.watch(file, { persistent: true, interval: 500 }, function (event, filename) {
                    if (!wait) {
                        wait = true;

                        if (typeof filename != 'undefined') {
                            console.log('[RELOADER]'.cyan + _time().bold + ' - ' + filename.bold);
                        } else {
                            console.log('[RELOADER]'.cyan + _time().bold + ' - ...');
                        }

                        setTimeout(function () {
                            wait = false;
                            _child.kill();
                        }, 700);
                    }
                });
            }
        }

        setTimeout(_watch, 2000);
    }

    if (process.argv.indexOf('--child') == -1) {
        var _child_args = process.argv.splice(1);
        _child_args.push('--child');

        _reload();

        _watch();

        process.on('uncaughtException', function () {
            if (typeof _child != 'undefined') {
                _child.stdin.end();
                _child.kill();
            }
        });
        process.on('exit', function () {
            if (typeof _child != 'undefined') {
                _child.stdin.end();
                _child.kill();
            }
        });

        if (typeof _config.onStart == 'function') {
            _config.onStart();
        }
    }
    else {
        if (typeof _config.onReload == 'function') {
            _config.onReload();
        }
    }
}