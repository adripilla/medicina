declare module "jsfxr" {
  /**
   * jsfxr recibe un array de ~24 números como preset
   * y devuelve un string base64 WAV (sin prefijo data:).
   */
  export default function jsfxr(params: number[]): string;
}
