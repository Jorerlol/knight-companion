import { Component, Input } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalDBService } from '../../journal/db/journal-db.service';
import { JournalEvents, JournalEvent, MissionCompleted, MissionAccepted, MissionAbandoned, MissionFailed, LoadGame, NewCommander } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { OriginatedMission } from './originatedMission';

@Component({
    templateUrl: 'missions.component.html',
    styleUrls: ['missions.component.scss'],
    selector: 'app-missions'
})
export class MissionsComponent {

    missionsCompleted: OriginatedMission[] = [];
    factionMissionsCompleted: OriginatedMission[] = [];
    @Input() trackingFaction: string;
    journalSubscription: Subscription;
    cmdrName: string;

    constructor(
        private journalService: JournalService,
        private journalDB: JournalDBService
    ) { }

    ngOnInit() {
        this.watchDir();
    }

    ngOnChanges() {
        this.factionMissionsCompleted = this.filterMissions(this.missionsCompleted);
    }

    async watchDir() {
        this.journalSubscription = this.journalService.logStream
            .subscribe(async (data: JournalEvent) => {
                switch (data.event) {
                    case JournalEvents.missionCompleted: {
                        let completedMission = Object.assign(new MissionCompleted(), data);
                        let originalMission: MissionAccepted =  await this.journalDB.getEntry(JournalEvents.missionAccepted, completedMission.MissionID);
                            
                        if (!originalMission) { return }
                        let originatedMission: OriginatedMission = Object.assign({ originator: originalMission.Faction }, completedMission)
                        this.missionsCompleted.push(originatedMission);
                            
                        break;
                    }
                }

            });
    }

    filterMissions(allMissions: OriginatedMission[]): OriginatedMission[] {
        return allMissions.filter((mission: OriginatedMission) => {
            return mission.originator === this.trackingFaction;
        })
    }
}