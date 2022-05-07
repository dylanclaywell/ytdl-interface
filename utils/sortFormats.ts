import { Format } from '../types/getVideoMetadata'

export function sortFormats(a: Format, b: Format) {
  return Number(a.id) < Number(b.id) ? -1 : 1
}
