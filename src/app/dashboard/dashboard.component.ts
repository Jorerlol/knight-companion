import { Component } from '@angular/core';
const fs = require('fs');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Observable } from 'rxjs/observable';
import { map, merge, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { FactionService } from '../core/services/faction.service';
import { Faction } from 'cmdr-journal';
import { LoggerService } from '../core/services/logger.service';
import { FormControl } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { AppErrorService } from '../core/services/app-error.service';
import { MatTabChangeEvent } from '@angular/material';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard'
})
export class DashboardComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction = new FormControl;
    currentSystem: Observable<string>;
    cmdrName: string;
    username: string;
    knownFactions: Faction[];
    filteredKnownFactions: Observable<Faction[]>;
    selectedDashboardTab: number;


    constructor(
        private journalService: JournalService,
        private factionService: FactionService,
        private logger: LoggerService,
        private userService: UserService,
        private appErrorService: AppErrorService
    ) {
        this.currentSystem = journalService.currentSystem;
    }

    ngOnInit() {
        try {
            this.selectedDashboardTab = Number.parseInt(localStorage.getItem("selectedDashboardTab"));
        } catch (err) {
            this.logger.error(err);
            this.selectedDashboardTab = 0;
        }

        //username/cmdrname check
        this.journalService.cmdrName.subscribe(cmdrName => {
            if (cmdrName) {
                this.cmdrName = cmdrName;
                this.checkNameMismatch();
            } else {
                this.appErrorService.removeError("cmdrNameMismatch");
            }
        });

        this.userService.user.subscribe(user => {
            if (user) {
                this.username = user.username;
                this.checkNameMismatch();
            } else {
                this.appErrorService.removeError("cmdrNameMismatch");
            }
        })

        //tracking faction
        let storedTrackingFaction = localStorage.getItem("trackingFaction");
        this.trackingFaction.setValue(storedTrackingFaction || "");

        this.factionService.getAllFactions()
            .then(factions => {
                this.knownFactions = factions
            })
            .catch(err => this.logger.error({
                originalError: err,
                message: "Error fetching all known factions in dashboard component"
            }));

        this.trackingFaction.valueChanges.pipe(
            tap(inputValue=>{
                localStorage.setItem("trackingFaction",inputValue);
            }),
            map(inputValue => {
                let outputArray = this.knownFactions.filter(faction => {
                    let escapedInputValue = inputValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    let re = new RegExp(`${escapedInputValue}`, "i");
                    return re.test(faction.Name);
                });
                return of(outputArray);
            })
        ).subscribe(filteredKnownFactions => {
            this.filteredKnownFactions = filteredKnownFactions;
            
        });
    }

    checkNameMismatch() {
        if (this.cmdrName !== this.username) {
            this.appErrorService.addError("cmdrNameMismatch", { message: `⚠️You are logged in as ${this.username} but appear to be playing as ${this.cmdrName}` });
        } else {
            this.appErrorService.removeError("cmdrNameMismatch");
        }
    }

    doTabChange(e: MatTabChangeEvent) {
        localStorage.setItem("selectedDashboardTab",e.index.toString());
    }
}