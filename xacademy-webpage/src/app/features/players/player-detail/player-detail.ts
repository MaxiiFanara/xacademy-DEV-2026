import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../../core/services/player';
import { SkillService } from '../../../core/services/skill';
import { PlayerDetail as PlayerDetailModel } from '../../../core/models/player.model';
import { Skill } from '../../../core/models/skill.model';

// Componentes propios
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { PlayerCardHeader } from '../player-card-header/player-card-header';
import { RadarChart } from '../../../shared/components/radar-chart/radar-chart';
import { SkillTimeline } from '../skill-timeline/skill-timeline';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

// PrimeNG
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private skillService = inject(SkillService);

  player = signal<PlayerDetailModel | null>(null);
  skills = signal<Skill[]>([]);
  selectedSkill = signal<Skill | null>(null);
  showTimeline = signal(false);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlayer(id);
    this.loadSkills();
  }

  loadPlayer(id: number) {
    this.playerService.getPlayerById(id).subscribe({
      next: (player) => {
        this.player.set(player);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSkills() {
    this.skillService.getSkills().subscribe({
      next: (skills) => this.skills.set(skills)
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