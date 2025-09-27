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
import { getChatMessages, markMessagesAsRead, getUnreadCount, getChatList } from '@/lib/api/chat-message'

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
  const [totalUnread, setTotalUnread] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filteredConversations, setFilteredConversations] = useState<ConversationListItem[]>([])
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // WebSocket hook
  const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket()

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

  // Initialize auth - run once
  useEffect(() => {
    const checkAuth = () => {
      const authData = getAuthData()
      if (authData) {
        setCurrentUser({ id: authData.user.id, name: authData.user.name })
        setIsAuthenticated(true)
        connect(authData.user.id, authData.token)
      } else {
        setIsAuthenticated(false)
        setCurrentUser(null)
        disconnect()
      }
    }

    checkAuth()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      disconnect()
    }
  }, [connect, disconnect])

  // Load chat messages
  const loadChatMessages = async (chatId: number) => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const response = await getChatMessages(authData.token, chatId)
      if (response.success && response.data?.messages) {
        const messages = response.data.messages.reverse()
        setActiveChatMessages(messages)
        await markMessagesAsRead(authData.token, chatId)
        sendMessage({ type: 'mark_read', chat_id: chatId })
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

      setTimeout(() => {
        sendMessage({
          type: 'send_message',
          chat_id: chatId,
          content: message
        })
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

        const [chatsResponse, unreadResponse] = await Promise.all([
          getChatList(authData.token),
          getUnreadCount(authData.token)
        ])

        if (chatsResponse.success && chatsResponse.data) {
          const chats: Chat[] = chatsResponse.data
          const conversationList = chats.map(chat => {
            const otherUser = chat.user1_id === authData.user.id ? chat.user2 : chat.user1
            const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null
            
            return {
              id: chat.id,
              name: otherUser.name,
              avatar: otherUser.profile?.profile_picture || '/placeholder.svg',
              title: 'Collaborator',
              lastMessage: lastMessage?.content || 'No messages yet',
              timestamp: lastMessage ? formatTimestamp(lastMessage.created_at) : formatTimestamp(chat.created_at),
              unread: 0,
              isOnline: false,
              chatId: chat.id,
              otherUserId: otherUser.id
            }
          })
          setConversations(conversationList)
          setFilteredConversations(conversationList)
        }

        if (unreadResponse.success && unreadResponse.data) {
          setTotalUnread(unreadResponse.data.unread_count || 0)
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
          name: (messageData.sender as Record<string, unknown>).name as string
        }
      }

      if (activeChat && newMsg.chat_id === activeChat.chatId) {
        setActiveChatMessages(prev => [...prev, newMsg])
      }

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.chatId === newMsg.chat_id) {
            return {
              ...conv,
              lastMessage: newMsg.content,
              timestamp: formatTimestamp(newMsg.created_at),
              unread: newMsg.sender_id !== currentUser?.id ? conv.unread + 1 : conv.unread
            }
          }
          return conv
        })
        setFilteredConversations(updated) // Update filtered list too
        return updated
      })

      if (newMsg.sender_id !== currentUser?.id) {
        setTotalUnread(prev => prev + 1)
      }
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

  // Handle message send - stable callback
  const handleMessageSend = (message: string) => {
    if (!activeChat || !currentUser) return

    sendMessage({
      type: 'send_message',
      chat_id: activeChat.chatId,
      content: message
    })
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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-[380px] h-[520px] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {activeChat ? (
              // Inline ChatWindow
              <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveChat(null)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center flex-1 justify-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={activeChat?.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="text-xs">{activeChat?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{activeChat?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  {loading && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  )}
                  {error && (
                    <div className="text-center text-red-500 mb-4">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {activeChatMessages.map((msg) => (
                      <div key={msg.id} className={cn('flex items-end gap-2', msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start')}>
                        {msg.sender_id !== currentUser?.id && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activeChat?.avatar || '/placeholder.svg'} />
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
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Pesan {connectionStatus === 'connected' && <span className="text-green-500">●</span>}
                    </p>
                  </div>
                  <div className="w-8"></div>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
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
                        className="p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0" 
                        onClick={() => handleChatSelect(convo)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={convo.avatar || '/placeholder.svg'} />
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {convo.isOnline && (
                            <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{convo.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{convo.timestamp}</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">{convo.lastMessage}</p>
                            {convo.unread > 0 && (
                              <div className="h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
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
          
          {!isOpen && totalUnread > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-medium text-white">
              {totalUnread > 9 ? '9+' : totalUnread}
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
