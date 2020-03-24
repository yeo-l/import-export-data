import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { SERVER_API_URL } from "./constants";
import { Observable } from "rxjs";
import { DataValueSet } from "../models/data-value-set";

@Injectable({
  providedIn: "root"
})
export class DhisService {
  constructor(private http: HttpClient) {}

  getMetaDataFromDataSet(dataSetUid: string): Observable<any> {
    let urlParams =
      "?fields=id,name,categoryCombo[categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]]," +
      "dataSetElements[dataElement[id,name,code,categoryCombo[id,name,categoryOptionCombos[id,name]]]";
    return this.http.get(
      SERVER_API_URL + "/dataSets/" + dataSetUid + urlParams
    );
  }

  getOrgUnit(id: string) {
    return this.http.get<any>(
      SERVER_API_URL + "/organisationUnits/" + id + ".json?fields=children[id]"
    );
  }

  /**
   *
   * @param projectName
   */
  getOrgUnitByProject(projectName: string) {
    return this.http.get<any>(
      SERVER_API_URL +
        "/organisationUnitGroups.json?paging=false&fields=name,organisationUnits[id,name,created]&filter=name:like:" +
        projectName
    );
  }

  /**
   *
   * @param period
   * @param orgUnit
   * @param dataSet
   */
  getDataValueSet(period: string, orgUnit: string, dataSet: string) {
    return this.http.get<any>(
      SERVER_API_URL +
        "dataValueSets.json?dataSet=" +
        dataSet +
        "&period=" +
        period +
        "&orgUnit=" +
        orgUnit +
        ""
    );
  }

  getAllDataSet() {
    let urlParams = "?fields=id,name&paging=false";
    return this.http.get<any>(SERVER_API_URL + "/dataSets.json" + urlParams);
  }

  getDataSetOrgUnit(id: string) {
    return this.http.get<any>(
      SERVER_API_URL +
        "/dataSets/" +
        id +
        ".json?fields=organisationUnits[id,level,ancestors[id]]"
    );
  }

  importDataValueSet(dataValueSet: DataValueSet) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };
    // const dataString = JSON.stringify(dataValueSet);
    // console.log(dataString);
    return this.http.post(
      SERVER_API_URL + "/dataValueSets",
      dataValueSet,
      httpOptions
    );
  }

  getMappingOrgUnitZambia() {
    return this.http.get<any>(SERVER_API_URL + "/dataStore/frs/zm");
  }

  completeRegistration(data: { completeDataSetRegistrations: any[] }) {
    return this.http.post(
      SERVER_API_URL + "/completeDataSetRegistrations?skipExistingCheck=true",
      data
    );
  }

  getAllCountries() {
    return this.http.get(
      SERVER_API_URL +
        "/organisationUnits.json?paging=false&fields=id,name&filter=level:eq:3"
    );
  }

  getData(url: string) {
    return this.http.get(SERVER_API_URL + "/30/analytics.json?" + url);
  }

  // getOrgUnitByCountryAndProject(countryId, projectId) {
  //   return this.http.get(SERVER_API_URL + '/analytics.json?' + url);
  // }
}
