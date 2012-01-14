var child_process = require('child_process');
var fs = require('fs');

module.exports = {
    start: function (callback) {
        var _files_cache = [];
        var _child_args = [];
        var _child;

        var _reload = function () {
            if (typeof _child != 'undefined') {
                _child.stdin.end();
                _child.kill();
            }

            _child = child_process.spawn(process.execPath, _child_args);

            _child.stdout.addListener('data', function (data)
            {
                process.stdout.write(data)
            });

            _child.stderr.addListener('data', function (data)
            {
                process.stderr.write(data)
            });

            _child.addListener('exit', function (code)
            {
                if (!isNaN(parseInt(code))) {
                    console.log('Child process exited with code: ' + code)
                    process.exit(code);
                }
            });
        }

        var _watch = function () {
            for (var file in require.cache) {
                if (_files_cache.indexOf(file) == -1) {
                    _files_cache.push(file);

                    fs.watch(file, { persistent: true, interval: 500 }, function (event, filename) {
                        if (event == 'change') {
                            if (typeof filename != 'undefined') {
                                console.log('Reloading. Changed file: ' + filename);
                            } else {
                                console.log('Reloading.');
                            }

                            _reload();
                        }
                    });
                }
            }
        }

        if (process.argv.indexOf('--child') == -1) {
            var _child_args = process.argv.splice(1);
            _child_args.push('--child');

            _reload();

            _watch();
            setTimeout(_watch, 1000);

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
        }
        else {
            if (typeof callback != 'undefined') {
                callback();
            }
        }
    }
}