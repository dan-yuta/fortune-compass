function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export function seededRandom(seed: string): number {
  const hash = djb2Hash(seed);
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export function getDateSeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function seededChoice<T>(seed: string, array: T[]): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

export function seededScore(seed: string): number {
  return Math.floor(seededRandom(seed) * 5) + 1;
}
