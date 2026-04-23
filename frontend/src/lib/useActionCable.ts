import { useEffect, useRef } from 'react'

type MessageHandler = (data: Record<string, unknown>) => void

interface UseActionCableOptions {
  channel: string
  onMessage: MessageHandler
}

const CABLE_URL = process.env.NEXT_PUBLIC_CABLE_URL || 'ws://localhost:3000/cable'

export function useActionCable({ channel, onMessage }: UseActionCableOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef<MessageHandler>(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const ws = new WebSocket(CABLE_URL)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({ channel }),
        })
      )
    }

    ws.onmessage = (event) => {
      const raw = JSON.parse(event.data)

      if (raw.type === 'ping' || raw.type === 'welcome' || raw.type === 'confirm_subscription') return
      if (!raw.message) return

      onMessageRef.current(raw.message)
    }

    ws.onerror = (err) => {
      console.error('[ActionCable] WebSocket error:', err)
    }

    return () => {
      ws.close()
    }
  }, [channel])
}
