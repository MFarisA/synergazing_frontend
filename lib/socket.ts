import { useCallback, useEffect, useRef, useState } from 'react'

// WebSocket connection URL
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:3002'

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
  const maxReconnectAttempts = 10 // Increased for production
  const reconnectDelay = 2000 // Reduced delay for faster reconnection
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPongRef = useRef<number>(Date.now())
  const messageQueueRef = useRef<WebSocketMessage[]>([])

  // Message queuing for offline/reconnection scenarios
  const queueMessage = useCallback((message: WebSocketMessage) => {
    messageQueueRef.current.push(message)
    console.log('Message queued for sending when connection is restored')
  }, [])

  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      console.log(`Processing ${messageQueueRef.current.length} queued messages`)
      
      messageQueueRef.current.forEach(message => {
        wsRef.current?.send(JSON.stringify(message))
      })
      
      messageQueueRef.current = []
    }
  }, [])

  // Heartbeat to keep connection alive in production
  const startHeartbeat = useCallback(() => {
    // Clear existing heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send ping
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
        
        // Check if connection is stale (no pong received in 30 seconds)
        if (Date.now() - lastPongRef.current > 30000) {
          console.log('Connection appears stale, forcing reconnection')
          wsRef.current.close()
        }
      }
    }, 15000) // Send ping every 15 seconds
  }, [])

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

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
    const isProduction = process.env.NODE_ENV === 'production'
    
    console.log(`[WebSocket] Attempting connection to: ${wsUrl}${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
    
    // Add additional debug info
    console.log('[WebSocket] Connection details:', {
      baseUrl: WS_BASE_URL,
      userId: userID,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    })
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log(`[WebSocket] Connected successfully to ${WS_BASE_URL}${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
        setConnectionStatus('connected')
        setError(null)
        reconnectAttempts.current = 0
        
        // Start heartbeat to keep connection alive
        startHeartbeat()
        
        // Process any queued messages
        processMessageQueue()
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          
          // Handle pong messages for heartbeat
          if (message.type === 'pong') {
            lastPongRef.current = Date.now()
            return
          }
          
          setLastMessage(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        const isProduction = process.env.NODE_ENV === 'production'
        console.log(`[WebSocket] Disconnected (code: ${event.code}, reason: ${event.reason})${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
        setConnectionStatus('disconnected')
        wsRef.current = null
        stopHeartbeat()
        
        // Attempt reconnection if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = reconnectDelay * reconnectAttempts.current
          console.log(`[WebSocket] Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
          
          setTimeout(() => {
            if (wsRef.current === null) { // Only reconnect if still disconnected
              connect(userID, token)
            }
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error(`[WebSocket] Max reconnection attempts (${maxReconnectAttempts}) reached${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
          setError('Connection lost. Please refresh the page.')
        }
      }

      ws.onerror = (event) => {
        const isProduction = process.env.NODE_ENV === 'production'
        console.error(`[WebSocket] Connection error:${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`, event)
        
        // Log the attempted URL for debugging
        console.error('[WebSocket] Failed to connect to:', wsUrl)
        console.error('[WebSocket] WebSocket base URL:', WS_BASE_URL)
        console.error('[WebSocket] Environment:', process.env.NODE_ENV)
        
        // Common troubleshooting steps
        console.error('[WebSocket] Troubleshooting checklist:')
        console.error('1. Is the Go backend WebSocket server running?')
        console.error('2. Check if /ws/chat endpoint exists in backend routes')
        console.error('3. Verify WebSocket upgrade handling in Go server')
        console.error('4. Check CORS settings for WebSocket connections')
        
        setConnectionStatus('error')
        setError('WebSocket connection failed')
      }
    } catch (err) {
      const isProduction = process.env.NODE_ENV === 'production'
      console.error(`[WebSocket] Failed to create connection:${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`, err)
      setConnectionStatus('error')
      setError('Failed to create WebSocket connection')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    stopHeartbeat()
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }, [stopHeartbeat])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const isProduction = process.env.NODE_ENV === 'production'
        wsRef.current.send(JSON.stringify(message))
        console.log(`[WebSocket] Message sent successfully: ${message.type}${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
        return true
      } catch (err) {
        const isProduction = process.env.NODE_ENV === 'production'
        console.error(`[WebSocket] Failed to send message:${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`, err)
        setError('Failed to send message')
        
        // Queue message for retry
        queueMessage(message)
        return false
      }
    } else {
      const isProduction = process.env.NODE_ENV === 'production'
      const state = wsRef.current?.readyState ?? 'null'
      console.warn(`[WebSocket] Cannot send message - connection not ready (state: ${state})${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)
      setError('Connection lost, message queued for retry')
      
      // Queue message for when connection is restored
      queueMessage(message)
      return false
    }
  }, [queueMessage])

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