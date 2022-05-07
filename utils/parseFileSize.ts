export function parseFileSize(fileSize: number) {
  return `${(fileSize / 1000 / 1000).toFixed(2)}MB`
}
