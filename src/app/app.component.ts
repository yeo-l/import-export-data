import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd, ActivatedRouteSnapshot} from "@angular/router";
import {filter, map} from 'rxjs/operators';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'datim-import-export';
  subs: Array<Subscription> = [];

  constructor( private activatedRoute: ActivatedRoute,
               private router: Router){}

  ngOnInit() {
    this.subs[0] = this.router.events.pipe(filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute.snapshot),
      map( route => {
        return route.firstChild;
      })).subscribe((route: ActivatedRouteSnapshot) => {
      this.title = route.data.title;
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

}
