import { Component, OnInit } from '@angular/core';
import {NgxDhis2HttpClientService, ManifestService} from "@hisptz/ngx-dhis2-http-client";
import * as GC from '@grapecity/spread-sheets';
import * as Excel from '@grapecity/spread-excelio';
import '@grapecity/spread-sheets-charts';
import {saveAs} from 'file-saver';
import {max} from 'rxjs/internal/operators';
import {DataValue} from '../models/data-value';
import {DataValueSet} from '../models/data-value-set';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.sass']
})
export class ImportComponent implements OnInit {

  // spreadBackColor = 'aliceblue';
  // hostStyle = {
  //   width: '95vw',
  //   height: '80vh'
  // };
  // private spread: GC.Spread.Sheets.Workbook;
  private excelIO;
  excelData = null;
  dataValues: DataValue[];
  dataValueSet: DataValueSet = new DataValueSet('', '', '', this.dataValues);
  maxColumnCount: number;
  maxRowCount: number;
  preparing: boolean = false;
  importing: boolean = false;

  constructor(private httpClient: NgxDhis2HttpClientService) {
    this.excelIO = new Excel.IO();
  }

  ngOnInit() {
  }

  // workbookInit(args) {
  //   const self = this;
  //   self.spread = args.spread;
  //   const sheet = self.spread.getActiveSheet();
  //   sheet.getCell(0, 0).text('Test Excel').foreColor('blue');
  //   sheet.getCell(1, 0).text('Test Excel').foreColor('blue');
  //   sheet.getCell(2, 0).text('Test Excel').foreColor('blue');
  //   sheet.getCell(3, 0).text('Test Excel').foreColor('blue');
  //   sheet.getCell(0, 1).text('Test Excel').foreColor('blue');
  //   sheet.getCell(1, 1).text('Test Excel').foreColor('blue');
  //   sheet.getCell(2, 1).text('Test Excel').foreColor('blue');
  //   sheet.getCell(3, 1).text('Test Excel').foreColor('blue');
  //   sheet.getCell(0, 2).text('Test Excel').foreColor('blue');
  //   sheet.getCell(1, 2).text('Test Excel').foreColor('blue');
  //   sheet.getCell(2, 2).text('Test Excel').foreColor('blue');
  //   sheet.getCell(3, 2).text('Test Excel').foreColor('blue');
  //   sheet.getCell(0, 3).text('Test Excel').foreColor('blue');
  //   sheet.getCell(1, 3).text('Test Excel').foreColor('blue');
  //   sheet.getCell(2, 3).text('Test Excel').foreColor('blue');
  //   sheet.getCell(3, 3).text('Test Excel').foreColor('blue');
  // }

  onExcelFileChange(args) {
    const target: DataTransfer = <DataTransfer>(args.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader(), self = this;

    this.preparing = true;
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      self.excelData = XLSX.utils.sheet_to_json(ws, {header: 1});

      //console.log(this.excelData);
      console.log(Object.keys(self.excelData).length);
    };

    reader.readAsBinaryString(target.files[0]);
    this.preparing = false;
  }

  onFileChange(args) {
    let file = args.srcElement && args.srcElement.files && args.srcElement.files[0];
    if (file) {

      this.excelIO.open(file, (json) => {
        // this.excelData = {};
        // console.log(json);
        // console.log(json.sheets.Sheet1.columnCount);
        // console.log(json.sheets.Sheet1.rowCount);

        this.maxColumnCount = json.sheets.Sheet1.columnCount;
        this.maxRowCount = json.sheets.Sheet1.rowCount;

        // this.excelData = json.sheets.Sheet1.data.dataTable;
        // this.excelData = JSON.stringify(json.sheets.Sheet1.data.dataTable);

        let isFirstRow = false;
        let rowData = {};
        for (let i = 0; i < this.maxRowCount; i++) {
          rowData = json.sheets.Sheet1.data.dataTable[i];
          //isFirstRow = (rowData.length() == this.maxColumnCount);
          console.log(Object.values(rowData).length);
          console.log(isFirstRow);
          console.log(rowData);
          // console.log(json.sheets.Sheet1.data.dataTable[i]);
          // if (isFirstRow) {
          //   for (let j = 0; i < rowData.length; j++) {
          //     console.log(rowData[j]);
          //   }
          // }

        }

        //console.log(this.excelData);

        // self.spread.fromJSON(json, {});
        // setTimeout(() => {
        //   alert('load successfully');
        // }, 0);
      }, (error) => {
        alert('load fail' + error);
      });
    }
  }

}
