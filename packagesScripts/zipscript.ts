import * as fs from 'fs'
import * as archiver from 'archiver'
import * as uglify from 'uglify-js2'



(function () {
    var zip = archiver('zip');

    var files = ['index.html', 'styles.css', 'manifest.json', 'bundle.js', /(fonts|images|scripts_npm|back|app).*/,]
    var exclude = /(back\\context-pruebas.js|back\\DoScan.js|back\\background.js|back\\factura-electronica.js|map|ts|app\\.*js)$/
    var root = process.cwd();
    var addCount = 0;
    var totalCount = 0;

    var addPath = function (path: string) {
        if (path !== root) {
            if (!files.some(val => {
                if (typeof val !== 'string')
                    return val.test(path)
                return false;
            })) return;
        }
        fs.readdir(path, function (err, fls) {
            fls.forEach(name => {
                let fullPath = path + "\\" + name;
                fs.stat(fullPath, function (err, stats) {
                    if (err) return sendErr(err);
                    if (stats.isDirectory()) addPath(fullPath)
                    else if (stats.isFile() && files.some(e => {
                        if (typeof e === 'string') return fullPath.toUpperCase() === (root + '\\' + e).toUpperCase();
                        else return e.test(fullPath) && !exclude.test(fullPath);
                    })) {
                        addCount++;
                        if (/back.*\.js$/.test(fullPath))
                            zip.append(uglify.minify(fullPath).code, { name: fullPath.substr(root.length) })
                        else
                            zip.append(fs.createReadStream(fullPath), { name: fullPath.substr(root.length) })
                    }
                })
            })
        })

    }

    var output = fs.createWriteStream('SMARTFRIGO.zip');
    output.on('close', function () {
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    zip.on('entry', function () {
        if (++totalCount == addCount) zip.finalize();
    })

    var sendErr = function (err) {
        console.log(err.stack);
        process.exit(1)

    }

    zip.pipe(output);
    addPath(root)

})()