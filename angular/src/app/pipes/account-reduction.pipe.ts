import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'reduction'})
export class AccountReductionPipe implements PipeTransform {
  transform(value: string) {
    if (value) return value.slice(0, 6) + '....' + value.slice(-4);
  }
}