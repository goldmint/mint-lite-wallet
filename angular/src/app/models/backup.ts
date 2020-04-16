import {environment} from "../../environments/environment";

export class Backup {
  author: string = "Mint Lite Wallet";
  method: string = "AES";
  version: number = environment.backupVersion;
  data: string =  "";
}