import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../../core/services/player';
import { SkillService } from '../../../core/services/skill';
import { PlayerDetailData } from '../../../core/models/player.model';
import { Skill } from '../../../core/models/skill.model';

import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { PlayerCardHeader } from '../player-card-header/player-card-header';
import { RadarChart } from '../../../shared/components/radar-chart/radar-chart';
import { SkillTimeline } from '../skill-timeline/skill-timeline';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-player-detail',
  imports: [
    Navbar,
    Footer,
    PlayerCardHeader,
    RadarChart,
    SkillTimeline,
    LoadingSpinner,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './player-detail.html',
  styleUrl: './player-detail.scss'
})
export class PlayerDetail implements OnInit {

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private skillService = inject(SkillService);

  player = signal<PlayerDetailData | null>(null);
  selectedSkill = signal<Skill | null>(null);
  showTimeline = signal(false);
  loading = signal(true);
  availableSkills = signal<Skill[]>([]);
  showAnalysis = signal(false);
  analysis = signal<string | null>(null);
  loadingAnalysis = signal(false);

ngOnInit() {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  this.loadPlayer(id);
  this.loadSkills();
}

toggleAnalysis() {
  if (this.analysis()) {
    this.showAnalysis.set(!this.showAnalysis());
    return;
  }

  this.loadingAnalysis.set(true);
  this.showAnalysis.set(true);

  const id = Number(this.route.snapshot.paramMap.get('id'));
  this.playerService.getPlayerAnalysis(id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
    next: (res) => {
      this.analysis.set(res.analisis);
      this.loadingAnalysis.set(false);
    },
    error: () => {
      this.analysis.set('No se pudo obtener el análisis.');
      this.loadingAnalysis.set(false);
    }
  });
}

  loadPlayer(id: number) {
    this.playerService.getPlayerById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (player) => {
        this.player.set(player);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSkills() {
    this.skillService.getSkills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
     next: (skills) => this.availableSkills.set(skills)
    });
  }

  onSkillSelect(skill: Skill) {
    this.selectedSkill.set(skill);
  }

  toggleTimeline() {
    this.showTimeline.set(!this.showTimeline());
  }

  goBack() {
    this.router.navigate(['/players']);
  }
}
