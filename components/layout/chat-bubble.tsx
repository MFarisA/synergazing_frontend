'use client'

import React, { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Search, X, ChevronLeft, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useWebSocket } from '@/lib/socket'
import { Chat, ChatMessage, ConversationListItem } from '@/types'
import { getChatMessages, markMessagesAsRead, getUnreadCount, getChatList, getUnreadUsersCount, getUnreadMessagesCount } from '@/lib/api/chat-message'
import { getUserProfile } from '@/lib/api/profile-management'

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Isolated Search Input Component - completely independent
const SearchInput = memo(() => {
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const debouncedSearch = useDebounce(localSearchQuery, 300)

  // Use a custom event to communicate with parent instead of props
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('searchQueryChanged', {
      detail: { query: debouncedSearch }
    }))
  }, [debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Cari pesan..."
        className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        value={localSearchQuery}
        onChange={handleInputChange}
        autoComplete="off"
      />
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

// Isolated Message Input Component
const MessageInput = memo(({
  onSendMessage,
  connectionStatus
}: {
  onSendMessage: (message: string) => void
  connectionStatus: string
}) => {
  const [localMessage, setLocalMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (localMessage.trim()) {
      onSendMessage(localMessage.trim())
      setLocalMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Input
          value={localMessage}
          onChange={(e) => setLocalMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="pr-10 rounded-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
          autoComplete="off"
          disabled={connectionStatus !== 'connected'}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!localMessage.trim() || connectionStatus !== 'connected'}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </form>
  )
})

MessageInput.displayName = 'MessageInput'

export function ChatBubble() {
  // State management
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<ConversationListItem | null>(null)
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([])
  const [totalUnreadUsers, setTotalUnreadUsers] = useState(0) // Changed to count users, not messages
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filteredConversations, setFilteredConversations] = useState<ConversationListItem[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const processedMessageIds = useRef<Set<number>>(new Set())

  // WebSocket hook
  const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket()

  // Log connection status changes with more detail for production debugging
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production'
    console.log(`WebSocket connection status: ${connectionStatus}${isProduction ? ' (PRODUCTION)' : ' (DEVELOPMENT)'}`)

    if (connectionStatus === 'disconnected' && isAuthenticated) {
      console.warn('WebSocket disconnected while user is authenticated - this may cause message delivery issues')
    }

    if (connectionStatus === 'error') {
      console.error('WebSocket connection error - messages may not be delivered in real-time')
    }
  }, [connectionStatus, isAuthenticated])

  // Auth helper
  const getAuthData = () => {
    if (typeof window === 'undefined') return null

    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      if (!token || !user) {
        return null
      }

      return { token, user }
    } catch (error) {
      console.error('Error getting auth data:', error)
      return null
    }
  }

  // Timestamp helper
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24) {
      return `${diffInHours} jam lalu`
    } else {
      return 'Kemarin'
    }
  }

  // Helper function to refresh unread users count
  const refreshUnreadUsersCount = async () => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const unreadUsersResponse = await getUnreadUsersCount(authData.token)
      if (unreadUsersResponse.success && unreadUsersResponse.data) {
        setTotalUnreadUsers(unreadUsersResponse.data.unread_users_count || 0)
      }
    } catch (error) {
      console.error('Failed to refresh unread users count:', error)
    }
  }

  // Helper function to refresh unread message counts for conversations
  const refreshUnreadMessageCounts = async () => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const unreadMessagesResponse = await getUnreadMessagesCount(authData.token)
      if (unreadMessagesResponse.success && unreadMessagesResponse.data?.unread_messages) {
        const unreadCountsMap = new Map<number, number>()
        unreadMessagesResponse.data.unread_messages.forEach((item: any) => {
          unreadCountsMap.set(item.user_id, item.unread_count)
        })

        // Update conversations with fresh unread counts
        setConversations(prev => {
          const updated = prev.map(conv => ({
            ...conv,
            unread: unreadCountsMap.get(conv.otherUserId) || 0
          }))
          setFilteredConversations(updated)
          return updated
        })
      }
    } catch (error) {
      console.error('Failed to refresh unread message counts:', error)
    }
  }

  // Helper function to fetch and update user profile for new conversations
  const updateConversationWithUserProfile = async (chatId: number, userId: number) => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const userProfileResponse = await getUserProfile(authData.token, userId.toString())
      if (userProfileResponse.success && userProfileResponse.data) {
        const userData = userProfileResponse.data
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.chatId === chatId && conv.otherUserId === userId) {
              return {
                ...conv,
                name: userData.name || conv.name,
                avatar: userData.profile?.profile_picture || '/placeholder.svg'
              }
            }
            return conv
          })
          setFilteredConversations(updated)
          return updated
        })
      }
    } catch (error) {
      console.error('Failed to fetch user profile for conversation:', error)
      // Don't break the conversation creation if profile fetch fails
    }
  }

  // Initialize auth - run once
  useEffect(() => {
    const checkAuth = () => {
      const authData = getAuthData()
      console.log('ChatBubble auth check:', { authData: !!authData, user: authData?.user })

      if (authData) {
        setCurrentUser({ id: authData.user.id, name: authData.user.name })
        setIsAuthenticated(true)
        console.log('Connecting WebSocket for user:', authData.user.id)
        connect(authData.user.id, authData.token)
      } else {
        console.log('No auth data found, disconnecting')
        setIsAuthenticated(false)
        setCurrentUser(null)
        disconnect()
      }
    }

    checkAuth()

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('Storage changed, rechecking auth')
        checkAuth()
      }
    }

    // Listen for custom auth state changes (same tab)
    const handleAuthStateChange = (e: CustomEvent) => {
      console.log('Auth state changed event received:', e.detail)
      checkAuth()
    }

    // Listen for focus events to recheck auth state
    const handleWindowFocus = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener)
      window.removeEventListener('focus', handleWindowFocus)
      // We do NOT disconnect here anymore because the connection is global/shared via Provider
      // and this effect might re-run harmlessly.
    }
    // Remove dependencies to preventing loop. 
    // We only want this to run on mount or when windows events fire (which call checkAuth internally)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load chat messages
  const loadChatMessages = async (chatId: number) => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const response = await getChatMessages(authData.token, chatId)
      if (response.success && response.data?.messages) {
        const messages = response.data.messages.reverse()
        setActiveChatMessages(messages)

        // Clear processed message IDs and add current messages to prevent duplicates
        processedMessageIds.current.clear()
        messages.forEach((msg: ChatMessage) => processedMessageIds.current.add(msg.id))

        // Check if this conversation had unread messages before marking as read
        const currentConv = conversations.find(conv => conv.chatId === chatId)
        const hadUnreadMessages = currentConv && currentConv.unread > 0

        await markMessagesAsRead(authData.token, chatId)
        sendMessage({ type: 'mark_read', chat_id: chatId })

        // Update conversations to mark this chat as read and update last message
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.chatId === chatId) {
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

              // Format last message with "You: " prefix if current user sent it
              let displayMessage = 'No messages yet'
              if (lastMessage?.content) {
                const isUserMessage = lastMessage.sender_id === authData.user.id
                displayMessage = isUserMessage ? `You: ${lastMessage.content}` : lastMessage.content
              }

              return {
                ...conv,
                unread: 0,
                lastMessage: displayMessage,
                timestamp: lastMessage ? formatTimestamp(lastMessage.created_at) : conv.timestamp
              }
            }
            return conv
          })
          setFilteredConversations(updated) // Also update filtered conversations
          return updated
        })

        // If this conversation had unread messages, decrement the unread users count
        if (hadUnreadMessages) {
          setTotalUnreadUsers(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error)
      setError('Failed to load messages')
    }
  }

  // Handle start chat event
  useEffect(() => {
    if (!isAuthenticated) return

    const handleStartChat = (event: CustomEvent) => {
      const { chatId, creatorId, creatorName, creatorAvatar, message } = event.detail

      const newConversation: ConversationListItem = {
        id: chatId,
        name: creatorName,
        avatar: creatorAvatar || '/placeholder.svg',
        title: 'Project Creator',
        lastMessage: message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        isOnline: false,
        chatId: chatId,
        otherUserId: creatorId
      }

      setConversations(prev => {
        const exists = prev.find(conv => conv.chatId === chatId)
        if (exists) {
          return prev.map(conv =>
            conv.chatId === chatId
              ? { ...conv, lastMessage: message, timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
              : conv
          )
        }
        return [newConversation, ...prev]
      })

      setIsOpen(true)
      setActiveChat(newConversation)
      loadChatMessages(chatId)

      // Join the chat room first, then send the message
      setTimeout(() => {
        sendMessage({
          type: 'join_chat',
          chat_id: chatId
        })

        // Send the initial message after joining
        setTimeout(() => {
          sendMessage({
            type: 'send_message',
            chat_id: chatId,
            content: message
          })
        }, 500)
      }, 1000)
    }

    window.addEventListener('startChat', handleStartChat as EventListener)
    return () => {
      window.removeEventListener('startChat', handleStartChat as EventListener)
    }
  }, [isAuthenticated, sendMessage])

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) return

    const loadChatData = async () => {
      const authData = getAuthData()
      if (!authData) return

      try {
        setLoading(true)
        setError(null)

        const [chatsResponse, unreadUsersResponse, unreadMessagesResponse] = await Promise.all([
          getChatList(authData.token),
          getUnreadUsersCount(authData.token),
          getUnreadMessagesCount(authData.token)
        ])

        if (chatsResponse.success && chatsResponse.data) {
          const chats: Chat[] = chatsResponse.data

          // Create a map of user IDs to their unread counts from the API
          const unreadCountsMap = new Map<number, number>()
          if (unreadMessagesResponse.success && unreadMessagesResponse.data?.unread_messages) {
            unreadMessagesResponse.data.unread_messages.forEach((item: any) => {
              unreadCountsMap.set(item.user_id, item.unread_count)
            })
          }

          const conversationList = chats.map(chat => {
            const otherUser = chat.user1_id === authData.user.id ? chat.user2 : chat.user1
            const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null

            // Format last message with "You: " prefix if current user sent it
            let displayMessage = 'No messages yet'
            if (lastMessage?.content) {
              const isUserMessage = lastMessage.sender_id === authData.user.id
              displayMessage = isUserMessage ? `You: ${lastMessage.content}` : lastMessage.content
            }

            return {
              id: chat.id,
              name: otherUser.name,
              avatar: otherUser.profile?.profile_picture || '/placeholder.svg',
              title: 'Collaborator',
              lastMessage: displayMessage,
              timestamp: lastMessage ? formatTimestamp(lastMessage.created_at) : formatTimestamp(chat.created_at),
              unread: unreadCountsMap.get(otherUser.id) || 0, // Set actual unread count from API
              isOnline: false,
              chatId: chat.id,
              otherUserId: otherUser.id
            }
          })
          setConversations(conversationList)
          setFilteredConversations(conversationList)
        }

        if (unreadUsersResponse.success && unreadUsersResponse.data) {
          setTotalUnreadUsers(unreadUsersResponse.data.unread_users_count || 0)
        }
      } catch (error) {
        console.error('Failed to load chat data:', error)
        setError('Failed to load chats')
      } finally {
        setLoading(false)
      }
    }

    loadChatData()
  }, [isAuthenticated])

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage || !isAuthenticated) return

    if (lastMessage.type === 'new_message' && lastMessage.data) {
      const messageData = lastMessage.data as Record<string, unknown>
      const newMsg: ChatMessage = {
        id: messageData.id as number,
        chat_id: messageData.chat_id as number,
        sender_id: messageData.sender_id as number,
        content: messageData.content as string,
        is_read: messageData.is_read as boolean,
        created_at: messageData.created_at as string,
        updated_at: messageData.created_at as string,
        sender: {
          id: (messageData.sender as Record<string, unknown>).id as number,
          name: (messageData.sender as Record<string, unknown>).name as string,
          // optional avatar field from websocket payload
          profile: (messageData.sender as any)?.avatar ? { profile_picture: (messageData.sender as any).avatar as string } : undefined
        }
      }

      // Check for duplicate messages using processed message IDs
      if (processedMessageIds.current.has(newMsg.id)) {
        console.log('Duplicate message detected (already processed):', newMsg.id)
        return
      }

      // Mark this message as processed
      processedMessageIds.current.add(newMsg.id)

      if (activeChat && newMsg.chat_id === activeChat.chatId) {
        // Add message to active chat display
        setActiveChatMessages(prev => [...prev, newMsg])
      }

      // Update conversations and unread users count
      // Calculate if we need to increment unread users count
      // We do this OUTSIDE the setConversations updater to avoid double-counting in Strict Mode
      const currentConvs = conversationsRef.current
      const existingConv = currentConvs.find(conv => conv.chatId === newMsg.chat_id)
      const isFromOtherUser = newMsg.sender_id !== currentUser?.id

      // If message is from someone else, and we haven't read their messages yet (or they are new)
      if (isFromOtherUser) {
        // If it's a new conversation OR existing conversation has 0 unread
        if (!existingConv || existingConv.unread === 0) {
          setTotalUnreadUsers(prev => prev + 1)
        }
      }

      // Update conversations
      setConversations(prev => {
        // Check if conversation already exists
        const existingConvIndex = prev.findIndex(conv => conv.chatId === newMsg.chat_id)

        let updated: ConversationListItem[]

        if (existingConvIndex !== -1) {
          // Update existing conversation
          console.log('Updating existing conversation for chat:', newMsg.chat_id)
          updated = prev.map(conv => {
            if (conv.chatId === newMsg.chat_id) {
              // Format message with "You: " prefix if current user sent it
              const displayMessage = newMsg.sender_id === currentUser?.id ? `You: ${newMsg.content}` : newMsg.content

              return {
                ...conv,
                lastMessage: displayMessage,
                timestamp: formatTimestamp(newMsg.created_at),
                unread: newMsg.sender_id !== currentUser?.id ? conv.unread + 1 : conv.unread
              }
            }
            return conv
          })
        } else {
          // Create new conversation for new user
          console.log('Creating new conversation for chat:', newMsg.chat_id, 'from user:', newMsg.sender.name)

          // Format message with "You: " prefix if current user sent it
          const displayMessage = newMsg.sender_id === currentUser?.id ? `You: ${newMsg.content}` : newMsg.content

          const newConversation: ConversationListItem = {
            id: newMsg.chat_id,
            name: newMsg.sender.name,
            avatar: '/placeholder.svg', // Default avatar, will be updated when we get proper user data
            title: 'Collaborator',
            lastMessage: displayMessage,
            timestamp: formatTimestamp(newMsg.created_at),
            unread: newMsg.sender_id !== currentUser?.id ? 1 : 0,
            isOnline: false,
            chatId: newMsg.chat_id,
            otherUserId: newMsg.sender_id
          }

          // Add new conversation to the beginning of the list
          updated = [newConversation, ...prev]

          // Fetch user profile data asynchronously to update avatar and other details
          updateConversationWithUserProfile(newMsg.chat_id, newMsg.sender_id)
        }

        setFilteredConversations(updated) // Update filtered list too

        return updated
      })
    }
  }, [lastMessage, isAuthenticated, activeChat, currentUser])

  // Auto-scroll
  useEffect(() => {
    if (activeChatMessages.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [activeChatMessages.length])

  // Handle search - completely stable callback using refs
  const currentSearchQuery = useRef('')
  const conversationsRef = useRef(conversations)

  // Update conversations ref when it changes
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // Listen for search events from SearchInput component
  useEffect(() => {
    const handleSearchQueryChanged = (event: CustomEvent) => {
      const query = event.detail.query
      currentSearchQuery.current = query

      if (!query) {
        setFilteredConversations(conversations)
      } else {
        const filtered = conversations.filter(convo =>
          convo.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredConversations(filtered)
      }
    }

    window.addEventListener('searchQueryChanged', handleSearchQueryChanged as EventListener)
    return () => {
      window.removeEventListener('searchQueryChanged', handleSearchQueryChanged as EventListener)
    }
  }, [conversations])

  // Handle message send - WebSocket only (backend doesn't support HTTP message sending)
  const handleMessageSend = async (message: string) => {
    if (!activeChat || !currentUser) return

    // Send message via WebSocket only
    const success = sendMessage({
      type: 'send_message',
      chat_id: activeChat.chatId,
      content: message
    })

    if (success) {
      console.log('Message sent via WebSocket')

      // Don't add to local state - wait for WebSocket response to avoid duplicates
      // The message will be added when we receive it back from the server

      // Only update conversation list timestamp
      setConversations(prev => prev.map(conv =>
        conv.chatId === activeChat.chatId
          ? { ...conv, lastMessage: message, timestamp: formatTimestamp(new Date().toISOString()) }
          : conv
      ))
    } else {
      console.error('Failed to send message via WebSocket')
      setError('Failed to send message - WebSocket not connected')
    }
  }

  // Handle chat selection
  const handleChatSelect = (conversation: ConversationListItem) => {
    setActiveChat(conversation)
    setActiveChatMessages([])
    loadChatMessages(conversation.chatId)
    sendMessage({
      type: 'join_chat',
      chat_id: conversation.chatId
    })
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-[380px] md:w-[550px] lg:w-[380px] h-[520px] md:h-[600px] lg:h-[520px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {activeChat ? (
              // Inline ChatWindow
              <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between p-3 md:p-4 lg:p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 lg:h-8 lg:w-8" onClick={() => setActiveChat(null)}>
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 lg:h-4 lg:w-4" />
                  </Button>
                  <div className="flex items-center flex-1 justify-center">
                    <Avatar className="h-6 w-6 md:h-8 md:w-8 lg:h-6 lg:w-6 mr-2 overflow-hidden">
                      <AvatarImage className="h-full w-full object-cover" src={activeChat?.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="text-xs md:text-xs lg:text-xs">{activeChat?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium text-sm md:text-base lg:text-sm text-gray-900 dark:text-gray-100">{activeChat?.name}</p>
                      <p className="text-xs md:text-sm lg:text-xs text-gray-500 dark:text-gray-400">
                        {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 lg:h-8 lg:w-8">
                    <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5 lg:h-4 lg:w-4" />
                  </Button>
                </div>
                <div className="flex-1 p-4 md:p-5 lg:p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  {loading && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm md:text-base">Loading messages...</p>
                    </div>
                  )}
                  {error && (
                    <div className="text-center text-red-500 mb-4">
                      <p className="text-sm md:text-base">{error}</p>
                    </div>
                  )}
                  <div className="space-y-3 md:space-y-4 lg:space-y-3">
                    {activeChatMessages.map((msg) => (
                      <div key={msg.id} className={cn('flex items-end gap-2', msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start')}>
                        {msg.sender_id !== currentUser?.id && (
                          <Avatar className="h-5 w-5 overflow-hidden">
                            <AvatarImage className="h-full w-full object-cover" src={(msg.sender?.profile?.profile_picture as string) || (msg.sender as any)?.avatar || activeChat?.avatar || '/placeholder.svg'} />
                            <AvatarFallback className="text-xs">
                              {msg.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col max-w-xs">
                          {msg.sender_id !== currentUser?.id && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">{msg.sender.name}</p>
                          )}
                          <div className={cn('px-3 py-2 rounded-2xl text-sm shadow-sm', msg.sender_id === currentUser?.id ? 'bg-blue-500 text-white rounded-br-md ml-auto' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md')}>
                            {msg.content}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-3">{formatTimestamp(msg.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <MessageInput
                    onSendMessage={handleMessageSend}
                    connectionStatus={connectionStatus}
                  />
                </div>
              </div>
            ) : (
              // Inline ChatList
              <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between p-3 md:p-4 lg:p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 lg:h-8 lg:w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4 md:h-5 md:w-5 lg:h-4 lg:w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <p className="font-medium text-sm md:text-base lg:text-sm text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                      Pesan
                      {connectionStatus === 'connected' && <span className="text-green-500 text-xs md:text-sm lg:text-xs">● Terhubung</span>}
                      {connectionStatus === 'connecting' && <span className="text-yellow-500 text-xs md:text-sm lg:text-xs">● Menghubungkan...</span>}
                      {connectionStatus === 'disconnected' && <span className="text-red-500 text-xs md:text-sm lg:text-xs">● Terputus</span>}
                      {connectionStatus === 'error' && <span className="text-red-500 text-xs md:text-sm lg:text-xs">● Error</span>}
                    </p>
                  </div>
                  <div className="w-8 md:w-10 lg:w-8"></div>
                </div>
                <div className="p-3 md:p-4 lg:p-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <SearchInput />
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                  {loading && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Loading conversations...</p>
                    </div>
                  )}
                  {error && (
                    <div className="p-6 text-center text-red-500">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  {!loading && filteredConversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {conversations.length === 0 ? 'Belum ada percakapan' : 'Tidak ada percakapan ditemukan'}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map(convo => (
                      <div
                        key={convo.id}
                        className="p-3 md:p-4 lg:p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                        onClick={() => handleChatSelect(convo)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 lg:h-10 lg:w-10 mr-3 overflow-hidden">
                            <AvatarImage className="h-full w-full object-cover" src={convo.avatar || '/placeholder.svg'} />
                            <AvatarFallback className="md:text-base lg:text-sm">{convo.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {convo.isOnline && (
                            <div className="absolute bottom-0 right-2 w-3 h-3 md:w-4 md:h-4 lg:w-3 lg:h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm md:text-base lg:text-sm truncate text-gray-900 dark:text-gray-100">{convo.name}</p>
                            <p className="text-xs md:text-sm lg:text-xs text-gray-500 dark:text-gray-400">{convo.timestamp}</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs md:text-sm lg:text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">{convo.lastMessage}</p>
                            {convo.unread > 0 && (
                              <div className="h-5 w-5 md:h-6 md:w-6 lg:h-5 lg:w-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm lg:text-xs font-medium">
                                {convo.unread}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          className="rounded-2xl w-14 h-14 shadow-lg flex items-center justify-center relative bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={isOpen ? 'x' : 'message'}
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>

          {!isOpen && totalUnreadUsers > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-medium text-white">
              {totalUnreadUsers > 9 ? '9+' : totalUnreadUsers}
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
