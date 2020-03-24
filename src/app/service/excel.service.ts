// import {Inject, Injectable} from '@angular/core';
// import {WorkSheet as XLSXWorkSheet, utils as XLSXUtils, WorkBook as XLSXWorkBook, write as StyleWrite, utils as StyleUtils, CellObject as StyleCellObject} from 'xlsx';
// import {ExcelConfig} from "./excel.config";
// import {DOCUMENT} from '@angular/common';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class ExcelService {
//
//   worksheet: XLSXWorkSheet = null;
//
//   constructor(@Inject(DOCUMENT) private document: any) { }
//
//   public exportAsExcelFile(json: any[], fileName: string): void { console.log(json);
//   debugger;
//     this.worksheet = XLSXUtils.json_to_sheet(json/*, {header: [], skipHeader:true}*/);
//     //add styles
//     this.setStyles(fileName);
//
//     let workbook: XLSXWorkBook = null;
//
//     switch(fileName) {
//       case 'CashOrderReport': {
//         workbook = { Sheets:  { 'Cash_Order': this.worksheet }, SheetNames: ['Cash_Order']};
//         break;
//       }
//       case 'CashOrderDetailsReport': {
//         workbook = { Sheets:  { 'Cash_Order_Details': this.worksheet }, SheetNames: ['Cash_Order_Details']};
//         break;
//       }
//       case 'CashDepositReport': {
//         workbook = { Sheets:  { 'Cash_Deposit': this.worksheet }, SheetNames: ['Cash_Deposit']};
//         break;
//       }
//       case 'CashDepositDetailsReport': {
//         workbook = { Sheets:  { 'Cash_Deposit_Details': this.worksheet }, SheetNames: ['Cash_Deposit_Details']};
//         break;
//       }
//       case 'InstitutionList': {
//         workbook = { Sheets:  { 'Institution List': this.worksheet }, SheetNames: ['Institution List']};
//         break;
//       }
//       case 'WaiverSummary': {
//         workbook = { Sheets:  { 'Waiver Summary': this.worksheet }, SheetNames: ['Waiver Summary']};
//         break;
//       }
//       case 'DIViewEndpoint': {
//         workbook = { Sheets:  { 'Endpoint Report': this.worksheet }, SheetNames: ['Endpoint Report']};
//         break;
//       }
//       case 'DIViewDNRequest': {
//         workbook = { Sheets:  { 'DN Request Report': this.worksheet }, SheetNames: ['DN Request Report']};
//         break;
//       }
//       case 'groupReport': {
//         workbook = { Sheets:  { 'Group Report': this.worksheet }, SheetNames: ['Group Report']};
//         break;
//       }
//       case 'groupReportDetail': {
//         workbook = { Sheets:  { 'Group Report': this.worksheet }, SheetNames: ['Group Report']};
//         break;
//       }
//       case 'subscriberAccessReport': {
//         workbook = { Sheets:  { 'User Access Report': this.worksheet }, SheetNames: ['User Access Report']};
//         break;
//       }
//       case 'subscriberAccessReportDetail': {
//         workbook = { Sheets:  { 'User Access Report Detail': this.worksheet }, SheetNames: ['User Access Report Detail']};
//         break;
//       }
//       case 'groupEndpointReport': {
//         workbook = { Sheets:  { 'Group Endpoint Report': this.worksheet }, SheetNames: ['Group Endpoint Report']};
//         break;
//       }
//       case 'groupEndpointReportDetail': {
//         workbook = { Sheets:  { 'Group Endpoint Report Detail': this.worksheet }, SheetNames: ['Group Endpoint Report Detail']};
//         break;
//       }
//       case 'groupEndpointUserReport': {
//         workbook = { Sheets:  { 'Group Endpoint User Report': this.worksheet }, SheetNames: ['Group Endpoint User Report']};
//         break;
//       }
//       case 'groupEndpointUserReportDetail': {
//         workbook = { Sheets:  { 'Group Endpoint User Report Detail': this.worksheet }, SheetNames: ['Group Endpoint User Report Detail']};
//         break;
//       }
//       case 'DIViewOrderByFor': {
//         workbook = { Sheets:  { 'Order By Order For ABAs': this.worksheet }, SheetNames: ['Order By Order For ABAs']};
//         break;
//       }
//       case 'HFRExportWeeks': {
//         workbook = { Sheets:  { 'HFR Exports': this.worksheet }, SheetNames: ['HFR Exports']};
//         break;
//       }
//       default: {
//         console.log('Invalid file name: ' + fileName);
//         break;
//       }
//     }
//
//     const excelBuffer: any =  StyleWrite(workbook,
//       { bookType: 'xlsx', type: 'buffer', cellDates: true, cellStyles: true});
//
//     this.openExcelFile(excelBuffer, fileName);
//   }
//
//   private setStyles(fileName: string) {
//     const range = StyleUtils.decode_range(this.worksheet['!ref']);
//     let wscols = null;
//
//     switch(fileName) {
//       case 'HFRExportWeeks': {
//         this.setHeaderStyles(range, 1);
//         break;
//       }
//       case 'CashOrderReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 10 }, { wch: 10 },{ wch: 8 },{ wch: 10 },{ wch: 20 },
//           { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 14 }];
//
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const date = StyleUtils.encode_cell({c:0, r:R});
//           const submittedTime = StyleUtils.encode_cell({c:5, r:R});
//           const shipDate = StyleUtils.encode_cell({c:6, r:R});
//           const refNum = StyleUtils.encode_cell({c:8, r:R});
//           const total = StyleUtils.encode_cell({c:9, r:R});
//
//           this.setDateFmt(date);
//           this.setTimeStampFmt(submittedTime);
//           this.setDateFmt(shipDate);
//           this.setTextFmt(refNum);
//           this.setCurrencyFmt(total);
//         }
//         break;
//       }
//       case 'CashOrderDetailsReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 10 }, { wch: 10 },{ wch: 16 },{ wch: 10 },{ wch: 10 },
//           { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 16 },
//           { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
//           { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
//           { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
//           { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
//           { wch: 14 }, { wch: 14 }, { wch: 14 }];
//
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const refNum = StyleUtils.encode_cell({c:0, r:R});
//           const date = StyleUtils.encode_cell({c:1, r:R});
//           const shipDate = StyleUtils.encode_cell({c:4, r:R});
//           const total = StyleUtils.encode_cell({c:5, r:R});
//           const submittedTime = StyleUtils.encode_cell({c:6, r:R});
//
//           this.setDateFmt(date);
//           this.setTimeStampFmt(submittedTime);
//           this.setDateFmt(shipDate);
//           this.setTextFmt(refNum);
//           this.setCurrencyFmt(total);
//         }
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           for(let C = range.s.c+10; C <= range.e.c; ++C) {
//             const denom = StyleUtils.encode_cell({c:C, r:R});
//             this.setCurrencyFmt(denom);
//           }
//         }
//         break;
//       }
//       case 'CashDepositReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 10 }, { wch: 10 },{ wch: 7 },{ wch: 10 },{ wch: 20 },
//           { wch: 10 }, { wch: 30 }, { wch: 10 }, { wch: 14 }];
//
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const date = StyleUtils.encode_cell({c:0, r:R});
//           const submittedTime = StyleUtils.encode_cell({c:5, r:R});
//           const refNum = StyleUtils.encode_cell({c:7, r:R});
//           const total = StyleUtils.encode_cell({c:8, r:R});
//
//           this.setDateFmt(date);
//           this.setTimeStampFmt(submittedTime);
//           this.setTextFmt(refNum);
//           this.setCurrencyFmt(total);
//         }
//         break;
//       }
//       case 'CashDepositDetailsReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 10 }, { wch: 12 },{ wch: 11 },{ wch: 7 },{ wch: 10 }, { wch: 10 }, { wch: 13 }, { wch: 27 }, { wch: 25 },
//           { wch: 10 },  { wch: 10 }, { wch: 10 },{ wch: 10 },{ wch: 10 },{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
//           { wch: 10 }, { wch: 10 },{ wch: 10 },{ wch: 10 },{ wch: 10 } ];
//
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const refNum = StyleUtils.encode_cell({c:0, r:R});
//           const date = StyleUtils.encode_cell({c:1, r:R});
//           const total = StyleUtils.encode_cell({c:5, r:R})
//           const submittedTime = StyleUtils.encode_cell({c:6, r:R});
//           this.setDateFmt(date);
//           this.setTimeStampFmt(submittedTime);
//           this.setTextFmt(refNum);
//           this.setCurrencyFmt(total);
//
//           for(let t = 9; t < 25; t++){
//             const curr = StyleUtils.encode_cell({c:t, r:R});
//             this.setCurrencyFmt(curr);
//           }
//         }
//         break;
//       }
//       case 'InstitutionList': {
//         this.setHeaderStyles(range, 2);
//         wscols = [ { wch: 11 }, { wch: 25 },{ wch: 15 },{ wch: 37 },{ wch: 26 }];
//         break;
//       }
//       case 'WaiverSummary': {
//         this.setHeaderStyles(range, 2);
//         wscols = [ { wch: 30 }, { wch: 25 },{ wch: 15 },{ wch: 37 },{ wch: 26 }];
//         break;
//       }
//       case 'DIViewEndpoint': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 20 }, { wch: 20 },{ wch: 20 },{ wch: 30 }];
//         break;
//       }
//       case 'DIViewDNRequest': {
//         this.setHeaderStyles(range, 1);
//         wscols = [ { wch: 13 }, { wch: 16 },{ wch: 25 },{ wch: 25 },{ wch: 13 },{ wch: 10 }];
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const date = StyleUtils.encode_cell({c:0, r:R});
//           this.setDateFmt(date);
//         }
//         break;
//       }
//       case 'groupReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 }];
//         break;
//       }
//       case 'groupReportDetail': {
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 }];
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const createTS = StyleUtils.encode_cell({c:0, r:R});
//           this.setTimeStampFmt(createTS);
//         }
//         break;
//       }
//       case 'subscriberAccessReport': {
//         this.worksheet['!merges'] = [{s:{r:0,c:0},e:{r:0,c:5}}];
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 },{ wch: 25 },{ wch: 25 }];
//         break;
//       }
//       case 'subscriberAccessReportDetail': {
//         this.worksheet['!merges'] = [{s:{r:0,c:0},e:{r:0,c:5}}, {s:{r:1,c:0},e:{r:1,c:5}}];
//         this.setHeaderStyles(range, 2);
//         wscols = [{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 }];
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const createTS = StyleUtils.encode_cell({c:0, r:R});
//           this.setTimeStampFmt(createTS);
//         }
//         break;
//       }
//       case 'groupEndpointReport': {
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 }];
//         break;
//       }
//       case 'groupEndpointReportDetail': {
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 }];
//         break;
//       }
//       case 'groupEndpointUserReport': {
//         this.worksheet['!merges'] = [{s:{r:0,c:0},e:{r:0,c:3}}]; /* A1:A4 */
//         this.setHeaderStyles(range, 2);
//         wscols = [{ wch: 30 },{ wch: 20 },{ wch: 20 },{ wch: 20 }];
//         break;
//       }
//       case 'groupEndpointUserReportDetail': {
//         this.worksheet['!merges'] = [{s:{r:0,c:0},e:{r:0,c:6}}, {s:{r:1,c:0},e:{r:1,c:6}}]; /* A1:A7, B1:B7 */
//         this.setHeaderStyles(range, 3);
//         wscols = [{ wch: 30 },{ wch: 10 },{ wch: 10 },{ wch: 10 },{ wch: 45 },{ wch: 45 },{ wch: 15}];
//         break;
//       }
//       case 'DIViewOrderByFor': {
//         this.setHeaderStyles(range, 1);
//         wscols = [{ wch: 30 },{ wch: 30 },{ wch: 30 }];
//         for(let R = range.s.r+1; R <= range.e.r; ++R) {
//           const createTS = StyleUtils.encode_cell({c:2, r:R});
//           this.setTimeStampFmt(createTS);
//         }
//         break;
//       }
//       default: {
//         console.log('Invalid file name: ' + fileName);
//         break;
//       }
//     }
//     //set column width
//     if (wscols !== null)
//       this.worksheet['!cols'] = wscols;
//     //set row height
//     this.worksheet['!rows'] = [{ hpx: 13.2 }];
//   }
//
//   private setHeaderStyles(range: any, numOfHeaders: number){
//     let i=0;
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       i=0;
//       while(i<numOfHeaders){//Set header styles
//         const header1 = StyleUtils.encode_cell({c: C, r: i});
//         this.worksheet[header1].s = ExcelConfig.headerStyle;
//         i++;
//       }
//     }
//     //set general cell style
//     for (let R = range.s.r + i; R <= range.e.r; ++R) {
//       for (let C = range.s.c; C <= range.e.c; ++C) {
//         const all = StyleUtils.encode_cell({c: C, r: R});
//         if(this.worksheet[all]){
//           this.worksheet[all].s = ExcelConfig.generalStyle;
//         }
//       }
//     }
//   }
//
//   private setDateFmt(cell: StyleCellObject) {
//     if(this.worksheet[cell] && this.worksheet[cell].v !== '' && this.worksheet[cell].v !== 'N/A'){
//       this.worksheet[cell].t = 'd';
//       this.worksheet[cell].z = ExcelConfig.dateFmt;
//       this.worksheet[cell].s = ExcelConfig.dateStyle;
//     }
//   }
//   private setTimeStampFmt(cell: StyleCellObject){
//     this.worksheet[cell].s = ExcelConfig.dateStyle;
//   }
//   private setTextFmt(cell: StyleCellObject){
//     if(this.worksheet[cell]){
//       this.worksheet[cell].t = 's';
//       this.worksheet[cell].s = ExcelConfig.textStyle;
//     }
//   }
//   private setCurrencyFmt(cell: StyleCellObject){
//     if(this.worksheet[cell]){
//       this.worksheet[cell].t = 'n';
//       this.worksheet[cell].z = ExcelConfig.currencyFmt;
//       this.worksheet[cell].s = ExcelConfig.currencyStyle;
//     }
//   }
//
//   private openExcelFile(buffer: any, fileName: string): void {
//     const data: Blob = new Blob([buffer], {
//       type: ExcelConfig.EXCEL_TYPE
//     });
//
//     //IE
//     if (window.navigator && window.navigator.msSaveOrOpenBlob) {
//       window.navigator.msSaveOrOpenBlob(data, this.getFileName(fileName));
//     }
//     //Chrome
//     else {
//       const url = window.URL.createObjectURL(data);
//       const a = this.document.createElement("a");
//       this.document.body.appendChild(a);
//       a.href = url;
//       a.download = this.getFileName(fileName);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       this.document.body.removeChild(a);
//     }
//   }
//
//   private getFileName(fileName: string): string {
//     const today: Date = new Date();
//     const month = today.getMonth()+1;
//     return fileName + '_' + today.getFullYear() + '_' +
//       month + '_' + today.getDate() + '_' + Date.now() + ExcelConfig.EXCEL_EXTENSION;
//   }
//
// }
