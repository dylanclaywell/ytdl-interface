export default function convertFilesizeStringToBytes(filesize: string): number {
  const [filesizeNumber, unit] = filesize.match(/(\d+)(\w*)/) ?? []

  if (!filesizeNumber || !Number(filesizeNumber)) {
    return 0
  }

  const multiplier = /K/.test(unit)
    ? 1000
    : /M/.test(unit)
    ? 1000000
    : /G/.test(unit)
    ? 1000000000
    : 1

  return Number(filesizeNumber) * multiplier
}
