import { Directive } from "@angular/core";
import { AbstractControl, FormControl, NG_VALIDATORS, Validator, ValidatorFn } from "@angular/forms";
import * as CRC32 from "crc-32";
import * as bs58 from 'bs58';

function unpackBase58(v: string): Uint8Array {
  let bytes: Uint8Array;

  try {
    bytes = bs58.decode(v);
  } catch (e) {
    return null;
  }

  if (bytes && (bytes.length > 4 || v.length > 4)) {
      let payloadCrc = CRC32.buf(bytes.slice(0, -4));
      let crcBytes = bytes.slice(-4);
      let crc = crcBytes[0] | crcBytes[1] << 8 | crcBytes[2] << 16 | crcBytes[3] << 24;

      if (payloadCrc === crc) {
        return bytes.slice(0, bytes.length - 4);
      }
  }
  return null;
}

function validAddress(): ValidatorFn {
  return (c: AbstractControl) => {

    let bytes: Uint8Array = unpackBase58(c.value)
    if (bytes === null || bytes.length != 32) {
      return { address: { valid: false } };
    }
    return null;
  }
}

function validPrivateKey(): ValidatorFn {
  return (c: AbstractControl) => {
    let bytes: Uint8Array = unpackBase58(c.value)
    if (bytes === null || bytes.length != 64) {
      return { privateKey: { valid: false } };
    }
    return null;
  }
}

@Directive({
  selector: '[validMintAddress][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: MintAddressValidator, multi: true }
  ]
})
export class MintAddressValidator implements Validator {
  validator: ValidatorFn;

  constructor() {
    this.validator = validAddress();
  }

  validate(c: FormControl) {
    return this.validator(c);
  }
}

@Directive({
  selector: '[validMintPrivateKey][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: MintPrivateKeyValidator, multi: true }
  ]
})
export class MintPrivateKeyValidator implements Validator {
  validator: ValidatorFn;

  constructor() {
    this.validator = validPrivateKey();
  }

  validate(c: FormControl) {
    return this.validator(c);
  }
}
