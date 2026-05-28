import { Component, input, output, signal, inject } from '@angular/core';
import { Skill, SkillEvolution } from '../../../core/models/skill.model';
import { SkillService } from '../../../core/services/skill';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
// PrimeNG
import { TimelineModule } from 'primeng/timeline';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill-timeline',
  imports: [TimelineModule, SelectModule, CardModule, ButtonModule, FormsModule, LoadingSpinner],
  templateUrl: './skill-timeline.html',
  styleUrl: './skill-timeline.scss'
})
export class SkillTimeline {

  // ID del jugador (tabla Jugador, no VersionJugador)
  idJugador = input.required<number>();
  skills = input.required<Skill[]>();

  private skillService = inject(SkillService);

  selectedSkill = signal<Skill | null>(null);
  evolution = signal<SkillEvolution[]>([]);
  loading = signal(false);

  onSkillChange(skill: Skill) {
    if (!skill) return;
    this.selectedSkill.set(skill);
    this.loading.set(true);

    this.skillService.getSkillEvolution(this.idJugador(), skill.Id).subscribe({
      next: (data) => {
        this.evolution.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}