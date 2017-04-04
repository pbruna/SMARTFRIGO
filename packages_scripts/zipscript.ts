import * as fs from 'fs'
import * as archiver from 'archiver'
import { Observable, Observer } from 'rxjs'
import * as xmldom from 'xmldom'
import * as XMLSerializer from 'xmlserializer'
import * as uglify from 'uglify-js'
import * as browserify from 'browserify'


import * as content from '../enter_scripts/systemjs.import.content'
import * as background from '../enter_scripts/systemjs.import.background'

var DOMParser = xmldom.DOMParser
var zip = archiver('zip');

var files = [/(fonts|app|back).*/]
var exclude = /.*\.(js\.map|ts|js)$/
var root = process.cwd();
var addCount = 0;
var totalCount = 0;
var ingresados: { [file: string]: boolean } = {}

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

function addIndexHtml(): Observable<string> {
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
                sc.textContent = ' '
                let src = sc.getAttribute('src')
                let path = src.split('/')
                let minify = sc.getAttribute('minify')
                let filename = path[path.length - 1].split('?')[0]
                if (src.indexOf('node_modules/') === 0) {
                    sc.removeAttribute('minify')
                    sc.setAttribute("src", "npm_scripts/" + path[path.length - 1])
                    obs.next("npm_scripts/" + filename)
                    path.pop()
                    if (!ingresados["npm_scripts/" + filename]) {
                        ingresados["npm_scripts/" + filename] = true
                        zip.append(minify === 'true'
                            ? uglify.minify(root + '\\' + path.join('\\') + '\\' + filename).code
                            : fs.createReadStream(root + '\\' + path.join('\\') + '\\' + filename),
                            { name: "npm_scripts/" + filename })
                    }
                } else if (sc.getAttribute('bundle')) {
                    let bundle = sc.getAttribute('bundle')
                    let bify = browserify()
                    bify.add(bundle)
                    let rs = <fs.ReadStream>bify.bundle()
                    let txt = '';
                    rs.on('data', chunk => txt += chunk);
                    rs.on('end', () => {
                        //zip.append(txt, { name: bundle })
                        zip.append(uglify.minify(txt, 
                        { fromString: true, mangle: true, compress: true }).code, { name: bundle })

                        obs.next(bundle)
                        obs.complete()
                    });
                    rs.on('error', err => {
                        obs.error(err)
                    })
                    rs.read()

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
                    if (!ingresados["npm_scripts/" + filename]) {
                        ingresados["npm_scripts/" + filename] = true
                        zip.append(minify === 'true'
                            ? uglify.minify(root + '\\' + path.join('\\') + '\\' + filename).code
                            : fs.createReadStream(root + '\\' + path.join('\\') + '\\' + filename),
                            { name: "npm_scripts\\" + filename })
                    }

                }

            }

            obs.next(root + "\\index.html")
            doc.documentElement.removeAttribute('xmlns')

            zip.append(XMLSerializer.serializeToString(doc), { name: "index.html" })

        })
    })

}

function addManifest(): Observable<string> {
    let manifest: any
    return Observable.bindNodeCallback<string, Buffer>(fs.readFile)(root + '\\manifest.json')
        .map(fd => JSON.parse(fd.toString()))
        .do(man => manifest = man)
        .flatMap(man => Observable.concat(
            Observable.from(<{ matches: string[], js?: string[], css?: string[] }[]>manifest.content_scripts)
                .flatMap(ob => Observable.concat(
                    zipAndGetScripts(ob.js, ob.matches[0]) //modificamos el contenido de los scripts
                        .do(x => ob.js = x),
                    zipAndGetScripts(ob.css, ob.matches[0]) //modificamos el contenido de los styles
                        .do(x => ob.css = x)
                )),
            zipAndGetScripts(manifest.background.scripts, null) //modificamos scripts del background
                .do(x => manifest.background.scripts = x),

            Observable.of(["npm_scripts"]) //Modificamos los recursos accesibles
                .do(x => manifest.web_accessible_resources = x)
        ))
        .flatMap(scs => scs)
        .finally(() => zip.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" }))


}

function zipAndGetScripts(scs: string[], url): Observable<string[]> {
    if (!scs) return Observable.of([])
    let bundle = (url ? content.getBundle(url) : background.getBundle()).split('/').join(String.fromCharCode(92))
    return Observable.from(scs)
        .filter(sc => sc != 'node_modules/systemjs/dist/system.src.js' && sc != 'config.js')
        .flatMap(sc => {
            if (sc.indexOf('enter_scripts/systemjs.import') === 0) {
                let bify = browserify();
                bify.add(bundle)
                return StreamToStringObservable(bify.bundle())
                    .map(x => {
                        return {
                            path: false,
                            text: x,
                            filename: `npm_scripts/${bundle.split(String.fromCharCode(92)).slice(-1)[0]}`
                        }
                    })

            }
            return Observable.of(
                {
                    path: true,
                    text: root + '\\' + sc.split('/').join('\\'),
                    filename: `npm_scripts/${sc.split('/').slice(-1)[0]}`
                })
        })
        .do(x => { // lo ingresamos si no está repetido
            if (ingresados[x.filename]) return
            if (x.path)
                if (x.text.indexOf('.min.') === -1)
                    zip.append(uglify.minify(x.text).code, { name: x.filename })
                else
                    zip.append(fs.createReadStream(x.text), { name: x.filename })
            else
                zip.append(uglify.minify(x.text, { fromString: true }).code, { name: x.filename })
            ingresados[x.filename] = true
        })
        .map(x => x.filename)
        .reduce((acc, x) => acc.concat([x]), [])


}

function StreamToStringObservable(rs: fs.ReadStream): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
        let txt = '';
        rs.on('data', chunk => txt += chunk);
        rs.on('end', () => {
            obs.next(txt)
            obs.complete()
        });
        rs.on('error', err => {
            obs.error(err)
        })
        rs.read()
    })
}


var output = fs.createWriteStream('publish/SMARTFRIGO.zip');
output.on('close', function () {
    console.log('Archivo zip creado satisfactoriamente');
});


zip.pipe(output);
Observable.concat(addPath(root), addManifest(), addIndexHtml())
    .subscribe(
    x => console.log(x),
    err => console.log(err),
    () => zip.finalize()
    )

