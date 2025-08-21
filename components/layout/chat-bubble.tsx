'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Search, X, ChevronLeft, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// --- DATA AWAL (INITIAL DATA) ---
const initialConversationsData = [
  {
    id: 1,
    name: 'Sari Rahayu',
    avatar: '/placeholder.svg?height=40&width=40&text=SR',
    title: 'UI/UX Designer',
    lastMessage: 'Oke, saya akan cek proposalnya sekarang.',
    timestamp: '10:40 AM',
    unread: 2,
    isOnline: true,
    messages: [
      { id: 1, sender: 'them', text: 'Halo Adit, sudah lihat proposal yang saya kirimkan untuk proyek Kampanye Sosial?', timestamp: '10:35 AM' },
      { id: 2, sender: 'me', text: 'Halo Sari, belum sempat nih. Sebentar saya buka ya.', timestamp: '10:38 AM' },
      { id: 3, sender: 'them', text: 'Oke, saya akan cek proposalnya sekarang.', timestamp: '10:40 AM' },
    ],
  },
  {
    id: 2,
    name: 'Budi Santoso',
    avatar: '/placeholder.svg?height=40&width=40&text=BS',
    title: 'Frontend Developer',
    lastMessage: 'Siap, ditunggu kabarnya!',
    timestamp: 'Kemarin',
    unread: 0,
    isOnline: false,
    messages: [
        { id: 1, sender: 'me', text: 'Bro, tertarik join proyek Smart Campus IoT?', timestamp: 'Kemarin 14:20' },
        { id: 2, sender: 'them', text: 'Wah, boleh juga. Coba kirim detailnya dong.', timestamp: 'Kemarin 14:25' },
    ]
  },
  {
    id: 4,
    name: 'Tim Proyek Smart Campus',
    avatar: '/placeholder.svg?height=40&width=40&text=SC',
    title: 'Group Chat',
    lastMessage: 'Meeting dimulai dalam 10 menit',
    timestamp: '1 jam lalu',
    unread: 3,
    isOnline: true,
    isGroup: true,
    messages: [
      { id: 1, sender: 'them', text: 'Jangan lupa meeting jam 2 siang ini ya.', timestamp: '3 jam lalu', senderName: 'John Doe' },
      { id: 2, sender: 'me', text: 'Siap, sudah siap materinya.', timestamp: '2 jam lalu' },
      { id: 3, sender: 'them', text: 'Meeting dimulai dalam 10 menit', timestamp: '1 jam lalu', senderName: 'Jane Smith' },
    ]
  },
]

type Conversation = typeof initialConversationsData[0]

export function ChatBubble() {
  const [conversations, setConversations] = useState(initialConversationsData);
  const [isOpen, setIsOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === '' || !activeChat) return

    const newMessageObj = {
      id: Date.now(),
      sender: 'me' as const,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedConversations = conversations.map(convo => {
      if (convo.id === activeChat.id) {
        return {
          ...convo,
          messages: [...convo.messages, newMessageObj],
          lastMessage: newMessage,
          timestamp: newMessageObj.timestamp,
        };
      }
      return convo;
    });

    setConversations(updatedConversations);

    const updatedActiveChat = updatedConversations.find(c => c.id === activeChat.id);
    if (updatedActiveChat) {
      setActiveChat(updatedActiveChat);
    }
    
    setNewMessage('');
  }

  const filteredConversations = conversations.filter(convo =>
    convo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalUnread = conversations.reduce((sum, convo) => sum + convo.unread, 0)

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
              {activeChat?.isGroup ? `${activeChat.title}` : activeChat?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="space-y-3">
          {activeChat?.messages.map((msg) => (
            <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
              {msg.sender === 'them' && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={activeChat.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {activeChat.isGroup && msg.senderName ? msg.senderName.charAt(0) : activeChat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col max-w-xs">
                {activeChat.isGroup && msg.sender === 'them' && msg.senderName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">{msg.senderName}</p>
                )}
                <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm", msg.sender === 'me' ? 'bg-blue-500 text-white rounded-br-md ml-auto' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md')}>
                  {msg.text}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-3">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan..." className="pr-10 rounded-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800" autoComplete="off" />
            <Button type="submit" size="icon" disabled={!newMessage.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full">
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
        <div className="flex-1 text-center"><p className="font-medium text-sm text-gray-900 dark:text-gray-100">Pesan</p></div>
        <div className="w-8"></div>
      </div>
      <div className="p-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari pesan..." className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada percakapan ditemukan</p>
          </div>
        ) : (
          filteredConversations.map(convo => (
            <div key={convo.id} className="p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0" onClick={() => setActiveChat(convo)}>
              <div className="relative">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={convo.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {convo.isOnline && !convo.isGroup && (<div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{convo.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{convo.timestamp}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">{convo.lastMessage}</p>
                  {convo.unread > 0 && (<div className="h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">{convo.unread}</div>)}
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
