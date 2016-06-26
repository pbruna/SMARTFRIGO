import { Component, Input} from '@angular/core';

@Component({
    selector: 'titulo',
    templateUrl: './app/componentes/titulo.component.html',
})
export class TituloComponent {
    @Input() titulo: string;

    goBack() {
        window.history.back();
    }

    showBackButton(): boolean { return window.history.length > 1; }

}
