"use client"

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

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

interface WebSocketContextType {
    connectionStatus: ConnectionStatus
    lastMessage: WebSocketMessage | null
    error: string | null
    connect: (userID: number, token?: string) => void
    disconnect: () => void
    sendMessage: (message: WebSocketMessage) => boolean
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<{ id: number; token?: string } | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5
    const baseReconnectDelay = 1000
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastPongRef = useRef<number>(Date.now())
    const messageQueueRef = useRef<WebSocketMessage[]>([])
    const isManualDisconnectRef = useRef(false)

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
    // Check for production config issues
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' &&
            (WS_BASE_URL.includes('localhost') || WS_BASE_URL.includes('127.0.0.1'))) {
            console.error(
                'CRITICAL WARNING: You are running in PRODUCTION mode but connecting to localhost WebSocket.\n' +
                'Real-time chat will fail for external users.\n' +
                'Please set NEXT_PUBLIC_WS_URL environment variable to your real domain (e.g., wss://api.yourdomain.com)'
            );
        }
    }, []);

    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
        }

        heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }))

                if (Date.now() - lastPongRef.current > 45000) {
                    console.log('Connection appears stale, forcing reconnection')
                    isManualDisconnectRef.current = false
                    wsRef.current.close()
                }
            }
        }, 30000)
    }, [])

    const stopHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
            heartbeatIntervalRef.current = null
        }
    }, [])

    const connect = useCallback((userID: number, token?: string) => {
        // Determine if we are truly connecting to a new user or just restating the same connection
        // If same user and already connected/connecting, do nothing
        if (currentUser?.id === userID && (connectionStatus === 'connected' || connectionStatus === 'connecting')) {
            return
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            // If connected but user changed, close first
            if (currentUser?.id !== userID) {
                console.log('Switching user, closing old connection')
                wsRef.current.close()
                // Continue to connect logic below...
            } else {
                console.log('WebSocket already connected for this user')
                return
            }
        }

        setCurrentUser({ id: userID, token })
        isManualDisconnectRef.current = false
        setConnectionStatus('connecting')
        setError(null)

        const params = new URLSearchParams({
            user_id: userID.toString()
        })

        if (token) {
            params.append('token', token)
        }

        const wsUrl = `${WS_BASE_URL}/ws/chat?${params.toString()}`
        const isProduction = process.env.NODE_ENV === 'production'

        console.log(`[WebSocketProvider] Attempting connection to: ${wsUrl}${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)

        try {
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log(`[WebSocketProvider] Connected successfully`)
                setConnectionStatus('connected')
                setError(null)
                reconnectAttempts.current = 0
                startHeartbeat()
                processMessageQueue()
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WebSocketMessage
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
                console.log(`[WebSocketProvider] Disconnected (code: ${event.code})`)
                setConnectionStatus('disconnected')
                wsRef.current = null
                stopHeartbeat()

                if (event.code !== 1000 && !isManualDisconnectRef.current && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1)
                    console.log(`[WebSocketProvider] Reconnecting in ${delay}ms...`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        // Re-invoke connect with the stored user data
                        // We need to access the LATEST currentUser ref or pass it in.
                        // Since we updated state, we might need a way to trigger Re-connect.
                        // But actually, 'connect' is a callback. We can just call the internal logic?
                        // Or simpler: The component state 'currentUser' holds the config.
                        // Wait, we can't call connect(userID) easily from here if potential race conditions exist for 'connect' scope.
                        // Let's assume the recursive call works if we use the args passed to this specific connect closure? 
                        // Ideally we shouldn't rely on closure variables for retries if they change.
                        // But 'userID' and 'token' are static for this session attempt.
                        if (!isManualDisconnectRef.current) {
                            connect(userID, token)
                        }
                    }, delay)
                } else if (reconnectAttempts.current >= maxReconnectAttempts) {
                    setError('Connection lost. Please refresh the page.')
                }
            }

            ws.onerror = (event) => {
                console.error(`[WebSocketProvider] Connection error`, event)
                setConnectionStatus('error')
                setError('WebSocket connection failed')
            }
        } catch (err) {
            console.error(`[WebSocketProvider] Failed to create connection`, err)
            setConnectionStatus('error')
            setError('Failed to create WebSocket connection')
        }
    }, [currentUser, startHeartbeat, stopHeartbeat, baseReconnectDelay, processMessageQueue])

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        stopHeartbeat()
        isManualDisconnectRef.current = true
        setCurrentUser(null)

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
                wsRef.current.send(JSON.stringify(message))
                return true
            } catch (err) {
                console.error(`[WebSocketProvider] Failed to send message`, err)
                setError('Failed to send message')
                queueMessage(message)
                return false
            }
        } else {
            console.warn(`[WebSocketProvider] Cannot send - not connected`)
            setError('Connection lost, message queued for retry')
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

    return (
        <WebSocketContext.Provider value={{
            connectionStatus,
            lastMessage,
            error,
            connect,
            disconnect,
            sendMessage
        }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider')
    }
    return context
}
