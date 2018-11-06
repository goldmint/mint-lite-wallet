import {Directive} from "@angular/core";
import {AbstractControl, FormControl, NG_VALIDATORS, Validator, ValidatorFn} from "@angular/forms";
import * as CRC32 from "crc-32";
import * as bs58 from 'bs58';


function validateSumus(): ValidatorFn {
  return (c: AbstractControl) => {
    let isValid = false;
    let bytes;

    try {
      bytes = bs58.decode(c.value);
    } catch (e) {
      isValid = false;
    }

    if (bytes && (bytes.length > 4 || c.value.length > 4)) {
      let payloadCrc = CRC32.buf(bytes.slice(0, -4));
      let crcBytes = bytes.slice(-4);
      let crc = crcBytes[0] | crcBytes[1] << 8 | crcBytes[2] << 16 | crcBytes[3] << 24;

      isValid = payloadCrc === crc;
    }
    if (isValid) {
      return null;
    } else {
      return {
        sumus: {
          valid: false
        }
      };
    }
  }
}

@Directive({
  selector: '[sumusAddress][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: SumusAddressValidator, multi: true }
  ]
})
export class SumusAddressValidator implements Validator {
  validator: ValidatorFn;

  constructor() {
    this.validator = validateSumus();
  }

  validate(c: FormControl) {
    return this.validator(c);
  }
}