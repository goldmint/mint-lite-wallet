import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({ name: 'formatTokenAmount' })
export class FormatTokenAmount implements PipeTransform {
  transform(value: string, decimals:number = 8) {
    let ret = "0." + '0'.repeat(decimals);
    let n = new BigNumber(value, 10);
    if (!n.isNaN()) {
      ret = n.decimalPlaces(decimals, BigNumber.ROUND_CEIL).toString(10);
    }
    if (ret.indexOf('.') > 0) {
      let left = ret.substring(0, ret.indexOf('.'));
      let right = ret.substring(ret.indexOf('.'));
      left = left.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return left + right;
    }
    return ret
  }
}
