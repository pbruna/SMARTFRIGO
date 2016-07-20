(function copy() {
    var copy = require('copy-files');
    var copydir = require('copy-dir');
    var root = process.cwd();

    copy({
        files: {
            "Reflect.js": root + '/node_modules/reflect-metadata/Reflect.js',
            "shim.min.js": root + '/node_modules/core-js/client/shim.min.js',
            "system.src.js": root + '/node_modules/systemjs/dist/system.src.js',
            'zone.js': root + '/node_modules/zone.js/dist/zone.js',
            "bootstrap.min.js": root + '/node_modules/bootstrap/dist/js/bootstrap.min.js',
            "bootstrap.min.css": root + '/node_modules/bootstrap/dist/css/bootstrap.min.css',
            'jquery.min.js': root + '/node_modules/jquery/dist/jquery.min.js',
            'jquery-ui.js': root + '/node_modules/jquery-ui/jquery-ui.js',
            'jquery-ui.min.css': root + '/node_modules/jquery-ui/themes/base/minified/jquery-ui.min.css'
        },
        dest: root + '/scripts_npm/',
        overwrite: true
    }, function (err) {
        if (err) console.log(err);
        else console.log('Archivos copiados correctamente');
    });

    copydir(root + '/node_modules/bootstrap/fonts', root + '/fonts', function(err){
        if (err) console.log(err);
        else console.log('Directorios copiados correctamente');
    });

})();