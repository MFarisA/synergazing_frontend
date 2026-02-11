"use client"

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

// WebSocket connection URL
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:3002'

// Notification WebSocket message types
export interface NotificationWSMessage {
    type: string
    notification_type?: string
    title?: string
    message?: string
    data?: Record<string, unknown>
    client_timestamp?: number
    received_timestamp?: number
    server_timestamp?: number
}

// Parsed notification data from `new_notification` message
export interface NotificationData {
    id: number
    type: string
    title: string
    message: string
    is_read: boolean
    project_id?: number
    data?: Record<string, unknown>
    created_at: string
}

export type NotificationConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface NotificationWebSocketContextType {
    connectionStatus: NotificationConnectionStatus
    lastNotification: NotificationData | null
    error: string | null
    connect: (userID: number, token?: string) => void
    disconnect: () => void
}

const NotificationWebSocketContext = createContext<NotificationWebSocketContextType | null>(null)

export function NotificationWebSocketProvider({ children }: { children: React.ReactNode }) {
    const [connectionStatus, setConnectionStatus] = useState<NotificationConnectionStatus>('disconnected')
    const [lastNotification, setLastNotification] = useState<NotificationData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<{ id: number; token?: string } | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5
    const baseReconnectDelay = 1000
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastPongRef = useRef<number>(Date.now())
    const isManualDisconnectRef = useRef(false)

    // Heartbeat to keep connection alive
    const startHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current)
        }

        heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }))

                if (Date.now() - lastPongRef.current > 45000) {
                    console.log('[NotificationWS] Connection appears stale, forcing reconnection')
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
        // If same user and already connected/connecting, do nothing
        if (currentUser?.id === userID && (connectionStatus === 'connected' || connectionStatus === 'connecting')) {
            return
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            if (currentUser?.id !== userID) {
                console.log('[NotificationWS] Switching user, closing old connection')
                wsRef.current.close()
            } else {
                console.log('[NotificationWS] Already connected for this user')
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

        const wsUrl = `${WS_BASE_URL}/ws/notification?${params.toString()}`
        console.log(`[NotificationWS] Connecting to: ${wsUrl}`)

        try {
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('[NotificationWS] Connected successfully')
                setConnectionStatus('connected')
                setError(null)
                reconnectAttempts.current = 0
                startHeartbeat()
            }

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data) as NotificationWSMessage

                    switch (msg.type) {
                        case 'pong':
                            lastPongRef.current = Date.now()
                            break
                        case 'connected':
                            console.log('[NotificationWS] Server confirmed connection')
                            break
                        case 'new_notification':
                            if (msg.data) {
                                const notifData: NotificationData = {
                                    id: msg.data.id as number,
                                    type: (msg.data.type as string) || '',
                                    title: (msg.data.title as string) || '',
                                    message: (msg.data.message as string) || '',
                                    is_read: (msg.data.is_read as boolean) || false,
                                    project_id: msg.data.project_id as number | undefined,
                                    data: msg.data.data as Record<string, unknown> | undefined,
                                    created_at: (msg.data.created_at as string) || new Date().toISOString(),
                                }
                                console.log('[NotificationWS] New notification received:', notifData.title)
                                setLastNotification(notifData)
                            }
                            break
                        case 'marked_read':
                            console.log('[NotificationWS] Notification marked as read')
                            break
                        case 'unread_count':
                            console.log('[NotificationWS] Unread count:', msg.data?.count)
                            break
                        case 'error':
                            console.error('[NotificationWS] Server error:', msg.data?.message)
                            break
                        default:
                            console.log('[NotificationWS] Unknown message type:', msg.type)
                    }
                } catch (err) {
                    console.error('[NotificationWS] Failed to parse message:', err)
                }
            }

            ws.onclose = (event) => {
                console.log(`[NotificationWS] Disconnected (code: ${event.code})`)
                setConnectionStatus('disconnected')
                wsRef.current = null
                stopHeartbeat()

                if (event.code !== 1000 && !isManualDisconnectRef.current && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1)
                    console.log(`[NotificationWS] Reconnecting in ${delay}ms...`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (!isManualDisconnectRef.current) {
                            connect(userID, token)
                        }
                    }, delay)
                } else if (reconnectAttempts.current >= maxReconnectAttempts) {
                    setError('Notification connection lost. Please refresh the page.')
                }
            }

            ws.onerror = (event) => {
                console.error('[NotificationWS] Connection error', event)
                setConnectionStatus('error')
                setError('Notification WebSocket connection failed')
            }
        } catch (err) {
            console.error('[NotificationWS] Failed to create connection', err)
            setConnectionStatus('error')
            setError('Failed to create notification WebSocket connection')
        }
    }, [currentUser, connectionStatus, startHeartbeat, stopHeartbeat])

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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect()
        }
    }, [disconnect])

    return (
        <NotificationWebSocketContext.Provider value={{
            connectionStatus,
            lastNotification,
            error,
            connect,
            disconnect,
        }}>
            {children}
        </NotificationWebSocketContext.Provider>
    )
}

export function useNotificationSocket() {
    const context = useContext(NotificationWebSocketContext)
    if (!context) {
        throw new Error('useNotificationSocket must be used within a NotificationWebSocketProvider')
    }
    return context
}
