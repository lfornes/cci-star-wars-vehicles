import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, SortDirection} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {merge, Observable, of as observableOf, Subject} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap} from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'table-overview-example',
  styleUrls: ['table-overview-example.css'],
  templateUrl: 'table-overview-example.html',
})
export class TableOverviewExample implements AfterViewInit {
  displayedColumns: string[] = ['name', 'cost_in_credits', 'length'];
  httpDataSource: StarWarsHttpDatabase | null;
  data: Vehicle[] = [];
  public inputValue: string;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
filter: string;

  constructor(private _httpClient: HttpClient) {  }

  ngAfterViewInit() {
    this.httpDataSource = new StarWarsHttpDatabase(this._httpClient); 
    
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          if(this.inputValue==undefined) {
            this.inputValue='';
          }
        
          return this.httpDataSource!.getStarWarsVehicles(this.paginator.pageIndex, this.inputValue)
            .pipe(catchError(() => observableOf(null)));
        }),debounceTime(500),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }
        
          this.resultsLength = data.count;
          this.data=data.results;

          return data.results;
        })
      ).subscribe(data => { 
        this.data;
      });
    }

  applyFilter(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;

    this.ngAfterViewInit() 
  }
}

export interface StarWarsApi {
  results: Vehicle[];
  count: number;
}

export interface Vehicle {
  name: string;
  cost_in_credits: string;
  length: string;
}

//StarWarsDB
export class StarWarsHttpDatabase {
  constructor(private _httpClient: HttpClient) {}

  getStarWarsVehicles(page: number, filter: string): Observable<StarWarsApi> {
    const href = 'https://swapi.dev/api/vehicles/';

      const requestUrl =
      `${href}?format=json&sort&page=${page+1}&search=${filter};`
    
    console.log(filter)
;    return this._httpClient.get<StarWarsApi>(requestUrl);
  }
}


/**  Copyright 2021 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */