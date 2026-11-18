
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';
import { CricketGroup } from '../models/cricket-group/cricket-group.model';
import { CricketGroupCreateRequest } from '../models/cricket-group/cricket-group-create-request.model';

@Injectable({
  providedIn: 'root'
})
export class CricketGroupService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/cricket-groups`;

  getAllCricketGroups(): Observable<CricketGroup[]> {
    return this.http.get<CricketGroup[]>(this.apiUrl);
  }

  getCricketGroupById(id: string): Observable<CricketGroup> {
    return this.http.get<CricketGroup>(`${this.apiUrl}/${id}`);
  }

  createCricketGroup(request: CricketGroupCreateRequest): Observable<CricketGroup> {
    return this.http.post<CricketGroup>(this.apiUrl, request);
  }

}
