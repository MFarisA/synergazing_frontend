'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Search, X, ChevronLeft, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWebSocket } from '@/lib/socket'
import { api } from '@/lib/api'
import { Chat, ChatMessage, ConversationListItem, ChatUser } from '@/types'

export function ChatBubble() {
  // State management
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<ConversationListItem | null>(null)
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [totalUnread, setTotalUnread] = useState(0)
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // WebSocket hook
  const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket()

  // Get auth token and user info from localStorage
  const getAuthData = useCallback(() => {
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
  }, [])

  // Check authentication status
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

    // Listen for auth changes (login/logout)
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
  }, [connect, disconnect, getAuthData])

  // Load messages when opening a chat (memoized to prevent recreating)
  const loadChatMessages = useCallback(async (chatId: number) => {
    const authData = getAuthData()
    if (!authData) return

    try {
      const response = await api.getChatMessages(authData.token, chatId)
      if (response.success && response.data?.messages) {
        // Messages come in DESC order (newest first), reverse for display
        const messages = response.data.messages.reverse()
        setActiveChatMessages(messages)

        // Mark messages as read
        await api.markMessagesAsRead(authData.token, chatId)
        
        // Send WebSocket message to mark as read
        sendMessage({
          type: 'mark_read',
          chat_id: chatId
        })
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error)
      setError('Failed to load messages')
    }
  }, [getAuthData, sendMessage])

  // Listen for custom events from chat dialog (stable dependencies)
  useEffect(() => {
    if (!isAuthenticated) return

    const handleStartChat = (event: CustomEvent) => {
      const { chatId, creatorId, creatorName, creatorAvatar, message, projectTitle } = event.detail
      
      // Create conversation item for the new chat
      const newConversation: ConversationListItem = {
        id: chatId,
        name: creatorName,
        avatar: creatorAvatar || '/placeholder.svg',
        title: 'Project Creator',
        lastMessage: message,
        timestamp: formatTimestamp(new Date().toISOString()),
        unread: 0,
        isOnline: false,
        chatId: chatId,
        otherUserId: creatorId
      }

      // Add to conversations if not already exists
      setConversations(prev => {
        const exists = prev.find(conv => conv.chatId === chatId)
        if (exists) {
          // Update existing conversation
          return prev.map(conv => 
            conv.chatId === chatId 
              ? { ...conv, lastMessage: message, timestamp: formatTimestamp(new Date().toISOString()) }
              : conv
          )
        }
        return [newConversation, ...prev]
      })

      // Open chat bubble and select the conversation
      setIsOpen(true)
      setActiveChat(newConversation)
      
      // Load existing messages for this chat
      loadChatMessages(chatId)

      // Send the message via WebSocket
      setTimeout(() => {
        sendMessage({
          type: 'send_message',
          chat_id: chatId,
          content: message
        })
      }, 1000) // Small delay to ensure WebSocket is ready and chat is loaded
    }

    // Add event listener
    window.addEventListener('startChat', handleStartChat as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('startChat', handleStartChat as EventListener)
    }
  }, [isAuthenticated, loadChatMessages, sendMessage])

  // Load initial chat data (stable dependencies)
  const loadChatData = useCallback(async () => {
    if (!isAuthenticated) return
    
    const authData = getAuthData()
    if (!authData) return

    try {
      setLoading(true)
      setError(null)

      // Load chat list and unread count in parallel
      const [chatsResponse, unreadResponse] = await Promise.all([
        api.getChatList(authData.token),
        api.getUnreadCount(authData.token)
      ])

      if (chatsResponse.success && chatsResponse.data) {
        const chats: Chat[] = chatsResponse.data
        const conversationList = transformChatsToConversations(chats, authData.user.id)
        setConversations(conversationList)
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
  }, [isAuthenticated, getAuthData])

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChatData()
    }
  }, [isAuthenticated, loadChatData])

  // Transform backend Chat data to ConversationListItem (moved outside to prevent recreation)
  const transformChatsToConversations = useCallback((chats: Chat[], currentUserId: number): ConversationListItem[] => {
    return chats.map(chat => {
      const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1
      const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null
      
      return {
        id: chat.id,
        name: otherUser.name,
        avatar: otherUser.profile?.profile_picture || '/placeholder.svg',
        title: 'Collaborator', // You might want to get this from user profile
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage ? formatTimestamp(lastMessage.created_at) : formatTimestamp(chat.created_at),
        unread: 0, // Will be updated by real-time messages
        isOnline: false, // You might want to implement presence system
        chatId: chat.id,
        otherUserId: otherUser.id
      }
    })
  }, [])

  // Format timestamp for display (moved outside to prevent recreation)
  const formatTimestamp = useCallback((timestamp: string): string => {
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
  }, [])

  // Handle WebSocket messages (stable dependencies)
  useEffect(() => {
    if (!lastMessage || !isAuthenticated) return

    switch (lastMessage.type) {
      case 'new_message':
        handleNewMessage(lastMessage.data)
        break
      case 'messages_marked_read':
        handleMessagesMarkedRead(lastMessage.data)
        break
      case 'connected':
        console.log('WebSocket connected successfully')
        break
      case 'error':
        console.error('WebSocket error:', lastMessage.data?.error)
        setError(lastMessage.data?.error || 'WebSocket error occurred')
        break
      default:
        console.log('Unknown WebSocket message type:', lastMessage.type)
    }
  }, [lastMessage, isAuthenticated])

  const handleNewMessage = useCallback((messageData: any) => {
    const newMsg: ChatMessage = {
      id: messageData.id,
      chat_id: messageData.chat_id,
      sender_id: messageData.sender_id,
      content: messageData.content,
      is_read: messageData.is_read,
      created_at: messageData.created_at,
      updated_at: messageData.created_at,
      sender: {
        id: messageData.sender.id,
        name: messageData.sender.name
      }
    }

    // Update active chat messages if this message belongs to active chat
    setActiveChatMessages(prev => {
      if (activeChat && newMsg.chat_id === activeChat.chatId) {
        return [...prev, newMsg]
      }
      return prev
    })

    // Update conversation list with new last message
    setConversations(prev => 
      prev.map(conv => {
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
    )

    // Update total unread count if message is not from current user
    if (newMsg.sender_id !== currentUser?.id) {
      setTotalUnread(prev => prev + 1)
    }
  }, [activeChat, currentUser, formatTimestamp])

  const handleMessagesMarkedRead = useCallback((data: any) => {
    const chatId = data.chat_id
    
    // Reset unread count for the specific chat
    setConversations(prev =>
      prev.map(conv => 
        conv.chatId === chatId ? { ...conv, unread: 0 } : conv
      )
    )

    // Recalculate total unread count
    setConversations(prev => {
      const newTotal = prev.reduce((sum, conv) => 
        conv.chatId === chatId ? sum : sum + conv.unread, 0
      )
      setTotalUnread(newTotal)
      return prev
    })
  }, [])

  const handleChatSelect = useCallback((conversation: ConversationListItem) => {
    setActiveChat(conversation)
    setActiveChatMessages([])
    loadChatMessages(conversation.chatId)
    
    // Join chat via WebSocket
    sendMessage({
      type: 'join_chat',
      chat_id: conversation.chatId
    })
  }, [loadChatMessages, sendMessage])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '' || !activeChat || !currentUser) return

    // Send message via WebSocket
    const success = sendMessage({
      type: 'send_message',
      chat_id: activeChat.chatId,
      content: newMessage.trim()
    })

    if (success) {
      setNewMessage('')
    } else {
      setError('Failed to send message. Please check your connection.')
    }
  }, [newMessage, activeChat, currentUser, sendMessage])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChatMessages])

  // Filter conversations based on search (memoized to prevent recreation)
  const filteredConversations = useMemo(() => {
    return conversations.filter(convo =>
      convo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  const ChatWindow = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveChat(null)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center flex-1 justify-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={activeChat?.avatar || "/placeholder.svg"} />
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
            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start')}>
              {msg.sender_id !== currentUser?.id && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={activeChat?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {msg.sender.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col max-w-xs">
                {msg.sender_id !== currentUser?.id && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">{msg.sender.name}</p>
                )}
                <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm", msg.sender_id === currentUser?.id ? 'bg-blue-500 text-white rounded-br-md ml-auto' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md')}>
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
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              placeholder="Ketik pesan..." 
              className="pr-10 rounded-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800" 
              autoComplete="off"
              disabled={connectionStatus !== 'connected'}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newMessage.trim() || connectionStatus !== 'connected'} 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  const ChatList = () => (
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari pesan..." 
            className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
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
              {searchQuery ? 'Tidak ada percakapan ditemukan' : 'Belum ada percakapan'}
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
                  <AvatarImage src={convo.avatar || "/placeholder.svg"} />
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
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[380px] h-[520px] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {activeChat ? <ChatWindow /> : <ChatList />}
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
              key={isOpen ? "x" : "message"}
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
