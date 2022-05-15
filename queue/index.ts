import QueueProcessor from './QueueProcessor'

const queueProcessor = new QueueProcessor()

export default function startQueue() {
  queueProcessor.start()
}
