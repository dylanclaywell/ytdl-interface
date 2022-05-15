import QueueProcessor from './QueueProcessor'

const queueProcessor = new QueueProcessor()

export function startQueue() {
  queueProcessor.start()
}

export function queueIsProcessing() {
  return queueProcessor.downloadInProgress
}
