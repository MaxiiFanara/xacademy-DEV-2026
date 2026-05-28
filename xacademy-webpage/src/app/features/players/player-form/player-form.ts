import { Component, inject, signal, OnInit, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../../core/services/player';
import { FormDataService } from '../../../core/services/form-data';
import { AuthService } from '../../../core/services/auth';
import { Nacionalidad } from '../../../core/models/nacionalidad.model';
import { Liga } from '../../../core/models/liga.model';
import { Club } from '../../../core/models/club.model';
import { Position } from '../../../core/models/position.model';
import { Skill } from '../../../core/models/skill.model';
import { Version } from '../../../core/models/version.model';

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
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-form',
  imports: [
    ReactiveFormsModule, FormsModule,
    Navbar, Footer, LoadingSpinner,
    CardModule, InputTextModule, InputNumberModule,
    SelectModule, ToggleSwitchModule, ButtonModule,
    MessageModule, DatePickerModule, CheckboxModule, TagModule
  ],
  templateUrl: './player-form.html',
  styleUrl: './player-form.scss'
})
export class PlayerForm implements OnInit {

  standalone = input<boolean>(false);

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private formDataService = inject(FormDataService);
  private authService = inject(AuthService);

  mode = signal<'create' | 'edit'>('create');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Datos para combos
  nacionalidades = signal<Nacionalidad[]>([]);
  ligas = signal<Liga[]>([]);
  clubs = signal<Club[]>([]);
  posiciones = signal<Position[]>([]);
  skills = signal<Skill[]>([]);
  versions = signal<Version[]>([]);

  // Estado del formulario
  selectedLiga = signal<number | null>(null);
  esArquero = signal(false);
  esHombre = signal(true);
  versionJugadorId = signal<number | null>(null);

  // Skills filtradas según si es arquero o no
  filteredSkills = computed(() =>
    this.skills().filter(s => s.EsArquero === this.esArquero())
  );

  // Calificación calculada dinámicamente
  calificacion = signal(0);

private updateCalificacion() {
  this.playerForm.get('skills')?.valueChanges.subscribe(vals => {
    if (!vals || vals.length === 0) { this.calificacion.set(0); return; }
    const sum = vals.reduce((a: number, s: any) => a + (s.valor || 0), 0);
    this.calificacion.set(Math.round(sum / vals.length));
  });
}

  today = new Date();

  playerForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    imagenUrl: ['', Validators.required],
    idNacionalidad: [null as number | null, Validators.required],
    idLiga: [null as number | null, Validators.required],
    idClub: [null as number | null, Validators.required],
    fechaNacimiento: [null as Date | null],
    idVersion: [null as number | null],
    posiciones: this.fb.array([], Validators.required),
    skills: this.fb.array([])
  });

  get skillsArray() { return this.playerForm.get('skills') as FormArray; }
  get posicionesArray() { return this.playerForm.get('posiciones') as FormArray; }
  get isCreate() { return this.mode() === 'create'; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode.set('edit');
      this.versionJugadorId.set(Number(id));
      this.playerForm.get('fechaNacimiento')?.clearValidators();
      this.playerForm.get('idVersion')?.clearValidators();
    } else {
      this.mode.set('create');
      this.playerForm.get('fechaNacimiento')?.setValidators(Validators.required);
      this.playerForm.get('idVersion')?.setValidators(Validators.required);
    }

    this.loadFormData();
  }

  loadFormData() {
    this.loading.set(true);

    this.formDataService.getNacionalidades().subscribe(data => this.nacionalidades.set(data));
    this.formDataService.getLigas().subscribe(data => this.ligas.set(data));
    this.formDataService.getPosiciones().subscribe(data => this.posiciones.set(data));
    this.formDataService.getSkills().subscribe(data => {
      this.skills.set(data);
      this.buildSkillsArray();
    });
    this.playerService.getVersions().subscribe(data => {
      this.versions.set(data);
      this.loading.set(false);
    });

    if (this.mode() === 'edit' && this.versionJugadorId()) {
      this.playerService.getPlayerById(this.versionJugadorId()!).subscribe({
       next: (player) => {
  this.playerForm.patchValue({
    nombre: player.nombre,
    apellido: player.apellido,
    imagenUrl: '',
  });
}
      });
    }
  }

  onLigaChange(idLiga: number) {
  this.selectedLiga.set(idLiga);
  this.playerForm.get('idClub')?.setValue(null);
  this.clubs.set([]);
  this.formDataService.getClubsByLiga(idLiga).subscribe(data => this.clubs.set(data));
}

  get GK_NOMBRE() { return 'GK'; }

isPorteroSeleccionado(): boolean {
  return this.posicionesArray.controls.some(c => {
    const pos = this.posiciones().find(p => p.Id === c.get('idPosicion')?.value);
    return pos?.Nombre === this.GK_NOMBRE;
  });
}

onSkillValueChange() {
  this.skillsArray.controls.forEach(c => {
    let v = c.get('valor')?.value;
    if (v === null || v === undefined) return;
    if (v > 99) c.get('valor')?.setValue(99, { emitEvent: false });
    if (v < 1) c.get('valor')?.setValue(1, { emitEvent: false });
  });

  const vals = this.skillsArray.controls.map(c => c.get('valor')?.value || 0);
  if (vals.length === 0) { this.calificacion.set(0); return; }
  const sum = vals.reduce((a: number, b: number) => a + b, 0);
  this.calificacion.set(Math.round(sum / vals.length));
}

onPosicionChange(posicion: Position, checked: boolean) {
  const arr = this.posicionesArray;
  const esPortero = posicion.Nombre === this.GK_NOMBRE;

  if (checked) {
    // Si selecciona portero, limpiar todas las demás
    if (esPortero) {
      while (arr.length) arr.removeAt(0);
      this.esArquero.set(true);
      arr.push(this.fb.group({
        idPosicion: [posicion.Id],
        esPrincipal: [true]
      }));
      this.buildSkillsArray();
      return;
    }

    // Si ya hay portero seleccionado, no dejar agregar otra
    const tienePortero = arr.controls.some(c => {
      const pos = this.posiciones().find(p => p.Id === c.get('idPosicion')?.value);
      return pos?.Nombre === this.GK_NOMBRE;
    });
    if (tienePortero) return;

    arr.push(this.fb.group({
      idPosicion: [posicion.Id],
      esPrincipal: [arr.length === 0]
    }));
  } else {
    const idx = arr.controls.findIndex(c => c.get('idPosicion')?.value === posicion.Id);
    if (idx !== -1) arr.removeAt(idx);
    if (esPortero) {
      this.esArquero.set(false);
      this.buildSkillsArray();
    }
  }
}

  isPosicionSelected(id: number): boolean {
    return this.posicionesArray.controls.some(c => c.get('idPosicion')?.value === id);
  }

  setPrincipal(id: number) {
    this.posicionesArray.controls.forEach(c => {
      c.get('esPrincipal')?.setValue(c.get('idPosicion')?.value === id);
    });
  }

  buildSkillsArray() {
    while (this.skillsArray.length) this.skillsArray.removeAt(0);
    this.filteredSkills().forEach(skill => {
      this.skillsArray.push(this.fb.group({
        idSkill: [skill.Id],
        valor: [50, [Validators.required, Validators.min(1), Validators.max(99)]]
      }));
    });
      this.updateCalificacion();
  }

  onSubmit() {
    if (this.playerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const user = this.authService.getUser()();

    if (this.isCreate) {
      const fechaRaw = this.playerForm.get('fechaNacimiento')?.value as Date;
      const dto = {
        nombre: this.playerForm.get('nombre')?.value,
        apellido: this.playerForm.get('apellido')?.value,
        fechaNacimiento: fechaRaw?.toISOString().split('T')[0],
        esHombre: this.esHombre(),
        idNacionalidad: this.playerForm.get('idNacionalidad')?.value,
        idUsuarioCreador: (user as any)?.id,
        idVersion: this.playerForm.get('idVersion')?.value,
        idClub: this.playerForm.get('idClub')?.value,
        imagenUrl: this.playerForm.get('imagenUrl')?.value,
        calificacion: this.calificacion(),
        posiciones: this.posicionesArray.value,
        skills: this.skillsArray.value
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
        nombre: this.playerForm.get('nombre')?.value,
        apellido: this.playerForm.get('apellido')?.value,
        idNacionalidad: this.playerForm.get('idNacionalidad')?.value,
        idClub: this.playerForm.get('idClub')?.value,
        imagenUrl: this.playerForm.get('imagenUrl')?.value,
        calificacion: this.calificacion(),
        posiciones: this.posicionesArray.value,
        skills: this.skillsArray.value
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