import { Component, Input, Output, EventEmitter} from '@angular/core';


@Component({
    selector: 'titulo',
    templateUrl: './app/componentes/titulo.component.html'
})
export class TituloComponent {
    @Input() titulo: string;
    @Output() volver: EventEmitter<any> = new EventEmitter<any>()
    @Input('showvolver') showVolver: boolean
}
