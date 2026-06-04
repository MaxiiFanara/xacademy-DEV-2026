import { Component, inject, signal, OnInit, computed, input, output } from '@angular/core';
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

import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

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
  saved = output<void>();

  nacionalidades = signal<Nacionalidad[]>([]);
  ligas = signal<Liga[]>([]);
  clubs = signal<Club[]>([]);
  posiciones = signal<Position[]>([]);
  skills = signal<Skill[]>([]);
  versions = signal<Version[]>([]);

  selectedLiga = signal<number | null>(null);
  esArquero = signal(false);
  esHombre = signal(true);
  versionJugadorId = signal<number | null>(null);

  // Imagen seleccionada
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  imagenActual = signal<string | null>(null); // imagen existente en edición

  filteredSkills = computed(() =>
    this.skills().filter(s => s.EsArquero === this.esArquero())
  );

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
  get GK_NOMBRE() { return 'GK'; }

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

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.type !== 'image/webp') {
      this.errorMessage.set('Solo se permiten imágenes en formato WebP');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  precargarSkills(skills: { idSkill: number; valor: number; nombre: string }[]) {
    if (this.skillsArray.length === 0) return;
    skills.forEach(skill => {
      const control = this.skillsArray.controls.find(
        c => c.get('idSkill')?.value === skill.idSkill
      );
      if (control) control.get('valor')?.setValue(skill.valor);
    });
    this.onSkillValueChange();
  }

  precargarPosiciones(posiciones: { idPosicion: number; esPrincipal: boolean }[]) {
    while (this.posicionesArray.length) this.posicionesArray.removeAt(0);
    posiciones.forEach(pos => {
      const posicion = this.posiciones().find(p => p.Id === pos.idPosicion);
      if (posicion?.Nombre === this.GK_NOMBRE) {
        this.esArquero.set(true);
        this.buildSkillsArray();
      }
      this.posicionesArray.push(this.fb.group({
        idPosicion: [pos.idPosicion],
        esPrincipal: [pos.esPrincipal]
      }));
    });
  }

  loadFormData() {
    this.loading.set(true);
    this.formDataService.getNacionalidades().subscribe(data => this.nacionalidades.set(data));
    this.formDataService.getLigas().subscribe(data => this.ligas.set(data));
    this.formDataService.getPosiciones().subscribe(data => this.posiciones.set(data));
    this.playerService.getVersions().subscribe(data => this.versions.set(data));

    this.formDataService.getSkills().subscribe(data => {
      this.skills.set(data);
      this.buildSkillsArray();

      if (this.mode() === 'edit' && this.versionJugadorId()) {
        this.playerService.getPlayerById(this.versionJugadorId()!).subscribe({
          next: (player) => {
            this.playerForm.patchValue({
              nombre: player.nombre,
              apellido: player.apellido,
              idNacionalidad: player.idNacionalidad,
              idClub: player.idClub,
            });

            // Guardar imagen actual para mostrarla
            if (player.imagenUrl) {
              this.imagenActual.set(player.imagenUrl);
            }

            this.playerForm.get('idLiga')?.setValue(player.idLiga);
            this.selectedLiga.set(player.idLiga);
            this.formDataService.getClubsByLiga(player.idLiga).subscribe(
              clubes => this.clubs.set(clubes)
            );

            if (player.skills?.length > 0) this.precargarSkills(player.skills);
            if (player.posiciones?.length > 0) this.precargarPosiciones(player.posiciones);

            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.errorMessage.set('No se pudo completar la operación.');
          }
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  onLigaChange(idLiga: number) {
    this.selectedLiga.set(idLiga);
    this.playerForm.get('idClub')?.setValue(null);
    this.clubs.set([]);
    this.formDataService.getClubsByLiga(idLiga).subscribe(data => this.clubs.set(data));
  }

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
      if (esPortero) {
        while (arr.length) arr.removeAt(0);
        this.esArquero.set(true);
        arr.push(this.fb.group({ idPosicion: [posicion.Id], esPrincipal: [true] }));
        this.buildSkillsArray(false);
        return;
      }
      const tienePortero = arr.controls.some(c => {
        const pos = this.posiciones().find(p => p.Id === c.get('idPosicion')?.value);
        return pos?.Nombre === this.GK_NOMBRE;
      });
      if (tienePortero) return;
      arr.push(this.fb.group({ idPosicion: [posicion.Id], esPrincipal: [arr.length === 0] }));
      this.buildSkillsArray(true);
    } else {
      const idx = arr.controls.findIndex(c => c.get('idPosicion')?.value === posicion.Id);
      if (idx !== -1) arr.removeAt(idx);
      if (esPortero) {
        this.esArquero.set(false);
        this.buildSkillsArray(false);
      } else {
        this.buildSkillsArray(true);
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

  buildSkillsArray(preservarValores: boolean = false) {
    const valoresActuales: { [idSkill: number]: number } = {};
    if (preservarValores) {
      this.skillsArray.controls.forEach(c => {
        const idSkill = c.get('idSkill')?.value;
        const valor = c.get('valor')?.value;
        if (idSkill) valoresActuales[idSkill] = valor;
      });
    }
    while (this.skillsArray.length) this.skillsArray.removeAt(0);
    this.filteredSkills().forEach(skill => {
      const valorPrevio = preservarValores ? (valoresActuales[skill.Id] ?? 50) : 50;
      this.skillsArray.push(this.fb.group({
        idSkill: [skill.Id],
        valor: [valorPrevio, [Validators.required, Validators.min(1), Validators.max(99)]]
      }));
    });
    this.updateCalificacion();
    if (this.filteredSkills().length > 0) {
      const sum = this.skillsArray.controls.reduce((a, c) => a + (c.get('valor')?.value || 0), 0);
      this.calificacion.set(Math.round(sum / this.skillsArray.length));
    }
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const user = this.authService.getUser()();

    formData.append('nombre', this.playerForm.get('nombre')?.value || '');
    formData.append('apellido', this.playerForm.get('apellido')?.value || '');
    formData.append('idNacionalidad', String(this.playerForm.get('idNacionalidad')?.value));
    formData.append('idClub', String(this.playerForm.get('idClub')?.value));
    formData.append('calificacion', String(this.calificacion()));
    formData.append('posiciones', JSON.stringify(this.posicionesArray.value));
    formData.append('skills', JSON.stringify(this.skillsArray.value));

    if (this.isCreate) {
      const fechaRaw = this.playerForm.get('fechaNacimiento')?.value as Date;
      formData.append('fechaNacimiento', fechaRaw?.toISOString().split('T')[0] || '');
      formData.append('esHombre', String(this.esHombre()));
      formData.append('idVersion', String(this.playerForm.get('idVersion')?.value));
      formData.append('idUsuarioCreador', String((user as any)?.id || ''));
    }

    if (this.selectedFile()) {
      formData.append('imagen', this.selectedFile()!);
    }

    return formData;
  }

  onSubmit() {
    if (this.playerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const formData = this.buildFormData();

    if (this.isCreate) {
      this.playerService.createPlayer(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.error || 'Error al crear el jugador');
        }
      });
    } else {
      this.playerService.updatePlayer(this.versionJugadorId()!, formData).subscribe({
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