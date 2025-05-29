import type { App } from 'vue'
import { useWebSocket } from './infrastructure/composables/WebSocket'

const webSocket = useWebSocket()

export default function (app: App<Element>) {
  app.provide('RemoteServer', webSocket)
}
