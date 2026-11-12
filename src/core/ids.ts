let counter = 0;

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  counter += 1;
  return `cue-${Date.now().toString(36)}-${counter.toString(36)}`;
}
