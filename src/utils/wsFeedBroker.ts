type WsFeedBroker = {
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  close: () => void
  open: () => void
  simulateError: (errorMessage: string) => void
}

const WEBSOCKET_RECONNECT_TIMEOUT = 1000

export const createWsFeedBroker = (
  url: string,
  onMessage: (message: any) => void,
  onError: (error: any) => void,
  onStatusChange: (status: boolean) => void,
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

    const handleOpen = () => {
      connected = true
      reconnectTimeout = undefined

      socket?.send(JSON.stringify({ event: 'subscribe', feed: 'book_ui_1', product_ids: subscriptions }))

      onStatusChange(true)
    }

    const handleError = (event: Event) => {
      connected = false
      socket = undefined
      if (reconnectTimeout != null) {
        reconnectTimeout = window.setTimeout(open, WEBSOCKET_RECONNECT_TIMEOUT)
      }
      onError(event)
      onStatusChange(false)
    }

    const handleMessage = (messageEvent: MessageEvent) => {
      onMessage(messageEvent)
    }

    const handleClose = () => {
      socket = undefined
      connected = false
      if (reconnectTimeout != null) {
        window.clearTimeout(reconnectTimeout)
      }
      onStatusChange(false)
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('error', handleError)
    socket.addEventListener('close', handleClose)
    socket.addEventListener('message', handleMessage)
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

    simulateError: (errorMessage: string) => {
      console.error(errorMessage)
      // Simulate connection being closed due to an error
      close()
      // And invoke the error handler to wrap up the simulation
      onError(new Error(errorMessage))
    }
  }
}
