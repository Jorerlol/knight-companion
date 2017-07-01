import { Component } from '@angular/core';
import { JournalService } from '../shared/services/journal.service';
const { dialog } = require('electron').remote;
const fs = require('fs');
//const chokidar = require('chokidar');
const tailingStream = require('tailing-stream');


@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard',
    providers: [JournalService]
})
export class DashboardComponent {

    dir: string;
    currentLogFile: string;

    constructor(
        private journalService: JournalService
    ){}

    ngOnInit() {
        this.getDir();
        if (this.dir) { this.watchDir(this.dir) }
    }

    getDir() {
        this.dir = localStorage.dir || this.selectDirDialog();
    }

    selectDirDialog() {
        let selectedDir = dialog.showOpenDialog({properties: ['openDirectory','showHiddenFiles']});
        if (selectedDir) { localStorage.dir = selectedDir } ;
        return selectedDir;
    }

    watchDir(dir: string) {
        this.journalService.monitor(this.dir).subscribe(data=>{
            console.log(data);
        });
    }
}