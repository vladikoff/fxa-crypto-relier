export function str2ab(str: string): ArrayBuffer {
    return new TextEncoder('utf-8').encode(str);
}

