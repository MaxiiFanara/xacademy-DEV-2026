import { Component, input, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-radar-chart',
  imports: [],
  templateUrl: './radar-chart.html',
  styleUrl: './radar-chart.scss'
})
export class RadarChart implements OnChanges, AfterViewInit {

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

  labels = input.required<string[]>();
  data = input.required<number[]>();

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.buildChart();
  }

  ngOnChanges() {
    if (this.chart) this.updateChart();
  }

  buildChart() {
    if (!this.radarCanvas) return;

    this.chart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: this.labels(),
        datasets: [{
          label: 'Habilidades',
          data: this.data(),
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
        }]
      },
      options: {
        scales: {
          r: { min: 0, max: 100, ticks: { stepSize: 20 } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  updateChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.labels();
    this.chart.data.datasets[0].data = this.data();
    this.chart.update();
  }
}