import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'substr'})
export class SubstrPipe implements PipeTransform {
  transform(value: number, digits: number, useFormatting: boolean) {
    const position = value.toString().indexOf('.');
    let result = position >= 0 ? value.toString().substr(0, position + digits + 1) : value;

    if (useFormatting !== undefined) {
      result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    return result;
  }
}
