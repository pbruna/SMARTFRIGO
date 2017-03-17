import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { AppComponent }  from './app.component';
import { HttpModule } from '@angular/http';
import { CustomHttp } from './HttpExtension';


import { BuscarOrdenesComponent } from './componentes/buscar-ordenes.component';
import { OrdenComponent } from './componentes/orden.component';
import { OrdenService } from './servicios/orden.service';
import { DocumentoComponent } from './componentes/documento.component';
import { TituloComponent } from './componentes/titulo.component'

@NgModule({
  imports: [BrowserModule, FormsModule, HttpModule],
  declarations: [AppComponent, BuscarOrdenesComponent, OrdenComponent, DocumentoComponent, TituloComponent],
  bootstrap: [AppComponent],
  providers: [ OrdenService, CustomHttp]
})
export class AppModule { }

