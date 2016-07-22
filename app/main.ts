import { bootstrap }    from '@angular/platform-browser-dynamic';
import { Provider }    from '@angular/core';
import {HTTP_PROVIDERS, Http, XHRBackend, RequestOptions} from '@angular/http';
import { AppComponent } from './app.component';
import { CustomHttp } from './HttpExtension';

bootstrap(AppComponent, [HTTP_PROVIDERS,
    new Provider(CustomHttp, {
        useFactory: (backend: XHRBackend, defaultOptions: RequestOptions) => new CustomHttp(backend, defaultOptions),
        deps: [XHRBackend, RequestOptions]
    })
]);

