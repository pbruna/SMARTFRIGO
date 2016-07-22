"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var app_component_1 = require('./app.component');
var HttpExtension_1 = require('./HttpExtension');
platform_browser_dynamic_1.bootstrap(app_component_1.AppComponent, [http_1.HTTP_PROVIDERS,
    new core_1.Provider(HttpExtension_1.CustomHttp, {
        useFactory: function (backend, defaultOptions) { return new HttpExtension_1.CustomHttp(backend, defaultOptions); },
        deps: [http_1.XHRBackend, http_1.RequestOptions]
    })
]);
//# sourceMappingURL=main.js.map