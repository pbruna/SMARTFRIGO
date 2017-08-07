import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'titulo',
    templateUrl: 'titulo.component.html'
})
export class TituloComponent {
    @Input() titulo: string;
    @Output() volver: EventEmitter<any> = new EventEmitter<any>()
    @Input('showvolver') showVolver: boolean
}
