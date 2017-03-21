import * as fs from 'fs'
import * as archiver from 'archiver'
import * as uglify from 'uglify-js2'
import * as copyfiles from 'copy-files'
import { Observable, Observer } from 'rxjs'
import * as xmldom from 'xmldom'
import * as XMLSerializer from 'xmlserializer'
import * as Builder from 'systemjs-builder'
import * as browserify from 'browserify'

var DOMParser = xmldom.DOMParser
var zip = archiver('zip');

var files = [/(fonts|app|back).*/]
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
        .do(x => {
            if (!x[0].isDirectory()) zip.append(/.*\.js$/.test(x[1])
                ? uglify.minify(x[1]).code
                : fs.createReadStream(x[1]),
                { name: x[1].substr(root.length) })
        })
        .flatMap(x => x[0].isDirectory() ? addPath(x[1]) : Observable.of(x[1]))
}

function addIndexHtml() {
    return Observable.create((obs: Observer<string>) => {
        fs.readFile(root + "\\index.html", (err, fd) => {
            if (err) {
                obs.error(err)
                obs.complete()
            }
            let doc = new DOMParser().parseFromString(fd.toString())
            let scs = doc.getElementsByTagName('script')
            for (let k = 0; k < scs.length; ++k) {
                let sc = scs.item(k)
                let att = sc.getAttribute('keep')
                if (att === 'false') {
                    sc.parentNode.removeChild(sc)
                    --k
                    continue
                }
                let src = sc.getAttribute('src')
                let path = src.split('/')
                let minify = sc.getAttribute('minify')
                let filename = path[path.length - 1].split('?')[0]
                if (src.indexOf('node_modules/') === 0) {
                    sc.removeAttribute('minify')
                    sc.setAttribute("src", "npm_scripts/" + path[path.length - 1])
                    obs.next("npm_scripts/" + filename)
                    path.pop()

                    zip.append(minify === 'true'
                        ? uglify.minify(root + '\\' + path.join('\\') + '\\' + filename).code
                        : fs.createReadStream(root + '\\' + path.join('\\') + '\\' + filename),
                        { name: "npm_scripts\\" + filename })
                } else if (sc.getAttribute('bundle')) {
                    let bundle = sc.getAttribute('bundle')
                    var b = browserify();
                    let stream = <fs.ReadStream>b.add(bundle).bundle()
                    let txt = ''
                    stream.on('data',  chunk => txt += chunk);
                    stream.on('end', () => {
                        obs.next(bundle)
                        zip.append(uglify.minify(txt, {fromString: true}).code, { name: bundle })
                        obs.complete()
                    });
                    stream.read()
                    sc.removeAttribute('bundle')
                    sc.setAttribute("src", bundle)

                }
            }

            let lks = doc.getElementsByTagName('link')
            for (let k = 0; k < lks.length; ++k) {
                let lk = lks.item(k)
                let att = lk.getAttribute('keep')
                if (att === 'false') {
                    lk.parentNode.removeChild(lk)
                    --k
                    continue
                }
                let src = lk.getAttribute('href')
                if (src.indexOf('node_modules/') === 0) {
                    let path = src.split('/')
                    let minify = lk.getAttribute('minify')
                    lk.removeAttribute('minify')
                    lk.setAttribute("href", "npm_scripts/" + path[path.length - 1])
                    obs.next("npm_scripts/" + path[path.length - 1])
                    let filename = path[path.length - 1].split('?')[0]
                    path.pop()

                    zip.append(minify === 'true'
                        ? uglify.minify(root + '\\' + path.join('\\') + '\\' + filename).code
                        : fs.createReadStream(root + '\\' + path.join('\\') + '\\' + filename),
                        { name: "npm_scripts\\" + filename })
                }

            }

            obs.next(root + "\\index.html")
            doc.documentElement.removeAttribute('xmlns')

            zip.append(XMLSerializer.serializeToString(doc), { name: "index.html" })

        })
    })

}

function addManifest() {

}

var output = fs.createWriteStream('SMARTFRIGO.zip');
output.on('close', function () {
    console.log('archiver has been finalized and the output file descriptor has closed.');
});


zip.pipe(output);
Observable.concat(addPath(root), addIndexHtml())
    .subscribe(
    x => console.log(x),
    err => console.log(err),
    () => zip.finalize()
    )

