import JSEncrypt from "jsencrypt";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function encryptApiToken(apiKey: string, publicKey: string) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(apiKey);
}
