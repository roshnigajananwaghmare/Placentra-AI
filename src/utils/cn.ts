type ClassValue = string | number | null | false | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (vals: ClassValue[]) => {
    for (const v of vals) {
      if (!v) continue;
      if (typeof v === 'string' || typeof v === 'number') {
        out.push(String(v));
      } else if (Array.isArray(v)) {
        walk(v);
      }
    }
  };
  walk(inputs);
  return out.join(' ');
}
