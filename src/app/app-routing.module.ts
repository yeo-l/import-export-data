import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import { ImportComponent } from "./import/import.component";
import { ExportComponent } from "./export/export.component";
import { DataVisualizationComponent } from "./data-visualization/data-visualization.component";

const routes: Routes = [
  {
    path: '',
    component: ImportComponent,
    data: {
      title: 'Data Import'
    }
  },
  {
    path: 'data-import',
    component: ImportComponent,
    data: {
      title: 'Data Import'
    }
  },
  {
    path: 'data-export',
    component: ExportComponent,
    data: {
      title: 'Data Export'
    }
  },
  {
    path: 'data-analysis',
    component: DataVisualizationComponent,
    data: {
      title: 'Data Visualization'
    }
  },
  {
    path: '**',
    redirectTo: 'ImportComponent' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
