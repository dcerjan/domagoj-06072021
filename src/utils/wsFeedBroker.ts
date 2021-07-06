type WsFeedBroker = {
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  close: () => void
  open: () => void
}

const WEBSOCKET_RECONNECT_TIMEOUT = 1000

export const createWsFeedBroker = (
  url: string,
  onMessage: (message: any) => void,
  onError: (error: any) => void,
): WsFeedBroker => {
  let subscriptions: string[] = []
  let connected = false
  let reconnectTimeout: number | undefined
  let socket: WebSocket | undefined

  const open = () => {
    if (reconnectTimeout != null) {
      return
    }

    socket = new WebSocket(url)

    socket.addEventListener('open', () => {
      connected = true
      reconnectTimeout = undefined

      socket?.send(JSON.stringify({ event: 'subscribe', feed: 'book_ui_1', product_ids: subscriptions }))
    })

    socket.addEventListener('error', (event) => {
      connected = false
      socket = undefined
      if (reconnectTimeout != null) {
        reconnectTimeout = window.setTimeout(open, WEBSOCKET_RECONNECT_TIMEOUT)
      }
      onError(event)
    })

    socket.addEventListener('close', () => {
      socket = undefined
      connected = false
      if (reconnectTimeout != null) {
        window.clearTimeout(reconnectTimeout)
      }
    })

    socket.addEventListener('message', (messageEvent) => {
      onMessage(messageEvent)
    })
  }

  const close = () => {
    socket?.close()
    connected = false
    socket = undefined
  }

  open()

  return {
    subscribe: (channel) => {
      if (!subscriptions.includes(channel)) {
        subscriptions.push(channel)

        if (connected) {
          socket?.send(JSON.stringify({ event: 'subscribe', feed: 'book_ui_1', product_ids: [channel] }))
        }
      }
    },

    unsubscribe: (channel) => {
      if (subscriptions.includes(channel)) {
        subscriptions = subscriptions.filter((sub) => sub !== channel)
        if (connected) {
          socket?.send(JSON.stringify({ event: 'unsubscribe', feed: 'book_ui_1', product_ids: [channel] }))
        }
      }
    },

    open,
    close,
  }
}
