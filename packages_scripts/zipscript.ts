import * as fs from 'fs'
import { Observable, Observer } from 'rxjs'
import * as xmldom from 'xmldom'
import * as XMLSerializer from 'xmlserializer'
import * as uglify from 'uglify-js'
import * as browserify from 'browserify'
import * as copydir from 'copy-dir'
import * as xpath from 'xpath'



import * as content from '../enter_scripts/systemjs.import.content'
import * as background from '../enter_scripts/systemjs.import.background'

const distPath = '/publish/SMARTFRIGO/'
var DOMParser = xmldom.DOMParser

var root = process.cwd();

function addIndexHtml(): Observable<string> {
    return Observable.create((obs: Observer<string>) => {
        fs.readFile(root + "\\index.html", (err, fd) => {
            if (err) obs.error(err)
            let doc = new DOMParser().parseFromString(fd.toString(), "text/xml")

            let nodes = <(HTMLScriptElement | HTMLLinkElement)[]>xpath.select("//script | //link", doc)

            nodes.forEach(el => {
                if (el.hasAttribute('no-keep')) return el.parentNode.removeChild(el)
                if (el.hasAttribute('data-href')) {
                    el.setAttribute('href', el.getAttribute('data-href'))
                    el.removeAttribute('data-href')
                }
                if (el.hasAttribute('data-src')) {
                    el.setAttribute('src', el.getAttribute('data-src'))
                    el.removeAttribute('data-src')
                }

                let href = el.getAttribute('href')
                let src = el.getAttribute('src')
                let minify = el.hasAttribute('minify')
                let copyFile = !el.hasAttribute('no-copy-file')
                el.removeAttribute('no-copy-file')
                el.removeAttribute('minify')

                let pathArr = (href || src).split('/')
                let filename = pathArr.pop()
                let path = root + '\\' + pathArr.join('\\') + '\\'

                if (href) el.setAttribute('href', filename)
                if (src) el.setAttribute('src', filename)

                if (el.tagName === 'script') el.textContent = ' '
                filename = filename.split('?')[0]
                if (minify)
                    fs.writeFile(root + distPath + filename, uglify.minify(path + filename).code)
                else if (copyFile)
                    fs.createReadStream(path + filename).pipe(fs.createWriteStream(root + distPath + filename));

                if (copyFile) obs.next(distPath + filename)
            })



            fs.writeFile(root + distPath + 'index.html',
                XMLSerializer.serializeToString(doc)
                    .replace(/\n\t/g, '')
                    .replace('xmlns="undefined"', '')
                    .replace(/> </g, '><'))
            obs.next(root + "\\index.html")
            obs.complete()

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
        .finally(() => fs.writeFile(root + distPath + 'manifest.json', JSON.stringify(manifest, null, 2)))


}

function zipAndGetScripts(scs: string[], url: string): Observable<string[]> {
    if (!scs) return Observable.of([])
    let bundle = (url ? content.getBundle(url) : background.getBundle()).split('/').join(String.fromCharCode(92))
    return Observable.from(scs)
        .filter(sc => sc != 'node_modules/systemjs/dist/system.src.js' && sc != 'config.js')
        .flatMap(sc => {
            if (sc.indexOf('enter_scripts/systemjs.import') === 0) {
                let bify = browserify();
                bify.add(bundle)
                StreamToStringObservable(bify.bundle())
                    .map(code => uglify.minify(code, { fromString: true }).code)
                    .do(minCode => fs.writeFile(root + distPath + `npm_scripts/${bundle.split(String.fromCharCode(92)).slice(-1)[0]}`, minCode))
                    .subscribe({
                        next: nxt => console.log('OK min', bundle),
                        error: err => console.error('Bundle error', bundle, err)
                    })

                sc = bundle.split(String.fromCharCode(92)).slice(-1)[0]
            } else {
                if (sc.indexOf('.min.js') === 0 || !/.js$/g.test(sc))
                    fs.createReadStream(root + '\\' + sc.split('/').join('\\'))
                        .pipe(fs.createWriteStream(root + distPath + 'npm_scripts\\' + sc.split('/').slice(-1)[0]));
                else
                    fs.writeFile(root + distPath + 'npm_scripts\\' + sc.split('/').slice(-1)[0],
                        uglify.minify(root + '\\' + sc.split('/').join('\\')).code)

            }
            return Observable.of(
                {
                    path: true,
                    text: root + '\\' + sc.split('/').join('\\'),
                    filename: `npm_scripts/${sc.split('/').slice(-1)[0]}`
                })
        })
        .map(x => x.filename)
        .reduce((acc, x) => acc.concat([x]), [])


}

function StreamToStringObservable(rs: NodeJS.ReadableStream): Observable<string> {
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

Observable.bindCallback(fs.mkdir)(root + distPath + '\\npm_scripts')
    .concat(addManifest(), addIndexHtml())
    .subscribe({
        next: x => console.log(x),
        error: err => console.log(err),
        complete: () => {
            if (!fs.existsSync(root + distPath + '\\images')) fs.mkdirSync(root + distPath + '\\images')
            if (!fs.existsSync(root + distPath + '\\fonts')) fs.mkdirSync(root + distPath + '\\fonts')
            copydir.sync(root + '\\images', root + distPath + '\\images')
            copydir.sync(root + '\\fonts', root + distPath + '\\fonts')
        }
    })

