import { Component, inject, signal, output } from '@angular/core';
import { PlayerService } from '../../../core/services/player';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-import-csv',
  imports: [ButtonModule, MessageModule, TableModule, TagModule],
  templateUrl: './import-csv.html',
  styleUrl: './import-csv.scss'
})
export class ImportCsv {

  private playerService = inject(PlayerService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  result = signal<any | null>(null);
  selectedFile = signal<File | null>(null);

  imported = output<void>();

  get errores() {
  return this.result()?.detalles?.filter((d: any) => d.estado === 'error') ?? [];
}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      this.errorMessage.set('Solo se permiten archivos CSV');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);
    this.result.set(null);
  }

  onImport() {
    if (!this.selectedFile()) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('csv', this.selectedFile()!);

    this.playerService.importCsv(formData).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
        if (res.errores === 0) this.imported.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Error al importar el CSV');
      }
    });
  }
}