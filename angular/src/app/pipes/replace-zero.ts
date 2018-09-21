import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'replaceZero'})
export class ReplaceZero implements PipeTransform {
  transform(value: string) {
    if (value) {
      const position = value.toString().indexOf('.');
      if (position >= 0) {
        return (value.toString().substr(0, position + 9)).replace(/0+$/, '');
      } else {
        return value.replace(/0+$/, '');
      }
    }
  }
}