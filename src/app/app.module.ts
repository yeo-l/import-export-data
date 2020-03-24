import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxDhis2MenuModule } from "@hisptz/ngx-dhis2-menu";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import { ImportComponent } from './import/import.component';
import { ExportComponent } from './export/export.component';
import { DataVisualizationComponent } from './data-visualization/data-visualization.component';
import {FormsModule} from "@angular/forms";
import {jqxDataTableModule} from "jqwidgets-ng/jqxdatatable";

@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    ExportComponent,
    DataVisualizationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxDhis2MenuModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // FileSaverModule,
    FormsModule,
    jqxDataTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
