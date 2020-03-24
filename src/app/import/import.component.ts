import { Component, OnInit } from "@angular/core";
import { DataValue } from "../models/data-value";
import { DataValueSet } from "../models/data-value-set";
import * as XLSX from "xlsx";
import { DhisService } from "../service/dhis.service";
import { DataSet } from "../models/data-set";
import { DateService } from "../service/date.service";

@Component({
  selector: "app-import",
  templateUrl: "./import.component.html",
  styleUrls: ["./import.component.sass"]
})
export class ImportComponent implements OnInit {
  pageStatus = "import";
  excelData = null;
  dataValues = [];
  dataValueSets: DataValueSet[] = [];
  headers = [];
  firstDataIndex = 0;
  orgUnitIdIndex = 5;
  reportingPeriodIndex = 6;
  attributeOptionComboIndex = 0;
  preparing: boolean = false;
  importing: boolean = false;
  countries: string;
  dataPerPeriods: string;
  mechanisms: string;
  totalToImport = 0;
  totalDataSetImported = 0;
  totalDataSetNotImported = 0;
  totalDataSetToImport = 0;
  totalDataSet = 0;
  dataSets: DataSet[] = [];
  dataSetId: string = null;
  results = [];
  resultErrors = [];
  importedCount = 0;
  ignoredCount = 0;
  updatedCount = 0;
  deletedCount = 0;

  mappingZm = {};
  dataElements = {};
  attributeOptions = {};
  categoryOptionCombos = {};

  progress: number;
  errorMessage = null;
  dataElementError = [];
  categoryOptionComboError = [];
  attributeOptionError = [];
  orgUnitError = [];
  showMsg = false;
  filename: string;
  btnDisabled: string = "disabled";
  reportingDataForCompleteness = [];
  completenessImportedCount = 0;
  completenessUpdatedCount = 0;
  completenessIgnoredCount = 0;
  completenessDeletedCount = 0;
  excelFile: any = null;
  executingCompleteness = false;
  currentMessage = null;
  showLoading: boolean = false;
  sheetName: string;
  sheetNames = [];
  workBook: XLSX.WorkBook;
  private mechanismIdIndex: number;
  private countryIndex: number;
  templateVersion: number;
  headerSubLine: any = [];
  templateError: string;
  canImport: boolean = false;
  loadingMetadata: boolean = false;
  loadingMappingZm: boolean = false;
  csvData: any = [];

  constructor(private dhisService: DhisService, private ds: DateService) {
    //this.excelIO = new Excel.IO();
  }

  ngOnInit() {
    this.getAllDataSets();
    this.getMappingZm();
    this.pageStatus = "import";
  }

  onExcelFileChange(args: { target: DataTransfer }) {
    const target: DataTransfer = <DataTransfer>args.target;

    if (target.files.length !== 1) throw new Error("Cannot use multiple files");
    const reader: FileReader = new FileReader(),
      self = this;
    this.clearData();
    self.sheetNames = [];
    self.workBook = null;
    self.preparing = true;

    //console.log(target.files[0].name);
    self.filename = target.files[0].name;

    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      self.workBook = XLSX.read(bstr, { type: "binary" });
      if (self.workBook.SheetNames.length === 1) {
        self.sheetName = self.workBook.SheetNames[0];
        self.prepareData();
      } else {
        // console.log(self.workBook.SheetNames);
        self.sheetNames = self.workBook.SheetNames;
      }
    };

    reader.readAsBinaryString(target.files[0]);
    self.preparing = false;
  }

  getAllDataSets() {
    this.loadingMetadata = true;
    this.dhisService.getAllDataSet().subscribe(
      data => {
        for (let i = 0; i < data.dataSets.length; i++) {
          //console.log('entered in loop !');
          if (data.dataSets[i].name.includes("OHA")) {
            this.dataSets.push(
              new DataSet(data.dataSets[i].name, data.dataSets[i].id)
            );
            this.dataSetId = data.dataSets[i].id;
            this.receivingMetadataForDataSet(this.dataSetId);
          }
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPeriod(d: number) {
    let mDate = new Date((d - (25567 + 1)) * 86400 * 1000);
    return this.ds.getWeekNumber(mDate);
  }

  getDataElementUid(val: string) {
    let prefix = "HFR: ";
    let code = "";
    if (val === undefined) {
      return;
    }
    let parts = val.split(".");

    if (this.templateVersion === 1) {
      if (parts.length === 1) {
        parts = val.split("-");
        code = prefix + parts[0];
      } else if (parts.length === 3) {
        code = prefix + parts[0];
        if (val.includes("POS<15")) code += "_POS";
      } else {
        parts.length = parts.length - 2;
        code = prefix + parts.join("_");
      }
    } else {
      code = prefix + parts[0];
    }

    code = code.toLowerCase();
    if (
      (this.dataElements[code] === undefined ||
        this.dataElements[code] === null) &&
      !this.dataElementError.includes(
        "The data Element in header (" + val + ") is not correctly written !"
      )
    ) {
      this.dataElementError.push(
        "The data Element in header (" + val + ") is not correctly written !"
      );
      this.canImport = false;
    }
    // return code;
    return this.dataElements[code];
  }

  getCategoryOptionComboUid(val: string | string[]) {
    if (val === undefined) {
      return;
    }
    let kv = {};
    if (this.templateVersion === 1) {
      kv["15+.M"] = "15+, Male";
      kv["<15.M"] = "<15, Male";
      kv["15+.F"] = "15+, Female";
      kv["<15.F"] = "<15, Female";
      kv["-1"] = "1 month";
      kv["-2"] = "2 month";
      kv["-3"] = "3 month";
      kv["-4"] = "4 month";
      kv["-5"] = "5 month";
      kv["-6"] = "6 month";
    } else if (this.templateVersion === 2) {
      kv["tx_mmd.o15.f.u3mo"] = "15+, Female, < 3 months";
      kv["tx_mmd.u15.f.u3mo"] = "<15, Female, < 3 months";
      kv["tx_mmd.u15.m.u3mo"] = "<15, Male, < 3 months";
      kv["tx_mmd.o15.m.u3mo"] = "15+, Male, < 3 months";
      kv["tx_mmd.u15.f.35mo"] = "<15, Female, 3-5 months";
      kv["tx_mmd.u15.m.35mo"] = "<15, Male, 3-5 months";
      kv["tx_mmd.o15.f.35mo"] = "15+, Female, 3-5 months";
      kv["tx_mmd.o15.m.35mo"] = "15+, Male, 3-5 months";
      kv["tx_mmd.u15.f.o6mo"] = "<15, Female, 6+ months";
      kv["tx_mmd.u15.m.o6mo"] = "<15, Male, 6+ months";
      kv["tx_mmd.o15.f.o6mo"] = "15+, Female, 6+ months";
      kv["tx_mmd.o15.m.o6mo"] = "15+, Male, 6+ months";
      kv[".o15.m"] = "15+, Male";
      kv[".u15.m"] = "<15, Male";
      kv[".o15.f"] = "15+, Female";
      kv[".u15.f"] = "<15, Female";
    }

    let categoryOptionCombo = "";

    for (let key in kv) {
      if (val.includes(key)) {
        categoryOptionCombo = kv[key];
        break;
      }
    }
    if (
      categoryOptionCombo === "" &&
      !this.categoryOptionComboError.includes(
        "The category option combo in header (" +
          val +
          ") is not correctly written !"
      )
    ) {
      this.categoryOptionComboError.push(
        "The category option combo in header (" +
          val +
          ") is not correctly written !"
      );
      this.canImport = false;
    }

    // return categoryOptionCombo;
    return this.categoryOptionCombos[categoryOptionCombo];
  }

  // Taking data from the excel file to transform and create DataValueSet
  createDataValueSets(data: string | any[]) {
    this.clearData();

    let mechanisms = [];
    let countries = [];
    let dataPerPeriods = [];

    let orgUnit: string;
    let period: string;
    let attributeOptionCombo: string;
    let completeDate: string;

    let firstLine = this.templateVersion === 1 ? 1 : 2;

    this.canImport = true;

    if (data[firstLine].length === 0) {
      this.templateError = "No data in template !";
    }
    // console.log(data[firstLine]);
    // console.log(this.templateError);

    for (
      let i = firstLine;
      i < data.length && data[firstLine].length !== 0;
      i++
    ) {
      let row = data[i];

      if (row.length === 0) {
        continue;
      }
      // if (row[this.orgUnitIdIndex] === undefined) {
      //   console.log('org unit of undefined line = ' + i);
      // }
      orgUnit = this.getOrgUnitUid(
        row[this.countryIndex],
        row[this.orgUnitIdIndex]
      );
      if (orgUnit === null) {
        console.log(row[1]);
      }
      period = this.getPeriod(row[this.reportingPeriodIndex]);
      attributeOptionCombo = this.getAttributionOptionUid(
        row[this.mechanismIdIndex]
      );
      // if(firstLine === i) {
      //   console.log('Date excel ', row[this.reportingPeriodIndex]);
      //   console.log('Date transformed : ', this.ds.formatDateSimple(new Date(row[this.reportingPeriodIndex])));
      //   console.log('Date transformed from period : ', this.ds.getDateFromPeriod(row[this.reportingPeriodIndex]));
      // }
      completeDate = this.ds.formatDateSimple(
        this.ds.getDateFromPeriod(row[this.reportingPeriodIndex])
      );

      this.reportingDataForCompleteness.push({
        organisationUnit: orgUnit,
        period: period,
        attributeOptionCombo: attributeOptionCombo,
        dataSet: this.dataSetId,
        date: completeDate,
        storedBy: "imported"
      });

      if (this.dataValueSets.length === 0) {
        this.dataValueSets.push(
          new DataValueSet(
            this.dataSetId,
            [],
            orgUnit,
            period,
            attributeOptionCombo,
            completeDate
          )
        );
      } else {
        let notExisting = true;

        for (let d = 0; d < this.dataValueSets.length; d++) {
          let dataValueSet = this.dataValueSets[d];
          if (
            dataValueSet.orgUnit === orgUnit &&
            dataValueSet.period === period &&
            dataValueSet.attributeOptionCombo === attributeOptionCombo
          ) {
            notExisting = false;
            break;
          }
        }

        if (notExisting) {
          this.dataValueSets.push(
            new DataValueSet(
              this.dataSetId,
              [],
              orgUnit,
              period,
              attributeOptionCombo,
              completeDate
            )
          );
        }
      }
    }

    for (
      let line = firstLine;
      line < data.length && data[firstLine].length !== 0;
      line++
    ) {
      let row = data[line];
      if (row.length === 0) {
        continue;
      }
      for (let column = this.firstDataIndex; column < row.length; column++) {
        if (
          mechanisms.length === 0 ||
          !mechanisms.includes(row[this.mechanismIdIndex])
        ) {
          mechanisms.push(row[this.mechanismIdIndex]);
        }
        if (
          countries.length === 0 ||
          !countries.includes(row[this.countryIndex])
        ) {
          countries.push(row[this.countryIndex]);
        }
        let value = row[column];
        if (value !== undefined /*&& value.replace(/\s/g, "") !== ''*/) {
          period = this.getPeriod(row[this.reportingPeriodIndex]);
          if (dataPerPeriods.length === 0 || !dataPerPeriods.includes(period)) {
            dataPerPeriods.push(period);
          }
          orgUnit = this.getOrgUnitUid(
            row[this.countryIndex],
            row[this.orgUnitIdIndex]
          );

          attributeOptionCombo = this.getAttributionOptionUid(
            row[this.mechanismIdIndex]
          );
          let headerValue: string;
          if (this.templateVersion === 2) {
            headerValue = this.headerSubLine[column];
          } else {
            headerValue = this.headers[column];
          }
          let dataValue: DataValue;
          if (this.templateVersion === 1) {
            dataValue = new DataValue(
              this.getDataElementUid(headerValue),
              this.getCategoryOptionComboUid(this.headers[column]),
              value
            );
          } else {
            dataValue = new DataValue(
              this.getDataElementUid(headerValue),
              this.getCategoryOptionComboUid(this.headerSubLine[column]),
              value
            );
          }

          for (let d = 0; d < this.dataValueSets.length; d++) {
            let dataValueSet = this.dataValueSets[d];

            if (
              dataValueSet.orgUnit === orgUnit &&
              dataValueSet.period === period &&
              dataValueSet.attributeOptionCombo === attributeOptionCombo
            ) {
              if (this.dataValueSets[d].dataValues === null) {
                let dataValues = [];
                dataValues.push(dataValue);
                this.dataValueSets[d].dataValues = dataValues;
              } else {
                this.dataValueSets[d].dataValues.push(dataValue);
              }
              break;
            }
          }
          this.dataValues.push(dataValue);
          this.totalToImport += 1;
        }
      }
      this.totalDataSet += 1;
    }
    this.countries = countries.join(", ");
    this.dataPerPeriods = dataPerPeriods.join(", ");
    this.mechanisms = mechanisms.join(", ");
    // console.log(this.dataValueSets);
  }

  getAttributionOptionUid(val: string) {
    for (let key in this.attributeOptions) {
      if (key.includes(val)) {
        return this.attributeOptions[key];
      }
    }
    if (
      !this.attributeOptionError.includes(
        "The mechanism Id (" + val + ") does not exist !"
      )
    ) {
      this.attributeOptionError.push(
        "The mechanism Id (" + val + ") does not exist !"
      );
      this.canImport = false;
    }
    return val;
  }

  async receivingMetadataForDataSet(dataSet: string) {
    await this.dhisService.getMetaDataFromDataSet(dataSet).subscribe(
      data => {
        // console.log(data);
        for (
          let i = 0;
          i < data.categoryCombo.categoryOptionCombos.length;
          i++
        ) {
          if (
            data.categoryCombo.categoryOptionCombos[i].name.includes("USAID,")
          ) {
            this.attributeOptions[
              data.categoryCombo.categoryOptionCombos[i].name
            ] = data.categoryCombo.categoryOptionCombos[i].id;
          }
        }

        for (let i = 0; i < data.dataSetElements.length; i++) {
          // let dataElement = data.dataSetElements[i];
          //console.log(dataElement);
          this.dataElements[
            data.dataSetElements[i].dataElement.code.toLowerCase()
          ] = data.dataSetElements[i].dataElement.id;
          let combos =
            data.dataSetElements[i].dataElement.categoryCombo
              .categoryOptionCombos;
          //console.log(combos);
          for (let j = 0; j < combos.length; j++) {
            this.categoryOptionCombos[combos[j].name] = combos[j].id;
          }
        }
        if (Object.keys(this.dataElements).length !== 0) {
          this.loadingMetadata = false;
        }
      },
      error => {
        console.log(error);
      }
    );
    // console.log("Data Elements", this.dataElements);
    // console.log('Category Option Combos', this.categoryOptionCombos);
    // console.log('Attribute Options', this.attributeOptions);
  }

  importData() {
    this.clearOnImport();
    this.importing = true;
    this.showLoading = true;
    this.currentMessage = "Importing data ...";

    this.totalDataSetToImport = this.dataValueSets.length;

    for (let i = 0; i < this.dataValueSets.length; i++) {
      let dataValueSet = this.dataValueSets[i];

      this.dhisService.importDataValueSet(dataValueSet).subscribe(
        (data: any) => {
          this.importedCount += data.importCount.imported;
          this.deletedCount += data.importCount.deleted;
          this.updatedCount += data.importCount.updated;
          this.ignoredCount += data.importCount.ignored;

          if (data.status === "ERROR" || data.status === "WARNING") {
            this.totalDataSetNotImported += 1;

            // if (this.totalDataSetNotImported === 1) console.log(data);

            if (data.conflicts) {
              let results = data.conflicts;
              for (let i = 0; i < results.length; i++) {
                this.resultErrors.push({
                  object: results[i].object,
                  value: results[i].value,
                  description: data.description
                });
              }
            } else {
              this.resultErrors.push({
                object: null,
                value: null,
                description: data.description
              });
            }
          } else {
            this.totalDataSetImported += 1;
          }

          if (this.totalDataSetToImport !== 0) {
            this.progress = Math.floor(
              ((this.totalDataSetImported + this.totalDataSetNotImported) *
                100) /
                this.totalDataSetToImport
            );
          } else {
            this.progress = 0;
          }

          if (this.progress === 100) {
            this.completeness();
          }
        },
        error => {
          console.log(error);
          this.importing = false;
          this.showLoading = false;
        }
      );
    }
  }

  // selectDataSet($event) {
  //   let id = this.dataSetId;
  //   this.clearAll();
  //   this.clearOnImport();
  //   this.dataSetId = id;
  //   if (this.dataSetId !== null && this.dataSetId !== undefined && this.dataSetId !== '') {
  //     this.receivingMetadataForDataSet(this.dataSetId);
  //     console.log('enabled');
  //     this.btnDisabled = '';
  //     return;
  //   }
  //   this.btnDisabled = 'disabled';
  //   console.log('enabled');
  // }

  getMappingZm() {
    this.loadingMappingZm = true;
    this.dhisService.getMappingOrgUnitZambia().subscribe(
      data => {
        for (let i = 0; i < data.length; i++) {
          this.mappingZm[data[i].datimId] = data[i].dhis2Id;
        }
        if (Object.keys(this.mappingZm).length !== 0) {
          this.loadingMappingZm = false;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getOrgUnitUid(country: string, id: string) {
    if (id !== undefined) {
      if (country === "Zambia") {
        //if (Object.entries(this.mappingZm).length === 0/* && this.mappingZm.constructor === Object*/) {
        //this.getMappingZm();
        //}
        let zmUid = this.mappingZm[id];
        if (zmUid !== undefined && zmUid !== null) {
          return zmUid;
        } else {
          if (
            !this.orgUnitError.includes(
              "The organization unit (" + id + ") is not in mapping !"
            )
          ) {
            this.canImport = false;
            this.orgUnitError.push(
              "The organization unit (" + id + ") is not in mapping !"
            );
          }
          return id;
        }
      } else {
        return id;
      }
    }
    if (!this.orgUnitError.includes("Some organization units id are empty !"))
      this.orgUnitError.push("Some organization units id are empty !");
    return id;
  }

  clearAll() {
    this.clearData();
    this.clearOnImport();
    this.dataSetId = null;
    this.excelFile = null;
    this.filename = "";
    this.workBook = null;
    this.sheetName = null;
    this.sheetNames = [];
  }

  clearData() {
    this.btnDisabled = "disabled";
    this.resultErrors.length = 0;
    this.dataValueSets.length = 0;
    this.progress = 0;
    this.totalDataSetImported = 0;
    this.totalDataSetNotImported = 0;
    this.totalDataSet = 0;
    this.totalToImport = 0;
    this.dataElementError = [];
    this.attributeOptionError = [];
    this.errorMessage = null;
    this.reportingDataForCompleteness = [];
    this.categoryOptionComboError = [];
    this.orgUnitError = [];
    this.dataValueSets = [];
  }

  clearOnImport() {
    this.importedCount = 0;
    this.deletedCount = 0;
    this.updatedCount = 0;
    this.ignoredCount = 0;
    this.completenessImportedCount = 0;
    this.completenessDeletedCount = 0;
    this.completenessUpdatedCount = 0;
    this.completenessIgnoredCount = 0;
    this.resultErrors.length = 0;
    this.progress = 0;
    this.totalDataSetImported = 0;
    this.totalDataSetNotImported = 0;
    this.currentMessage = null;
  }

  showMessage() {
    this.showMsg =
      this.errorMessage !== undefined &&
      this.errorMessage !== "" &&
      this.errorMessage !== null;
  }

  completeness() {
    // if (!this.importing) {
    // this.executingCompleteness = true;
    this.currentMessage = "executing completeness";
    let completeDataSetRegistrations = {
      completeDataSetRegistrations: this.reportingDataForCompleteness
    };
    //console.log(completeDataSetRegistrations);
    this.dhisService
      .completeRegistration(completeDataSetRegistrations)
      .subscribe(
        (data: any) => {
          // console.log(data);
          this.completenessImportedCount = data.importCount.imported;
          this.completenessDeletedCount = data.importCount.deleted;
          this.completenessUpdatedCount = data.importCount.updated;
          this.completenessIgnoredCount = data.importCount.ignored;
          this.currentMessage = "Import complete";
          // this.executingCompleteness = false;
          if (this.completenessIgnoredCount !== 0) {
            console.log(data);
          }
          this.showLoading = false;
          this.importing = false;
        },
        error => {
          console.log(error);
          this.showLoading = false;
          this.importing = false;
        }
      );
    // }
  }
  /**
   * fonction to check if the Template format and data are correct and initializing Template version first variables
   */
  prepareData() {
    let self = this,
      totalDataPerLine: number;
    this.firstDataIndex = 0;
    this.templateError = null;
    const ws: XLSX.WorkSheet = self.workBook.Sheets[self.sheetName];
    self.excelData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    self.headers = self.excelData[0];

    if (
      !self.headers.includes("OrgUnit ID") &&
      !self.headers.includes("FACILITY OR COMMUNITY UID")
    ) {
      this.templateError =
        "The Facility ID Header label is not correctly written or is not in the template\n." +
        'The correct label is "OrgUnit ID" or "FACILITY OR COMMUNITY UID" ';
      return;
    }
    if (
      !self.headers.includes("HFR WEEK START DATE") &&
      !self.headers.includes("Reporting Period")
    ) {
      this.templateError =
        "The Reporting start date Header label is not correctly written or is not in the template\n." +
        'The correct label is "Reporting Period" or "HFR WEEK START DATE" ';
      return;
    }
    if (
      !self.headers.includes("MECHANISM ID") &&
      !self.headers.includes("Mechanism ID")
    ) {
      this.templateError =
        "The Mechanism ID Header label is not correctly written or is not in the template\n." +
        'The correct label is "Mechanism ID" or "MECHANISM ID" ';
      return;
    }
    if (
      !self.headers.includes("Operating Unit") &&
      !self.headers.includes("OU")
    ) {
      this.templateError =
        "The Operating unit date Header label is not correctly written or is not in the template\n." +
        'The correct label is "Operating Unit" or "OU" ';
      return;
    }
    // Taking index for first part
    for (let i = 0; i < self.headers.length; i++) {
      if (self.headers[i] === undefined) continue;
      let txtObtained: string = self.headers[i];
      self.headers[i] = self.headers[i].replace(/\\n|\\r\\n|\\r/g, "");
      if (
        txtObtained.includes("FACILITY OR COMMUNITY UID") ||
        txtObtained.includes("OrgUnit ID")
      ) {
        self.orgUnitIdIndex = i;
        // console.log("Facility uid index : " + i);
      } else if (
        txtObtained.includes("HFR WEEK START DATE") ||
        txtObtained.includes("Reporting Period")
      ) {
        self.reportingPeriodIndex = i;
        // console.log("Start date index : " + i);
      } else if (
        txtObtained.includes("MECHANISM ID") ||
        txtObtained.includes("Mechanism ID")
      ) {
        this.mechanismIdIndex = i;
        // console.log("Mechanism ID index : " + i);
      } else if (
        (txtObtained.includes("HTS") ||
          txtObtained.includes("TX") ||
          txtObtained.includes("VMM") ||
          txtObtained.includes("PrEP")) &&
        this.firstDataIndex === 0
      ) {
        self.firstDataIndex = i;
        //console.log("First Data index : " + self.firstDataIndex);
      } else if (
        txtObtained.includes("Operating Unit") ||
        txtObtained.includes("OU")
      ) {
        this.countryIndex = i;
        // console.log("Country index : " + i);
      }
    }
    // console.log(self.headers);
    // console.log(self.countryIndex);
    // console.log(self.mechanismIdIndex);

    // totalDataPerLine = self.headers.length - self.firstDataIndex;
    //console.log(totalDataPerLine);
    if (this.mechanismIdIndex === 0) {
      // if (totalDataPerLine === 28 || totalDataPerLine === 10 || totalDataPerLine === 18 ) {
      self.templateVersion = 1;
    } else if (this.mechanismIdIndex === 3) {
      self.templateVersion = 2;
      self.headerSubLine = this.excelData[1];
    } else {
      self.templateError =
        "You have selected a wrong template file or a wrong sheet";
    }

    if (self.templateError === null) {
      this.createDataValueSets(self.excelData);
    }

    // console.log(self.headerSubLine);
  }

  onSheetChange($event: Event) {
    this.clearData();
    this.clearOnImport();
  }
}
