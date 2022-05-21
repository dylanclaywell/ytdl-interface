// import request from 'supertest'
// import { apiResolver } from 'next/dist/server/api-utils/node'
// import http, { IncomingMessage, ServerResponse } from 'http'

// import queueVideos from '../pages/api/downloadVideo'
// import clone from '../utils/clone'
// import { DownloadVideoArgs } from '../types/downloadVideo'

// let server: http.Server
// let oldConsoleError = console.error

// jest.mock('sqlite3')

// beforeAll(() => {
//   server = http.createServer((req: IncomingMessage, res: ServerResponse) =>
//     apiResolver(
//       req,
//       res,
//       undefined,
//       queueVideos,
//       {
//         previewModeId: 'string',
//         previewModeEncryptionKey: 'string',
//         previewModeSigningKey: 'string',
//       },
//       false
//     )
//   )

//   console.error = jest.fn()
// })

// afterAll(() => {
//   console.error = oldConsoleError
// })

// function omitFromObject<Object = Record<string, unknown>>(
//   object: Object,
//   fieldName: keyof Object
// ) {
//   const clonedObject = clone(object)
//   delete clonedObject[fieldName]
//   return clonedObject
// }

// test('it returns 200 on success', (done) => {
//   const videos: DownloadVideoArgs[] = [
//     {
//       filename: 'someFile',
//       extension: 'm4a',
//       format: '140',
//       uuid: '1234-1234-1234',
//       youtubeId: '1234567',
//     },
//   ]

//   request(server)
//     .post('/')
//     .send({
//       videos,
//     })
//     .set('Content-Type', 'application/json')
//     .set('Accept', 'application/json')
//     .expect(200)
//     .then((response) => {
//       expect(response.body.message).toEqual('OK')
//       done()
//     })
//     .catch((err) => done(err))
// })

// const validVideo: QueuedVideo = {
//   filename: '1234',
//   extension: 'm4a',
//   format: '140',
//   uuid: '1234-1234-1234',
//   youtubeId: '1234567',
// }

// describe.each<keyof QueuedVideo>([
//   'filename',
//   'extension',
//   'format',
//   'uuid',
//   'youtubeId',
// ])('it returns 400 when %s is', (fieldName) => {
//   test.each<any>([
//     [
//       'a number',
//       [
//         {
//           ...validVideo,
//           [fieldName]: 123,
//         },
//       ],
//     ],
//     [
//       'undefined',
//       [
//         {
//           ...validVideo,
//           [fieldName]: undefined,
//         },
//       ],
//     ],
//     [
//       'null',
//       [
//         {
//           ...validVideo,
//           [fieldName]: null,
//         },
//       ],
//     ],
//     ['missing', [omitFromObject(validVideo, fieldName)]],
//   ])('%s', (name, videos, done) => {
//     request(server)
//       .post('/')
//       .send({
//         videos,
//       })
//       .set('Content-Type', 'application/json')
//       .set('Accept', 'application/json')
//       .expect(400)
//       .then((response) => {
//         expect(response.body.message).toEqual('Invalid args')
//         done()
//       })
//       .catch((err) => done(err))
//   })
// })
