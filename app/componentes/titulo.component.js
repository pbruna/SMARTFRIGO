"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var TituloComponent = (function () {
    function TituloComponent() {
        this.volver = new core_1.EventEmitter();
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], TituloComponent.prototype, "titulo", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TituloComponent.prototype, "volver", void 0);
    __decorate([
        core_1.Input('showvolver'), 
        __metadata('design:type', Boolean)
    ], TituloComponent.prototype, "showVolver", void 0);
    TituloComponent = __decorate([
        core_1.Component({
            selector: 'titulo',
            templateUrl: './app/componentes/titulo.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], TituloComponent);
    return TituloComponent;
}());
exports.TituloComponent = TituloComponent;
//# sourceMappingURL=titulo.component.js.map