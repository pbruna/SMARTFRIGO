"use strict";
var archiver = require("archiver");
var fs = require('fs');
var zip = archiver('zip');
var files = ['index.html', 'styles.css', 'manifest.json', /(images|scripts|back|app).*/];
var exclude = /(map|ts)$/;
var root = process.cwd();
var addCount = 0;
var totalCount = 0;
var addPath = function (path) {
    if (path !== root) {
        if (!files.some(function (val) {
            if (typeof val !== 'string')
                return val.test(path);
            return false;
        }))
            return;
    }
    fs.readdir(path, function (err, fls) {
        fls.forEach(function (name) {
            fs.stat(path + "\\" + name, function (err, stats) {
                if (err) {
                    console.log(err.stack);
                    process.exit(1);
                }
                if (stats.isDirectory())
                    addPath(path + '\\' + name);
                else if (stats.isFile() && files.some(function (e) {
                    if (typeof e === 'string')
                        return (path + '\\' + name).toUpperCase() === (root + '\\' + e).toUpperCase();
                    else
                        return e.test(path + '\\' + name) && !exclude.test(name);
                })) {
                    addCount++;
                    zip.append(path + '\\' + name, { name: path.substr(root.length) + '\\' + name });
                }
            });
        });
    });
};
var output = fs.createWriteStream('SMARTFRIGO.zip');
output.on('close', function () {
    console.log('archiver has been finalized and the output file descriptor has closed.');
});
zip.on('entry', function () {
    if (++totalCount == addCount)
        zip.finalize();
    console.log(addCount + ' ' + totalCount);
});
zip.pipe(output);
addPath(root);
//# sourceMappingURL=zipscript.js.map