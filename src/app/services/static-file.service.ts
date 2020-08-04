import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export class Roadmap {
    milestones: Milestone[];
    tasks: Task[];
}

export class Milestone {
    title: string;
    date: string;
}

export class Task {
    title: string;
    category: string;
    start_date: string;
    end_date: string;
    description: string;
    link: string;
    swimlane: string;
}

export class MenuItem {
    routerLink: string;
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class StaticFileService {

    constructor(private http: HttpClient) {
    }

    getFile(filename: string): Observable<Roadmap> {
        return this.http.get<Roadmap>(`./assets/descriptors/${filename}`);
    }

    getMenuFile(): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(`./assets/descriptors/menu.json`);
    }
}
