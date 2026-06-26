import shortUUID from 'short-uuid';

const translator = shortUUID();
export function nanoid(length = 8): string {
  return translator.new().slice(0, length);
}
