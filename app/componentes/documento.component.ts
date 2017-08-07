import { Component, Input } from '@angular/core';
import { Documento } from '../objetos';

@Component({
    selector: 'documento',
    templateUrl: 'documento.component.html'
})
export class DocumentoComponent {
    @Input() documento: Documento;

}
