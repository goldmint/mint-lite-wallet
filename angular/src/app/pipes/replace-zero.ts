import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'replaceZero'})
export class ReplaceZero implements PipeTransform {
  transform(value: string) {
    if (value) {
      const position = value.toString().indexOf('.');
      let data;
      if (position >= 0) {
        data = +(value.toString().substr(0, position + 4)).replace(/0+$/, '');
      } else {
        data = +value.replace(/0+$/, '');
      }

      return data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
  }
}
