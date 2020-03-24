import { BrowserModule } from '@angular/platform-browser';
import {NgModule, Injectable} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxDhis2MenuModule } from "@hisptz/ngx-dhis2-menu";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from "@angular/common/http";
import {SpreadSheetsModule} from "../component/gc.spread.sheets.angular";
import { ImportComponent } from './import/import.component';
import { ExportComponent } from './export/export.component';
import { DataVisualizationComponent } from './data-visualization/data-visualization.component';
import {Location} from '@angular/common'

@Injectable()
export class UnstripTrailingSlashLocation extends Location {
  public static stripTrailingSlash(url: string): string {
    return url;
  }
}
Location.stripTrailingSlash = UnstripTrailingSlashLocation.stripTrailingSlash;

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
    SpreadSheetsModule
    // NgxDhis2HttpClientModule.forRoot(<IndexDbServiceConfig>{
    //   namespace: 'USAID',
    //   version: 1,
    //   models: {
    //     users: 'id',
    //     dataElements: 'id'
    //   }
    // })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
