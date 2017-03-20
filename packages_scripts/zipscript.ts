import * as fs from 'fs'
import * as archiver from 'archiver'
import * as uglify from 'uglify-js2'
import * as copyfiles from 'copy-files'
import { Observable } from 'rxjs'


var zip = archiver('zip');

var files = ['index.html', 'manifest.json', 'back\\zxing-pdf417.js', /(fonts|app|back).*/,]
var exclude = /.*\.(js\.map|ts|js)$/
var root = process.cwd();
var addCount = 0;
var totalCount = 0;

function addPath(path: string): Observable<string> {

    return Observable.bindNodeCallback<string[]>(fs.readdir)(path)
        .flatMap(fls => fls)
        .map(name => path + "\\" + name)
        .filter(fullpath => files.some(e => {
            if (typeof e === 'string')
                return fullpath.toUpperCase() === (root + '\\' + e).toUpperCase();
            else
                return e.test(fullpath) && !exclude.test(fullpath)

        }))
        .flatMap(fullpath => Observable.forkJoin(Observable.bindNodeCallback(fs.stat)(fullpath), Observable.of(fullpath)))
        .flatMap(x => x[0].isDirectory() ? addPath(x[1]) : Observable.of(x[1]))




}

var output = fs.createWriteStream('SMARTFRIGO.zip');
output.on('close', function () {
    console.log('archiver has been finalized and the output file descriptor has closed.');
});


var sendErr = function (err) {
    console.log(err.stack);
    process.exit(1)

}

zip.pipe(output);
addPath(root).subscribe(
    x => {
        console.log(x)
        zip.append(/.*\.js$/.test(x) ? uglify.minify(x).code : fs.createReadStream(x),
            { name: x.substr(root.length) })
    },
    err => console.log(err),
    () => zip.finalize()
)

