export default function clone<Data>(data: Data) {
  return JSON.parse(JSON.stringify(data)) as Data
}
