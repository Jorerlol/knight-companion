import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { Interdicted } from 'cmdr-journal';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable()
export class InterdictionService {
    constructor(
        private http: Http,
        private logger: LoggerService
        ) { }

    interdictedAlert(interdicted: Interdicted,cmdrName: string, system: string):Observable<boolean> {
            return this.http.post(`https://www.knightsofkarma.com/api/interdicted/${cmdrName}`,{interdicted, system})
                .catch((err: any) =>{
                    this.logger.error(err);
                    return Observable.throw(err);
                })
        }
}