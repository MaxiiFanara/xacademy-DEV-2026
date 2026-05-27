import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genderLabel'
})
export class GenderLabelPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
