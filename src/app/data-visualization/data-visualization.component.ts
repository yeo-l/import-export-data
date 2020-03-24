import { Component, OnInit } from '@angular/core';
import {DhisService} from "../service/dhis.service";

@Component({
  selector: 'app-data-visualization',
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.sass']
})
export class DataVisualizationComponent implements OnInit {

  completenessTable = [];
  orgUnitsToGetCompleteness = [{}];
  periods = [];

  constructor(private dhisService: DhisService) { }

  ngOnInit() {
    this.periods = ['2019W52', '2020W1', '2020W2', '2020W3'];
    const projects = ['SAFE', 'DISCOVERY', 'RHITES', 'SCC'];

    projects.forEach(project => {
      this.dhisService.getOrgUnitByProject(project).subscribe(data => {
        let dataObtained = {project : data.orgUnits};
        this.orgUnitsToGetCompleteness.push(dataObtained);

        this.periods.forEach(period => {
          this.dhisService.getDataValueSet(period, '', '')
        })
      })
    })

  }

}
