import { Component, OnInit, ViewChild } from "@angular/core";
import { DhisService } from "../service/dhis.service";
import { forkJoin, of } from "rxjs";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { jqxDataTableComponent } from "jqwidgets-ng/jqxdatatable";
import { catchError, count, last } from "rxjs/operators";
import { ExcelConfig } from "../service/excel.config";
import { DateService } from "../service/date.service";

@Component({
  selector: "app-export",
  templateUrl: "./export.component.html",
  styleUrls: ["./export.component.sass"]
})
export class ExportComponent implements OnInit {
  selectedFirstYear: number;
  selectedLastYear;
  currentYear: number;
  currentWeek: number;
  selectedFirstWeek: number;
  firstPeriod: string;
  lastPeriod: string;
  selectedLastWeek: number;
  lastWeek;
  multipleWeek: boolean = false;
  firstPeriodWeekList = [];
  lastPeriodWeekList = [];
  dataElements = [];
  projectComboOptions = [];
  agencyComboOptions = [];
  countries = {};
  countryLatestLevel = {};
  mappingZambia = {};
  urls = [];
  promises = [];
  orgUnitSelected: string;
  projectCategory: {
    id: string;
    name: string;
  };
  dataExported = [];
  dataValues = [];

  agencyCategory: {
    id: string;
    name: string;
  };
  headers = {};

  dataElementShortNames = [
    "HIV Testing Volume",
    "HIV Positive Testing Volume",
    "New Enrollments on Treatment",
    "VMMC Services Completed",
    "Newly Initiated on PrEP",
    "Current Cohort on Treatment",
    "Multi Month Dispensing",
    "Multi Month Dispensing new"
  ];

  notUsedHeader = [
    "orgunitlevel1",
    "orgunitlevel2",
    "organisationunitcode",
    "periodname",
    "periodcode",
    "tIC3uGX8SIqid",
    "organisationunitdescription"
  ];

  headerAliases = {};
  private mappingZm = {};

  @ViewChild("myDataTable", { static: false })
  myDataTable: jqxDataTableComponent;
  dataFields = [];
  columns: any = [];
  source: any = {
    localData: this.dataValues,
    dataType: "json",
    dataFields: this.dataFields
  };
  dataAdapter: any;
  private returnedPeriods: any[];
  loading: boolean = false;
  loadingGetAllCountries: boolean = false;
  loadingMapping: boolean = false;
  loadingMetadata: boolean = false;
  loadingCountryLasLevel: boolean = false;
  private mappingZmName: any;

  constructor(
    private dhisService: DhisService /*, private es: ExcelService*/,
    private ds: DateService
  ) {
    //this.excelIO = new Excel.IO();
  }

  async ngOnInit() {
    this.selectedFirstYear = this.ds.getCurrentYear();
    this.selectedLastYear = this.ds.getCurrentYear();
    this.currentYear = this.ds.getCurrentYear();
    this.currentWeek = this.ds.getCurrentWeek();
    this.lastWeek = this.ds.getCurrentWeek();
    this.selectedLastWeek = this.currentWeek;
    this.selectedFirstWeek = this.selectedLastWeek - 4;
    this.firstPeriodWeekList = this.getYearWeeks(this.currentYear);
    this.lastPeriodWeekList = this.getYearWeeks(this.currentYear);
    this.firstPeriod = this.firstPeriodWeekList[0].value;
    this.lastPeriod = this.lastPeriodWeekList[0].value;

    this.headerAliases["tIC3uGX8SIqcode"] = "MECHANISM ID";
    this.headerAliases["orgunitlevel3"] = "OU";
    this.headerAliases["organisationunitid"] = "FACILITY OR COMMUNITY UID";
    this.headerAliases["organisationunitname"] = "FACILITY OR COMMUNITY NAME";
    this.headerAliases["periodid"] = "Period ID";
    this.headerAliases["periodstartdate"] = "HFR WEEK START DATE";
    this.headerAliases["parentorgunitname"] = "PSNU";
    this.headerAliases["tIC3uGX8SIqname"] = "MECHANISM OR PARTNER NAME";

    this.headers["tIC3uGX8SIqcode"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    this.headers["tIC3uGX8SIqname"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    //this.headers['partnerName'] = null;
    this.headers["orgunitlevel3"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    this.headers["parentorgunitname"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    this.headers["organisationunitname"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    this.headers["organisationunitid"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };
    this.headers["periodstartdate"] = null;
    this.headers["periodid"] = {
      ghanaIdx: null,
      zambiaIdx: null,
      ugandaIdx: null
    };

    await this.loadInitialData().then(() => {
      console.log("All data are loaded");
    });
  }

  async loadInitialData() {
    await this.getAllCountries().then(() => {
      console.log("All countries loaded");
    });

    await this.getMetaData().then(() => {
      console.log("Metadata loaded");
    });

    await this.getMappingZm().then(() => {
      console.log("Mapping data loaded");
    });

    await this.getCountryOrgUnitLatestLevel().then(() => {
      console.log("Countries with level data loaded");
    });
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return "90%";
    }
    return "100%";
  }

  getLastWeek() {
    if (this.selectedFirstYear === this.currentYear) {
      this.lastWeek = this.ds.getCurrentWeek();
    } else {
      this.lastWeek = 52;
    }
  }

  multiple() {
    // console.log(this.multipleWeek);
    if (this.multipleWeek) {
      this.selectedLastYear = this.ds.getCurrentYear();
      this.lastPeriodWeekList = this.getYearWeeks(this.selectedLastYear);
    }
  }

  getYearWeeks(year) {
    let weeks = [];
    let d =
      this.ds.getCurrentYear() === year
        ? this.ds.addDays(new Date(), -7)
        : new Date(year, 11, 31);
    let lastWeek =
      this.ds.getCurrentYear() === year ? this.ds.getCurrentWeek() : 52;
    for (let i = lastWeek; i >= 1; i--) {
      let sunday = this.ds.getSunday(d);
      let monday = this.ds.getMonday(d);
      let weekNo = year + "W" + (i < 10 ? "0" + i : i);
      weeks.push({
        value: weekNo,
        label: "Week " + i + " : " + this.ds.formatDate(monday, sunday)
      });
      d = this.ds.addDays(d, -7);
    }
    return weeks;
  }

  // getPreviousYearWeeksForLastPeriod() {
  //   this.selectedLastYear -= 1;
  //   this.lastWeek = 52;
  //   this.lastPeriodWeekList = this.getYearWeeks(this.selectedLastYear);
  // }
  //
  /*getNextYearWeeksForLastPeriod() {
    if (this.ds.getCurrentYear() === this.selectedLastYear) {
      this.lastPeriodWeekList = this.getYearWeeks(this.ds.getCurrentYear());
    } else {
      this.selectedLastYear += 1;
      if (this.selectedLastYear === this.ds.getCurrentYear()){
        this.lastWeek = this.getLastWeek();
      } else {
        this.lastWeek = 52;
      }
      this.lastPeriodWeekList = this.getYearWeeks(this.selectedLastYear);
    }
  }*/

  getPreviousYearWeeksForFirstPeriod() {
    this.selectedFirstYear -= 1;
    this.lastWeek = 52;
    this.firstPeriodWeekList = this.getYearWeeks(this.selectedFirstYear);
  }

  getNextYearWeeksForFirstPeriod() {
    if (this.ds.getCurrentYear() === this.selectedFirstYear) {
      this.firstPeriodWeekList = this.getYearWeeks(this.ds.getCurrentYear());
    } else {
      this.selectedFirstYear += 1;
      if (this.selectedFirstYear === this.ds.getCurrentYear()) {
        this.lastWeek = this.getLastWeek();
      } else {
        this.lastWeek = 52;
      }
      this.firstPeriodWeekList = this.getYearWeeks(this.selectedFirstYear);
    }
  }

  async getMetaData() {
    this.loadingMetadata = true;
    await this.dhisService.getMetaDataFromDataSet("yKVuIgtI49b").subscribe(
      data => {
        //console.log(data);
        for (
          let i = 0;
          i < data.categoryCombo.categoryOptionCombos.length;
          i++
        ) {
          let categoryOptions = data.categoryCombo.categoryOptionCombos[i];
          //console.log(categoryOptions);
          if (categoryOptions.name.includes("USAID,")) {
            for (let j = 0; j < categoryOptions.categoryOptions.length; j++) {
              if (categoryOptions.categoryOptions[j].name === "USAID") {
                if (
                  !this.agencyComboOptions.includes(
                    categoryOptions.categoryOptions[j].id
                  )
                ) {
                  this.agencyComboOptions.push(
                    categoryOptions.categoryOptions[j].id
                  );
                  this.agencyCategory = {
                    name: categoryOptions.categoryOptions[j].categories[0].name,
                    id: categoryOptions.categoryOptions[j].categories[0].id
                  };
                }
              } else {
                this.projectComboOptions.push(
                  categoryOptions.categoryOptions[j].id
                );
                this.projectCategory = {
                  name: categoryOptions.categoryOptions[j].categories[0].name,
                  id: categoryOptions.categoryOptions[j].categories[0].id
                };
              }
            }
          }
        }

        for (let i = 0; i < data.dataSetElements.length; i++) {
          this.dataElements.push(data.dataSetElements[i].dataElement.id);
        }

        if (this.dataElements.length !== 0) {
          this.loadingMetadata = false;
        }

        // console.log('project Combo Option : ', this.projectComboOptions);
        // console.log('agency Combo Option : ', this.agencyComboOptions);
        // console.log('data elements : ', this.dataElements);
        // console.log('project : ', this.projectCategory);
        // console.log('agency : ', this.agencyCategory);
      },
      error => {
        console.log(error);
      }
    );
  }

  async getAllCountries() {
    this.loadingGetAllCountries = true;
    this.dhisService.getAllCountries().subscribe(
      (data: any) => {
        for (let i = 0; i < data.organisationUnits.length; i++) {
          let orgUnit = data.organisationUnits[i];
          // console.log(orgUnit.name);
          this.countries[orgUnit.name] = orgUnit.id;
        }
        if (Object.keys(this.countries).length !== 0)
          this.loadingGetAllCountries = false;
        // console.log(this.countries);
      },
      error => {
        console.log(error);
      }
    );
  }

  async getCountryOrgUnitLatestLevel() {
    this.loadingCountryLasLevel = true;
    await this.dhisService.getDataSetOrgUnit("yKVuIgtI49b").subscribe(
      (data: any) => {
        let orgUnits = data.organisationUnits;
        let countryLatestLevel = {};
        let inverseCountriesObj = {};
        for (let key in this.countries) {
          inverseCountriesObj[this.countries[key]] = key;
        }
        // console.log(orgUnits);
        orgUnits.forEach(orgUnit => {
          let level = orgUnit.level;
          let countryId = orgUnit.ancestors[2].id;
          if (
            Object.keys(countryLatestLevel).length === 0 ||
            countryLatestLevel[inverseCountriesObj[countryId] + "-" + level] ===
              undefined
          ) {
            countryLatestLevel[inverseCountriesObj[countryId] + "-" + level] = {
              level: level,
              nb: 1
            };
          } else if (
            countryLatestLevel[inverseCountriesObj[countryId] + "-" + level] !==
            undefined
          ) {
            let count =
              countryLatestLevel[inverseCountriesObj[countryId] + "-" + level]
                .nb + 1;
            countryLatestLevel[inverseCountriesObj[countryId] + "-" + level] = {
              level: level,
              nb: count
            };
          }
        });

        // console.log(countryLatestLevel);
        let tmpData = {};
        Object.keys(countryLatestLevel).forEach(key => {
          // console.log(key);
          if (Object.keys(this.countryLatestLevel).length === 0) {
            this.countryLatestLevel[key.split("-")[0]] =
              countryLatestLevel[key].level;
            tmpData[key.split("-")[0]] = countryLatestLevel[key].nb;
          } else if (this.countryLatestLevel[key.split("-")[0]] === undefined) {
            this.countryLatestLevel[key.split("-")[0]] =
              countryLatestLevel[key].level;
            tmpData[key.split("-")[0]] = countryLatestLevel[key].nb;
          } else {
            if (tmpData[key.split("-")[0]] > countryLatestLevel[key].nb) {
              this.countryLatestLevel[key.split("-")[0]] =
                countryLatestLevel[key].level;
            }
          }
        });

        // console.log(this.countryLatestLevel);

        if (Object.keys(this.countryLatestLevel).length !== 0)
          this.loadingCountryLasLevel = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  /*getLatestLevel(country, id, level) {
    this.dhisService.getOrgUnit(id).subscribe(data => {
      // console.log(data);
      if (data.children.length !== 0) {
        let childId = data.children[0].id;
        console.log(childId);
        if (childId !== undefined) {
          this.countryLatestLevel[country] = ++level;
          this.getLatestLevel(country, childId, level);
        }
      }
    }, error => {
      console.log(error);
    });
    // if (Object.keys(this.countryLatestLevel).length !== 0){
    //   console.log(this.countryLatestLevel);
    // }
  }*/

  async showData() {
    let tmpPeriods = [];
    let periods: string;
    this.returnedPeriods = [];
    this.dataValues = [];
    this.columns = [];
    this.dataFields = [];
    this.loading = true;
    this.promises = [];
    this.dataExported = [];

    // if (Object.keys(this.countries).length !== 0) {
    //   // Object.keys(this.countries).forEach(key => {
    //   //   this.getLatestLevel(key, this.countries[key], 3);
    //   // });
    //   if (Object.keys(this.countryLatestLevel).length !== 0) {
    //     console.log(this.countryLatestLevel);
    //   }
    //   // this.getCountryOrgUnitLatestLevel();
    //   return;
    // }

    let splitPeriods = this.firstPeriod.split("W");
    tmpPeriods.push({ y: splitPeriods[0], w: splitPeriods[1] });
    for (let i = 0; i < 3; i++) {
      let week = tmpPeriods[0].w - 1;
      let year = tmpPeriods[0].y;
      if (week === 0) {
        week = 52;
        year -= 1;
      }
      tmpPeriods.unshift({ y: year, w: week });
    }

    // console.log('Executing queries ...');

    for (let i = 0; i < tmpPeriods.length; i++) {
      this.returnedPeriods.push(tmpPeriods[i].y + "W" + tmpPeriods[i].w);
    }
    periods = this.returnedPeriods.join(";");

    Object.keys(this.countries).forEach(key => {
      // if (!key.includes('Kenya') && !key.includes('Ghana'))
      this.promises.push(
        this.dhisService
          .getData(this.createUrl(key, periods))
          .pipe(catchError(error => of(error)))
      );
    });

    // console.log(this.promises.length);

    await forkJoin([...this.promises]).subscribe(
      result => {
        // console.log('Creating data values set ...');
        // console.log(result);
        // console.log(this.countryLatestLevel);
        console.log("loading data complete from promises !");

        result.forEach((data: any) => {
          if (data.rows === undefined) {
            return;
          }
          this.dataExported.push(data);
          let country: string = data.rows[0][2];
          // console.log(country);
          data.headers.forEach((header, index) => {
            let title = header.column;

            if (
              title ===
              "orgunitlevel" +
                (this.countryLatestLevel[country] -
                  (country === "Ghana" ? 2 : 1))
            ) {
              title = "parentorgunitname";
            }

            if (!this.notUsedHeader.includes(title)) {
              if (this.headers[title] === undefined)
                this.headers[title] = {
                  ghanaIdx: null,
                  zambiaIdx: null,
                  ugandaIdx: null
                };

              this.headers[title][country.toLowerCase() + "Idx"] = index;
              // if (country === 'Ghana') {
              //   this.headers[title].ghanaIdx = index;
              // } else if (country === 'Zambia') {
              //   this.headers[title].zambiaIdx = index;
              // } else if (country === "Uganda") {
              //   this.headers[title].ugandaIdx = index;
              // }
              this.headers[title].type = header.type.includes("Double")
                ? "number"
                : header.type.split(".")[2].toLowerCase();
            }
          });
        });

        if (Object.keys(this.headers).length !== 0) {
          this.headers = this.sortObjectByKey(this.headers);
          // console.log('Headers', this.headers);
          // console.log('Headers', Object.keys(this.headers));

          // console.log('DataFields', this.dataFields);
          // console.log('Columns ', this.columns);

          this.dataExported.forEach(data => {
            // console.log(data);
            let dRows = data.rows;
            let country: string = data.rows[0][2];

            dRows.forEach(r => {
              let value = {};
              Object.keys(this.headers).forEach((h: string) => {
                let ah =
                  this.headerAliases[h] === undefined
                    ? h.includes("HFR:")
                      ? h.split(":")[1]
                      : h
                    : this.headerAliases[h];

                if (
                  ![
                    "orgunitlevel4",
                    "orgunitlevel5",
                    "orgunitlevel6",
                    "orgunitlevel7",
                    "periodid"
                  ].includes(h)
                ) {
                  if (this.headers[ah] !== null) {
                    if (
                      this.dataFields.length === 0 ||
                      !this.checkExistingObject(this.dataFields, ah, "name")
                    ) {
                      this.dataFields.push({
                        name: ah,
                        type:
                          this.headers[h] === null
                            ? "string"
                            : this.headers[h].type
                      });
                    }
                    if (
                      this.columns.length === 0 ||
                      !this.checkExistingObject(this.columns, ah, "text")
                    ) {
                      this.columns.push({
                        text: ah,
                        dataField: ah,
                        width: 120,
                        autoCellHeight: true,
                        filterable: true
                      });
                    }
                  }

                  let rValue = null;

                  if (h === "tIC3uGX8SIqname") {
                    rValue = r[
                      this.headers[h][country.toLowerCase() + "Idx"]
                    ].split("-")[1];
                    //rValue = 'John Snow Inc (JSI)';

                    //   if (r.includes('Ghana'))
                    //     rValue = r[this.headers['tIC3uGX8SIqname'].ghanaIdx].split('-')[1];
                    // else if (r.includes('Zambia'))
                    //     rValue = r[this.headers['tIC3uGX8SIqname'].zambiaIdx].split('-')[1];
                    //   else if (r.includes('Uganda'))
                    //     rValue = r[this.headers['tIC3uGX8SIqname'].ugandaIdx].split('-')[1];
                  } else if (h === "organisationunitname") {
                    if (country === "Zambia") {
                      rValue = this.mappingZambia[
                        r[
                          this.headers["organisationunitid"][
                            country.toLowerCase() + "Idx"
                          ]
                        ]
                      ];
                    } else {
                      rValue =
                        r[this.headers[h][country.toLowerCase() + "Idx"]];
                    }
                  } else if (h === "periodstartdate") {
                    rValue = ExportComponent.getDateOfISOWeek(
                      r[
                        this.headers["periodid"][country.toLowerCase() + "Idx"]
                      ].split("W")[1],
                      r[
                        this.headers["periodid"][country.toLowerCase() + "Idx"]
                      ].split("W")[0]
                    );
                  } else {
                    rValue =
                      this.headers[h][country.toLowerCase() + "Idx"] === null
                        ? null
                        : r[this.headers[h][country.toLowerCase() + "Idx"]];
                    if (
                      country === "Zambia" &&
                      h === "organisationunitid" &&
                      rValue !== null
                    ) {
                      rValue = this.mappingZm[rValue];
                    }
                  }
                  // if (rValue === "0") console.log(rValue);
                  value[ah] =
                    h !== "organisationunitid" &&
                    h !== "periodid" &&
                    h !== "periodstartdate" &&
                    rValue !== null &&
                    rValue !== undefined &&
                    rValue !== "" &&
                    !isNaN(rValue)
                      ? parseInt(rValue)
                      : rValue;
                }
              });

              if (Object.keys(value).length !== 0) {
                this.dataValues.push(value);
              }
            });
          });

          if (Object.keys(this.dataValues).length !== 0) {
            // console.log(this.source);
            this.source.localData = this.dataValues;
            this.dataAdapter = new jqx.dataAdapter(this.source);
            //this.myDataTable.refresh();

            this.loading = false;

            // console.log(this.dataValues);
            // this.exportAsExcelFile(this.dataValues, 'HFR_' + returnedPeriods.join('-'));
            // this.agGrid.api.setRowData(this.dataValues);
            // this.agGrid.api.redrawRows();
          }
        }
      },
      error => {
        console.log(error);
        this.loading = false;
      }
    );
  }

  // excelExport(): void {
  //   this.myDataTable.exportData('xls');
  // };
  csvExport(): void {
    this.myDataTable.exportData("csv");
  }
  // pdfExport(): void {
  //   this.myDataTable.exportData('pdf');
  // };

  checkExistingObject(data, value, field) {
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][field] === value) {
        found = true;
        break;
      }
    }
    return found;
  }

  createUrl(country, period) {
    let countryLastLevel: string;
    let url: string;
    // if (country === 'Zambia') {
    //   countryLastLevel = 'LEVEL-6';
    // } else if (country === 'Ghana') {
    //   countryLastLevel = 'LEVEL-5';
    // } else if (country === 'Uganda') {
    //   countryLastLevel = 'LEVEL-7';
    // } else {
    //   countryLastLevel = 'LEVEL-4';
    // }
    countryLastLevel = "LEVEL-" + this.countryLatestLevel[country];
    let dimension =
      "dimension=dx:" +
      this.dataElements.join(";") +
      "&dimension=co&dimension=ou:" +
      countryLastLevel +
      ";" +
      this.countries[country] +
      "&dimension=" +
      this.projectCategory.id +
      ":" +
      this.projectComboOptions.join(";") +
      "&dimension=pe:" +
      period;
    let filter =
      "&filter=" +
      this.agencyCategory.id +
      ":" +
      this.agencyComboOptions.join(";") +
      "&displayProperty=NAME&showHierarchy=true&hideEmptyColumns=true&" +
      "hideEmptyRows=true&ignoreLimit=true&tableLayout=true&columns=dx;co&rows=ou;pe;" +
      this.projectCategory.id;
    url = dimension + filter;
    // console.log(url);
    return url;
  }

  exportAsExcelFile(): void {
    let lIdx = this.returnedPeriods.length - 1;
    let firstDate = ExportComponent.getDateOfISOWeek(
      this.returnedPeriods[0].split("W")[1],
      this.returnedPeriods[0].split("W")[0]
    );
    let lastDate = ExportComponent.getDateOfISOWeek(
      this.returnedPeriods[lIdx].split("W")[1],
      this.returnedPeriods[lIdx].split("W")[0]
    );
    let excelFileName: string =
      "HFR_Export_data_from_" +
      firstDate.toString() +
      "_to_" +
      lastDate.toString();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataValues);
    const workbook: XLSX.WorkBook = {
      Sheets: { "HFR Exports": worksheet },
      SheetNames: ["HFR Exports"]
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // console.log(range);

    let i = 0;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      if (C === 0) console.log("Styling header");
      i = 0;
      while (i < 1) {
        //Set header styles
        const header1 = XLSX.utils.encode_cell({ c: C, r: i });
        worksheet[header1].s = ExcelConfig.headerStyle;
        i++;
      }
    }
    // set general cell style
    for (let R = range.s.r + i; R <= range.e.r; ++R) {
      if (R === 1) console.log("Styling general");
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const all = XLSX.utils.encode_cell({ c: C, r: R });
        if (worksheet[all]) {
          worksheet[all].s = ExcelConfig.generalStyle;
        }
      }
    }

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: ExcelConfig.EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + "_" + new Date().getTime() + ExcelConfig.EXCEL_EXTENSION
    );
  }

  static getDateOfISOWeek(w: number, y: number) {
    let simple = new Date(y, 0, 1 + (w - 1) * 7);
    let dow = simple.getDay();
    let ISOWeekStart = simple;
    if (dow <= 4) ISOWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOWeekStart.setDate(simple.getDate() + 8 - simple.getDay());

    return ISOWeekStart.toISOString().substring(0, 10);
  }

  async getMappingZm() {
    this.loadingMapping = true;
    await this.dhisService.getMappingOrgUnitZambia().subscribe(
      data => {
        // console.log(data);
        for (let i = 0; i < data.length; i++) {
          this.mappingZm[data[i].dhis2Id] = data[i].datimId;
          if (data[i].datimName !== undefined) {
            this.mappingZambia[data[i].dhis2Id] = data[i].datimName;
          }
        }

        if (Object.keys(this.mappingZm).length !== 0)
          this.loadingMapping = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  sortObjectByKey(obj: { [x: string]: any; hasOwnProperty?: any }) {
    let keys = [];
    let returnedKeys = [];
    let sorted_obj = {};
    let preOrderedKeys = [
      "parentorgunitname",
      "orgunitlevel3",
      "tIC3uGX8SIqname",
      "tIC3uGX8SIqcode",
      "organisationunitid",
      "organisationunitname",
      "periodstartdate"
    ];

    const realKeys = [
      "periodstartdate",
      "organisationunitname",
      "organisationunitid",
      "tIC3uGX8SIqcode",
      "tIC3uGX8SIqname",
      "orgunitlevel3",
      "periodid",
      "parentorgunitname",
      "HFR: HTS_TST <15, Female",
      "HFR: HTS_TST <15, Male",
      "HFR: HTS_TST 15+, Female",
      "HFR: HTS_TST 15+, Male",
      "HFR: HTS_TST_POS <15, Female",
      "HFR: HTS_TST_POS <15, Male",
      "HFR: HTS_TST_POS 15+, Female",
      "HFR: HTS_TST_POS 15+, Male",
      "HFR: TX_NEW <15, Female",
      "HFR: TX_NEW <15, Male",
      "HFR: TX_NEW 15+, Female",
      "HFR: TX_NEW 15+, Male",
      "HFR: VMMC_CIRC <15, Male",
      "HFR: VMMC_CIRC 15+, Male",
      "HFR: PrEP_NEW <15, Female",
      "HFR: PrEP_NEW <15, Male",
      "HFR: PrEP_NEW 15+, Female",
      "HFR: PrEP_NEW 15+, Male",
      "HFR: TX_CURR <15, Female",
      "HFR: TX_CURR <15, Male",
      "HFR: TX_CURR 15+, Female",
      "HFR: TX_CURR 15+, Male",
      "HFR: TX_MMD <15, Female, < 3 months",
      "HFR: TX_MMD <15, Male, < 3 months",
      "HFR: TX_MMD 15+, Female, < 3 months",
      "HFR: TX_MMD 15+, Male, < 3 months",
      "HFR: TX_MMD <15, Female, 3-5 months",
      "HFR: TX_MMD <15, Male, 3-5 months",
      "HFR: TX_MMD 15+, Female, 3-5 months",
      "HFR: TX_MMD 15+, Male, 3-5 months",
      "HFR: TX_MMD <15, Female, 6+ months",
      "HFR: TX_MMD <15, Male, 6+ months",
      "HFR: TX_MMD 15+, Female, 6+ months",
      "HFR: TX_MMD 15+, Male, 6+ months",
      "HFR: TX_MMD_FY19 1 month",
      "HFR: TX_MMD_FY19 2 month",
      "HFR: TX_MMD_FY19 3 month",
      "HFR: TX_MMD_FY19 4 month",
      "HFR: TX_MMD_FY19 5 month",
      "HFR: TX_MMD_FY19 6 month"
    ];

    for (let key in obj) {
      if (obj.hasOwnProperty(key) && !preOrderedKeys.includes(key)) {
        keys.push(key);
      }
    }

    // console.log("keys : ", keys);
    this.dataElementShortNames.forEach(name => {
      let tmpKeys = [];
      keys.forEach(key => {
        if (!returnedKeys.includes(key)) {
          if (key.includes(name)) {
            // console.log('Name', name);
            // console.log('Key', key);
            if (key.includes("<")) {
              tmpKeys.push(key.replace("<", "0_0"));
            } else {
              tmpKeys.push(key);
            }
          }
        }
      });
      if (tmpKeys.length !== 0) {
        tmpKeys.sort();

        let tmpReplace = [];

        tmpKeys.forEach(d => {
          if (d.includes("0")) {
            tmpReplace.push(d.replace("0_0", "<"));
          } else {
            tmpReplace.push(d);
          }
        });
        // console.log(tmpKeys);
        returnedKeys = returnedKeys.concat(tmpReplace);
      }
    });

    keys.forEach(key => {
      if (!returnedKeys.includes(key)) {
        returnedKeys.unshift(key);
      }
    });

    // console.log('Returned Keys', returnedKeys);
    // console.log('Keys', keys);

    // sort keys
    //keys.sort();

    preOrderedKeys.forEach(key => {
      returnedKeys.unshift(key);
    });

    // create new array based on Sorted Keys
    // console.log(obj);
    realKeys.forEach(key => {
      if (obj[key] !== undefined) sorted_obj[key] = obj[key];
    });

    // console.log(realKeys);
    return sorted_obj;
  }

  // saveExcelFileFromService() {
  //   let fileName = 'HFRExportWeeks';
  //   this.es.exportAsExcelFile(this.dataValues, fileName);
  // }
}
