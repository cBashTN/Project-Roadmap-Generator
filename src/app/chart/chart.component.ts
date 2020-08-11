import { Component, OnInit, ViewChild/*, Input */ } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartReadyEvent, ChartSelectEvent } from 'ng2-google-charts';
import { Task, Milestone, StaticFileService } from '../services/static-file.service';
//import { MenuToggleService } from '../services/menu-toggle.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  tasks: Task[];
  milestones: Milestone[];
  filteredId = [];
  swimlanes = new Set();
  @ViewChild('cchart') cchart;

  //  @Input() isZoomOutToggleChecked: boolean;

  chartData = {
    chartType: 'Timeline',

    dataTable: [],

    milestonesDateTable: [],
    options: {
      height: 700,
      timeline: {
        groupByRowLabel: true,
        colorByRowLabel: false,
        rowLabelStyle: { fontName: 'Roboto' },
        barLabelStyle: { fontName: 'Roboto' }
      }
    }
  };

  constructor(private route: ActivatedRoute,
    private staticFileService: StaticFileService
  ) {

    this.route.params.subscribe(params => {

      const isProjectsPointOfView = params['pointOfView'] === 'projects';
      this.chartData.dataTable = [['Label', 'Name', 'From', 'To']];
      this.chartData.milestonesDateTable = []; //[['Title', 'Date']];


      // Use this if you want to use multiple (different) roadmaps. See Empire/Rebels example
      // this.staticFileService.getFile(`${pointOfView}.json`).subscribe(roadmap => {

      this.staticFileService.getRoadmapFile().subscribe(roadmap => {
        this.tasks = roadmap.tasks;
        this.milestones = roadmap.milestones;
        const DONT_DISPLAY_FLAG = '#NOT_ON_ROADMAP';
        const regex = RegExp(DONT_DISPLAY_FLAG);
        this.filteredId = [0];
        this.swimlanes = new Set();
        const numberOfMonth = 24;
        let maxShowDate = new Date().getTime() + numberOfMonth * 30 * 24 * 60 * 60 * 1000;
        //     if (this.menu.isZoomOutToggleChecked) {
        //       maxShowDate = new Date().getTime() + Number.MAX_SAFE_INTEGER;
        //     }
        //console.log("this.isZoomOutToggleChecked :");
        //            console.log(this.menuToggleService.emitData());
        // console.log(this.menuComponent.isZoomOutToggleChecked.toString());

        this.tasks
          .filter(task => !regex.test(task.description))
          .filter(task => task.start_date !== null)
          .filter(task => new Date(task.start_date).getTime() < maxShowDate)
          .filter(task => task.end_date !== null)
          .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
          .map(task => {
            if (!task.category) {
              let cat = task.swimlane;
              if (!isProjectsPointOfView) {
                cat = task.resource;
              } else {
                task.title = task.resource;
              }
              task.category = cat ? cat : task.title;
            }
            this.swimlanes.add(task.category);
            this.chartData.dataTable.push([task.category, task.title, new Date(task.start_date), new Date(task.end_date)]);
            this.filteredId.push(task.link);
          });

        this.milestones
          .sort((milestone) => new Date(milestone.date).getTime())
          .map(milestone => {
            this.chartData.milestonesDateTable.push(
              [milestone.title, milestone.date]);
          });
        this.chartData = Object.create(this.chartData);
      });
    });

  }

  ngOnInit() {
    console.log('Chart component - onInit');
  } // ngOnInit - end


  public clicked(event: ChartSelectEvent) {
    const url = this.filteredId[event.row + 1];
    window.open(url, '_blank');
  }

  public ready(event: ChartReadyEvent) {
    const container = document.getElementById('timeline');
    const googleChartWrapper = this.cchart.wrapper;
    const dateRangeStart = googleChartWrapper.getDataTable().getColumnRange(2);
    const dateRangeEnd = googleChartWrapper.getDataTable().getColumnRange(3);
    // let options = {height: 41 * (this.chartData.dataTable.length - 1)};
    const options = { height: 41 * this.swimlanes.size - 1 };


    function addMarker(title, markerDate, i) {
      let baseline;
      let baselineBounds;
      let chartElements;
      let markerLabel;
      let markerLine;
      let markerSpan;
      let svg;
      let timeline;
      let timelineUnit;
      let timelineWidth;
      let timespan;
      let height;

      baseline = null;
      timeline = null;
      svg = null;
      markerLabel = null;
      chartElements = container.getElementsByTagName('svg');
      if (chartElements.length > 0) {
        svg = chartElements[chartElements.length - 1];
        height = svg.getElementsByTagName('g')[0].getBBox().height;
      }
      chartElements = container.getElementsByTagName('rect');
      if (chartElements.length > 0) {
        timeline = chartElements[0];
      }
      chartElements = container.getElementsByTagName('path');
      if (chartElements.length > 0) {
        baseline = chartElements[0];
      }
      chartElements = container.getElementsByTagName('text');
      if (chartElements.length > 0) {
        markerLabel = chartElements[0].cloneNode(true);
      }
      if ((svg === null) || (timeline === null) || (baseline === null) || (markerLabel === null) ||
        (markerDate.getTime() < dateRangeStart.min.getTime()) ||
        (markerDate.getTime() > dateRangeEnd.max.getTime())) {
        return;
      }

      // calculate placement
      timelineWidth = parseFloat(timeline.getAttribute('width'));
      baselineBounds = baseline.getBBox();
      timespan = dateRangeEnd.max.getTime() - dateRangeStart.min.getTime();
      timelineUnit = (timelineWidth - baselineBounds.x) / timespan;
      markerSpan = markerDate.getTime() - dateRangeStart.min.getTime();
      const xPos = (baselineBounds.x + (timelineUnit * markerSpan));

      // add line
      markerLine = timeline.cloneNode(true);
      markerLine.setAttribute('y', 0);
      markerLine.setAttribute('x', xPos);
      markerLine.setAttribute('height', height + 50 + i);
      markerLine.setAttribute('width', 1);
      markerLine.setAttribute('stroke', 'none');
      markerLine.setAttribute('stroke-width', '0');
      markerLine.setAttribute('fill', '#e91e63');
      svg.appendChild(markerLine);

      // Add label to line
      markerLabel.textContent = title;
      markerLabel.setAttribute('x', xPos - 5);
      markerLabel.setAttribute('y', height + 50 + i);
      markerLabel.setAttribute('stroke-width', '1');
      markerLabel.setAttribute('stroke', '#e91e63');
      svg.appendChild(markerLabel);
    }

    //console.log(this.chartData.milestonesDateTable);
    let i = 0;
    this.chartData.milestonesDateTable.forEach(element => {
      addMarker(element[0], new Date(element[1]), i);
      i += 20;
    });
  }

  onResize(event) {
    this.chartData = Object.create(this.chartData);
  }

}
