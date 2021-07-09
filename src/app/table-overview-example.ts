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
  public filterSubject = new Subject<string>();
  inputValue:String;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
filter: string;

  constructor(private _httpClient: HttpClient) {  }

  ngAfterViewInit() {
    this.httpDataSource = new StarWarsHttpDatabase(this._httpClient); 

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    //filtering method to be used with commented out filterSubject in HTML
    let filter$ = this.filterSubject.pipe(
      debounceTime(150), 
      distinctUntilChanged(),
      tap((value: string) => {
        this.paginator.pageIndex = 0; // we should reset page index
        this.filter = value;
      }))

      //remove filter$ from merge
    merge(this.sort.sortChange, this.paginator.page, filter$)
      .pipe(
        startWith({}),
        debounceTime(500),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.httpDataSource!.getStarWarsVehicles(this.sort.active, this.sort.direction,this.paginator.pageIndex)
            .pipe(catchError(() => observableOf(null)));
        }),
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
      
  
      console.log('len', this.resultsLength);
  }

  applyFilter(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
  
    //add logic here for search if this is the approach we want to take
        // if nothing return to first page
          // if (this.dataSource.paginator) {
          //   this.dataSource.paginator.firstPage();
          // }
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

  getStarWarsVehicles(sort: string, order: SortDirection, page: number): Observable<StarWarsApi> {
    const href = 'https://swapi.dev/api/vehicles/';
    const requestUrl =
        `${href}?format=json&sort=${sort}&order=${order}&page=${page+1}`;
       console.log(this._httpClient.get<StarWarsApi>(requestUrl))
;    return this._httpClient.get<StarWarsApi>(requestUrl);
  }
}


/**  Copyright 2021 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */