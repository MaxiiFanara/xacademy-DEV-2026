import { Component, inject, signal, OnInit , input} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../../core/services/player';
import { SkillService } from '../../../core/services/skill';
import { Skill } from '../../../core/models/skill.model';
import { Version } from '../../../core/models/version.model';
import { AuthService } from '../../../core/services/auth';

// Componentes propios
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-player-form',
  imports: [
    ReactiveFormsModule,
    Navbar,
    Footer,
    LoadingSpinner,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    MessageModule,
    DatePickerModule
  ],
  templateUrl: './player-form.html',
  styleUrl: './player-form.scss'
})
export class PlayerForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private skillService = inject(SkillService);
  private authService = inject(AuthService);

  mode = signal<'create' | 'edit'>('create');
  standalone = input<boolean>(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  skills = signal<Skill[]>([]);
  versions = signal<Version[]>([]);
  versionJugadorId = signal<number | null>(null);

  

  playerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    idNacionalidad: [null, Validators.required],
    idClub: [null, Validators.required],
    imagenUrl: ['', Validators.required],
    calificacion: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
    // Solo en crear
    fechaNacimiento: [null],
    esHombre: [true],
    idVersion: [null],
    // Skills y posiciones como arrays
    skills: this.fb.array([]),
    posiciones: this.fb.array([]),
    
  });

  get skillsArray() { return this.playerForm.get('skills') as FormArray; }
  get posicionesArray() { return this.playerForm.get('posiciones') as FormArray; }
  get isCreate() { return this.mode() === 'create'; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode.set('edit');
      this.versionJugadorId.set(Number(id));
      this.loadPlayerData(Number(id));
    } else {
      this.mode.set('create');
      // En crear, fechaNacimiento y idVersion son requeridos
      this.playerForm.get('fechaNacimiento')?.setValidators(Validators.required);
      this.playerForm.get('idVersion')?.setValidators(Validators.required);
    }

    this.loadSkills();
    this.loadVersions();
  }

  loadPlayerData(id: number) {
    this.loading.set(true);
    this.playerService.getPlayerById(id).subscribe({
      next: (player) => {
        this.playerForm.patchValue({
          nombre: player.nombre,
          apellido: player.apellido,
          idNacionalidad: player.idNacionalidad as any,
          idClub: player.idClub as any,
          imagenUrl: player.imagenUrl,
          calificacion: player.calificacion as any
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSkills() {
    this.skillService.getSkills().subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.buildSkillsArray(skills);
      }
    });
  }

  loadVersions() {
    this.playerService.getVersions().subscribe({
      next: (versions) => this.versions.set(versions)
    });
  }

  buildSkillsArray(skills: Skill[]) {
    skills.forEach(skill => {
      this.skillsArray.push(
        this.fb.group({
          idSkill: [skill.idSkill],
          valor: [50, [Validators.required, Validators.min(1), Validators.max(99)]]
        })
      );
    });
  }

  onSubmit() {
    if (this.playerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    if (this.isCreate) {
      const user = this.authService.getUser()();
      const dto = {
        ...this.playerForm.value,
        idUsuarioCreador: (user as any)?.id
      };
      this.playerService.createPlayer(dto as any).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/players']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Error al crear el jugador');
        }
      });
    } else {
      const dto = {
        idJugador: this.versionJugadorId(),
        ...this.playerForm.value
      };
      this.playerService.updatePlayer(this.versionJugadorId()!, dto as any).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/players']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Error al actualizar el jugador');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/players']);
  }
}