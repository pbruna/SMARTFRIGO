import { Component, Input} from '@angular/core';
import { Documento } from '../objetos';

@Component({
    selector: 'documento',
    templateUrl: './app/componentes/documento.component.html'
})
export class DocumentoComponent {
    @Input() documento: Documento;
    
}
