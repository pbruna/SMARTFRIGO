import * as copyfiles from 'copy-files'
import * as copydir from 'copy-dir'

(function copy() {
    var root = process.cwd();

    copyfiles({
        files: {
            "Reflect.js": root + '/node_modules/reflect-metadata/Reflect.js',
            "shim.min.js": root + '/node_modules/core-js/client/shim.min.js',
            "system.js": root + '/node_modules/systemjs/dist/system.js',
            'zone.js': root + '/node_modules/zone.js/dist/zone.min.js',
            "bootstrap.min.js": root + '/node_modules/bootstrap/dist/js/bootstrap.min.js',
            "bootstrap.min.css": root + '/node_modules/bootstrap/dist/css/bootstrap.min.css',
            'jquery.min.js': root + '/node_modules/jquery/dist/jquery.min.js',
            'jquery-ui.min.css': root + '/node_modules/jquery-ui/themes/base/minified/jquery-ui.min.css',
            'pdf.combined.js': root + '/node_modules/pdfjs-dist/build/pdf.combined.js',
            'BigInteger.min.js': root + '/node_modules/big-integer/BigInteger.min.js'
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