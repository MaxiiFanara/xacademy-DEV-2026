import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genderLabel',
  standalone: true
})
export class GenderLabelPipe implements PipeTransform {
  transform(esHombre: boolean): string {
    return esHombre ? 'Masculino' : 'Femenino';
  }
}