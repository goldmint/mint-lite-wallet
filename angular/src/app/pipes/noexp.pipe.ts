import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'noexp'})
export class NoexpPipe implements PipeTransform {
  transform(value: number) {
    let data = String(value).split(/[eE]/);
    if(data.length== 1) return data[0];

    let z= '', sign = value<0? '-':'',
      str= data[0].replace('.', ''),
      mag= Number(data[1])+ 1;

    if(mag<0){
      z= sign + '0.';
      while(mag++) z += '0';
      return z + str.replace(/^\-/,'');
    }
    mag -= str.length;
    while(mag--) z += '0';
    return str + z;
  }
}