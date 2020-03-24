import { Component, OnInit } from '@angular/core';
import {NgxDhis2HttpClientService, ManifestService} from "@hisptz/ngx-dhis2-http-client";
import * as GC from '@grapecity/spread-sheets';
import * as Excel from '@grapecity/spread-excelio';
import '@grapecity/spread-sheets-charts';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.sass']
})
export class ExportComponent implements OnInit {

  private spread: GC.Spread.Sheets.Workbook;
  private excelIO;

  constructor(private httpClient: NgxDhis2HttpClientService) {
    this.excelIO = new Excel.IO();
  }

  ngOnInit() {
  }

  onClickMe(args) {
    const self = this;
    const filename = 'exportExcel.xlsx';
    const json = JSON.stringify(self.spread.toJSON());
    self.excelIO.save(json, function (blob) {
      saveAs(blob, filename);
    }, function (e) {
      console.log(e);
    });
  }
}
