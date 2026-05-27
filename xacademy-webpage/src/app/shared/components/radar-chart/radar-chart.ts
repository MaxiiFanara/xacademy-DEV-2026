import { Component, input, OnChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PlayerSkill } from '../../../core/models/skill.model';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Registrar los módulos necesarios de Chart.js
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-radar-chart',
  imports: [],
  templateUrl: './radar-chart.html',
  styleUrl: './radar-chart.scss'
})
export class RadarChart implements OnChanges, AfterViewInit {

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

  skills = input.required<PlayerSkill[]>();
  skillNames = input<string[]>([]);

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.buildChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  buildChart() {
    if (!this.radarCanvas) return;

    const labels = this.skillNames().length
      ? this.skillNames()
      : this.skills().map(s => `Skill ${s.idSkill}`);

    const values = this.skills().map(s => s.valor);

    this.chart = new Chart(this.radarCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Habilidades',
          data: values,
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
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  updateChart() {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = this.skills().map(s => s.valor);
    this.chart.update();
  }
}