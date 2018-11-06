import {environment} from "../../environments/environment";

export class Backup {
  author: string = "Sumus Light Wallet";
  method: string = "AES";
  version: number = environment.backupVersion;
  data: string =  "";
}