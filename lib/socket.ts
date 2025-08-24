import { useCallback, useEffect, useRef, useState } from 'react'

// WebSocket connection URL
const WS_BASE_URL = 'wss://synergazing.bahasakita.store'

// Message types for WebSocket communication
export interface WebSocketMessage {
  type: string
  chat_id?: number
  content?: string
  data?: Record<string, unknown>
}

// WebSocket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

// Custom hook for WebSocket connection
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  const connect = useCallback((userID: number, token?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    setConnectionStatus('connecting')
    setError(null)
    
    // Construct WebSocket URL with query parameters
    const params = new URLSearchParams({
      user_id: userID.toString()
    })
    
    if (token) {
      params.append('token', token)
    }
    
    const wsUrl = `${WS_BASE_URL}/ws/chat?${params.toString()}`
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        setError(null)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          setLastMessage(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setConnectionStatus('disconnected')
        wsRef.current = null
        
        // Attempt reconnection if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Reconnecting... Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(userID, token)
          }, reconnectDelay)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setConnectionStatus('error')
        setError('WebSocket connection failed')
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setConnectionStatus('error')
      setError('Failed to create WebSocket connection')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
        return true
      } catch (err) {
        console.error('Failed to send WebSocket message:', err)
        setError('Failed to send message')
        return false
      }
    } else {
      console.warn('WebSocket is not connected')
      setError('WebSocket is not connected')
      return false
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connectionStatus,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage
  }
}