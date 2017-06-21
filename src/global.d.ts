interface Window {
  TextEncoder: Function,
  TextDecoder: Function,
}

declare class TextEncoder
{
  constructor(label?: string, options?: TextEncoding.TextDecoderOptions);
  encoding: string;
  encode(input?: string, options?: TextEncoding.TextEncodeOptions): Uint8Array;
}

declare class TextDecoder
{
  constructor(utfLabel?: string, options?: TextEncoding.TextEncoderOptions)
  encoding: string;
  fatal: boolean;
  ignoreBOM: boolean;
  decode(input?: ArrayBuffer, options?: TextEncoding.TextDecodeOptions): string;
}