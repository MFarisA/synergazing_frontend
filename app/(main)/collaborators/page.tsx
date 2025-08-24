"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, MessageCircle, Search, Send, X } from "lucide-react"
import Link from "next/link"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { api } from "@/lib/api"
import { useWebSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"

// Type definition for collaborator from API
interface Collaborator {
	id: number;
	name: string;
	email?: string;
	phone?: string;
	profile_picture: string;
	about_me: string;
	location: string;
	interests: string;
	academic: string;
	skills: Array<{
		id: number;
		skill: {
			id: number;
			name: string;
		};
		proficiency: number;
	}>;
}

// Chat message interface
interface ChatMessage {
	id: number;
	chat_id: number;
	sender_id: number;
	content: string;
	is_read: boolean;
	created_at: string;
	sender: {
		id: number;
		name: string;
	};
}

// Chat interface
interface Chat {
	id: number;
	user1_id: number;
	user2_id: number;
	created_at: string;
	updated_at: string;
}

export default function CollaboratorsPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
	const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)
	const [collaborators, setCollaborators] = useState<Collaborator[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Chat state
	const [currentChat, setCurrentChat] = useState<Chat | null>(null)
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
	const [newMessage, setNewMessage] = useState("")
	const [isLoadingChat, setIsLoadingChat] = useState(false)
	const [isSendingMessage, setIsSendingMessage] = useState(false)
	const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null)

	// WebSocket
	const { connectionStatus, lastMessage, connect, disconnect, sendMessage } = useWebSocket()

	// Refs
	const chatEndRef = useRef<HTMLDivElement>(null)

	// Get current user from localStorage
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			// Decode token to get user info (or fetch from API)
			try {
				const payload = JSON.parse(atob(token.split('.')[1]));
				setCurrentUser({ id: payload.user_id, name: payload.name || 'You' });
				
				// Connect to WebSocket
				connect(payload.user_id, token);
			} catch (err) {
				console.error('Failed to decode token:', err);
			}
		}
	}, [connect]);

	// Handle WebSocket messages
	useEffect(() => {
		if (lastMessage) {
			switch (lastMessage.type) {
				case 'new_message':
					if (lastMessage.data && currentChat && lastMessage.data.chat_id === currentChat.id) {
						setChatMessages(prev => {
							// Check if message already exists to avoid duplicates
							const messageData = lastMessage.data as unknown as ChatMessage;
							const exists = prev.some(msg => msg.id === messageData.id);
							if (exists) return prev;
							
							return [...prev, messageData];
						});
					}
					break;
				case 'connected':
					console.log('WebSocket connected successfully');
					break;
				case 'error':
					console.error('WebSocket error:', lastMessage.data?.error);
					break;
				default:
					console.log('Unknown message type:', lastMessage.type);
			}
		}
	}, [lastMessage, currentChat]);

	// Scroll to bottom when new messages arrive
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [chatMessages]);

	// Cleanup WebSocket on unmount
	useEffect(() => {
		return () => {
			disconnect();
		};
	}, [disconnect]);

	// Fetch collaborators on component mount
	useEffect(() => {
		const fetchCollaborators = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("Please log in to view collaborators");
					setIsLoading(false);
					return;
				}

				const response = await api.getCollaborators(token);
				console.log('Collaborators API response:', response);
				
				 // The API returns: { data: {...}, message: "Ready users retrieved successfully", success: true }
				// But the actual users array is inside response.data.users
				let collaboratorsData;
				
				if (response.data && response.data.users) {
					// Handle paginated response structure
					collaboratorsData = response.data.users;
				} else if (response.data && Array.isArray(response.data)) {
					// Handle direct array response
					collaboratorsData = response.data;
				} else if (Array.isArray(response)) {
					// Handle direct array response
					collaboratorsData = response;
				} else {
					// Fallback
					collaboratorsData = [];
				}
				
				console.log('Extracted collaborators data:', collaboratorsData);
				console.log('Number of collaborators:', collaboratorsData.length);
				
				// Debug each collaborator's profile data
				collaboratorsData.forEach((collaborator: Record<string, unknown>, index: number) => {
					console.log(`Collaborator ${index + 1}:`, {
						name: collaborator.name,
						profile: collaborator.profile,
						user_skills: collaborator.user_skills,
						interests: (collaborator.profile as Record<string, unknown>)?.interests,
						location: (collaborator.profile as Record<string, unknown>)?.location,
						about_me: (collaborator.profile as Record<string, unknown>)?.about_me
					});
				});
				
				setCollaborators(collaboratorsData);
				setError(null);
			} catch (err) {
				console.error('Error fetching collaborators:', err);
				setError('Failed to load collaborators');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCollaborators();
	}, []);

	// Initialize chat when collaborator is selected
	const initializeChat = async (collaborator: Collaborator) => {
		try {
			setIsLoadingChat(true);
			const token = localStorage.getItem("token");
			if (!token) {
				throw new Error("No authentication token found");
			}

			// Get or create chat with the collaborator
			const chatResponse = await api.getChatWithUser(token, collaborator.id);
			console.log('Chat response:', chatResponse);

			if (chatResponse.success && chatResponse.data) {
				const chat = chatResponse.data;
				setCurrentChat(chat);

				// Load messages for this chat
				const messagesResponse = await api.getChatMessages(token, chat.id);
				console.log('Messages response:', messagesResponse);

				if (messagesResponse.success && messagesResponse.data) {
					setChatMessages(messagesResponse.data.messages || []);
				}

				// Join chat via WebSocket
				if (connectionStatus === 'connected') {
					sendMessage({
						type: 'join_chat',
						chat_id: chat.id
					});
				}
			}
		} catch (err) {
			console.error('Error initializing chat:', err);
			setError('Failed to initialize chat');
		} finally {
			setIsLoadingChat(false);
		}
	};

	// Send message function
	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !currentChat || isSendingMessage) return;

		try {
			setIsSendingMessage(true);

			// Send via WebSocket
			const success = sendMessage({
				type: 'send_message',
				chat_id: currentChat.id,
				content: newMessage.trim()
			});

			if (success) {
				setNewMessage("");
			} else {
				throw new Error('Failed to send message via WebSocket');
			}
		} catch (err) {
			console.error('Error sending message:', err);
		} finally {
			setIsSendingMessage(false);
		}
	};

	// Handle collaborator contact button
	const handleContactCollaborator = async (collaborator: Collaborator) => {
		setSelectedCollaborator(collaborator);
		await initializeChat(collaborator);
		setIsMessageModalOpen(true);
	};

	// Close chat modal
	const handleCloseChat = () => {
		setIsMessageModalOpen(false);
		setSelectedCollaborator(null);
		setCurrentChat(null);
		setChatMessages([]);
		setNewMessage("");
	};

	// Extract all skills from collaborators for filtering
	const allSkills = Array.from(
		new Set(
			collaborators.flatMap(collaborator => 
				(collaborator.skills || []).map(userSkill => userSkill.skill.name)
			)
		)
	).sort();

	const filteredCollaborators = collaborators.filter((collaborator) => {
		const searchableText = [
			collaborator.name,
			collaborator.interests || '',
			collaborator.about_me || '',
			collaborator.academic || ''
		].join(' ').toLowerCase();

		const matchesSearch = searchTerm === '' || searchableText.includes(searchTerm.toLowerCase());

		const collaboratorSkills = (collaborator.skills || []).map(userSkill => userSkill.skill.name);
		const matchesSkills = selectedSkills.length === 0 || 
			selectedSkills.every((skill) => collaboratorSkills.includes(skill));

		return matchesSearch && matchesSkills;
	});

	const handleSkillToggle = (skill: string) => {
		setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-3 mx-auto"></div>
					<p className="text-sm text-gray-500">Memuat kolaborator...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Kolaborator Tidak Ditemukan</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>
						Coba Lagi
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ">
			{/* Header */}

			<div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Sidebar Filters */}
				<aside className="lg:col-span-1 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Cari Kolaborator</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative">
								<Input
									placeholder="Cari nama, skill, atau peran..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
								<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Filter berdasarkan Skill</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="max-h-60 overflow-y-auto space-y-2 pr-2">
								{allSkills.map((skill) => (
									<div key={skill} className="flex items-center space-x-2">
										<Checkbox
											id={skill}
											checked={selectedSkills.includes(skill)}
											onCheckedChange={() => handleSkillToggle(skill)}
										/>
										<label
											htmlFor={skill}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{skill}
										</label>
									</div>
								))}
							</div>
							{selectedSkills.length > 0 && (
								<Button variant="outline" size="sm" onClick={() => setSelectedSkills([])} className="w-full mt-3">
									Clear All
								</Button>
							)}
						</CardContent>
					</Card>
				</aside>

				{/* Main Content - Collaborator List */}
				<main className="lg:col-span-3 space-y-6">
					<h2 className="text-xl font-semibold">Kolaborator Siap ({filteredCollaborators.length})</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{filteredCollaborators.map((collaborator) => (
							<Card key={collaborator.id} className="hover:shadow-lg transition-shadow h-full">
								<CardContent className="p-6 flex flex-col items-center text-center h-full">
									<Avatar className="h-24 w-24 mb-4">
										<AvatarImage src={collaborator.profile_picture || "/placeholder.svg"} alt={collaborator.name} />
										<AvatarFallback className="text-3xl">
											{collaborator.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<h3 className="text-xl font-bold">{collaborator.name}</h3>
									<p className="text-md text-gray-600 mb-2">{collaborator.interests || 'No title specified'}</p>
									<div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
										<MapPin className="h-4 w-4" />
										<span>{collaborator.location || 'Location not specified'}</span>
									</div>
									<div className="flex flex-wrap justify-center gap-1 mb-4">
										{(collaborator.skills || []).slice(0, 4).map((userSkill) => (
											<Badge key={userSkill.id} variant="secondary" className="text-xs">
												{userSkill.skill.name}
											</Badge>
										))}
										{(collaborator.skills || []).length > 4 && (
											<Badge variant="outline" className="text-xs">
												+{(collaborator.skills || []).length - 4} more
											</Badge>
										)}
									</div>
									<p className="text-sm text-gray-700 mb-4 line-clamp-2 break-words">
										{collaborator.about_me || 'No description available'}
									</p>
									<div className="flex gap-2 w-full mt-auto">
										<Link href={`/profile/${collaborator.id}`} passHref className="flex-1">
											<Button
												variant="default"
												className="w-full"
												onClick={() => {
													setSelectedCollaborator(collaborator)
													// Navigate to profile page instead of opening modal
												}}
											>
												Detail User
											</Button>
										</Link>
										<Button
											variant="outline"
											className="flex-1 w-full bg-transparent"
											onClick={() => handleContactCollaborator(collaborator)}
										>
											<MessageCircle className="h-4 w-4 mr-2" />
											Hubungi
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
						{filteredCollaborators.length === 0 && (
							<div className="col-span-full text-center text-gray-500 py-10">
								{searchTerm || selectedSkills.length > 0 
									? "Tidak ada kolaborator yang ditemukan dengan kriteria ini."
									: "Belum ada kolaborator yang siap berkolaborasi."
								}
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Chat Modal */}
			{selectedCollaborator && (
				<AnimatedModal
					isOpen={isMessageModalOpen}
					onClose={handleCloseChat}
					showCloseButton={false}
					className="max-w-lg h-[600px]"
				>
					<div className="flex flex-col h-full">
						{/* Chat Header */}
						<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
							<div className="flex items-center gap-3">
								<Avatar className="h-10 w-10">
									<AvatarImage src={selectedCollaborator.profile_picture || "/placeholder.svg"} />
									<AvatarFallback>
										{selectedCollaborator.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div>
									<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
										{selectedCollaborator.name}
									</h2>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{connectionStatus === 'connected' ? 'Online' : 'Offline'}
									</p>
								</div>
							</div>
							<Button variant="ghost" size="icon" onClick={handleCloseChat}>
								<X className="h-5 w-5" />
							</Button>
						</div>

						{/* Chat Messages */}
						<div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
							{isLoadingChat ? (
								<div className="flex items-center justify-center h-full">
									<div className="text-center">
										<div className="w-6 h-6 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-2 mx-auto"></div>
										<p className="text-sm text-gray-500">Memuat percakapan...</p>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									{chatMessages.length === 0 ? (
										<div className="text-center text-gray-500 dark:text-gray-400 py-8">
											<MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
											<p>Mulai percakapan dengan {selectedCollaborator.name}</p>
										</div>
									) : (
										chatMessages.map((message) => {
											const isSent = currentUser && message.sender_id === currentUser.id;
											return (
												<div
													key={message.id}
													className={cn(
														"flex items-end gap-2",
														isSent ? "justify-end" : "justify-start"
													)}
												>
													{!isSent && (
														<Avatar className="h-6 w-6">
															<AvatarImage src={selectedCollaborator.profile_picture || "/placeholder.svg"} />
															<AvatarFallback className="text-xs">
																{selectedCollaborator.name.charAt(0)}
															</AvatarFallback>
														</Avatar>
													)}
													<div className="flex flex-col max-w-xs">
														<div
															className={cn(
																"px-3 py-2 rounded-lg text-sm shadow-sm",
																isSent
																	? "bg-blue-500 text-white rounded-br-sm"
																	: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
															)}
														>
															{message.content}
														</div>
														<p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-3">
															{new Date(message.created_at).toLocaleTimeString('id-ID', {
																hour: '2-digit',
																minute: '2-digit'
															})}
														</p>
													</div>
												</div>
											);
										})
									)}
									<div ref={chatEndRef} />
								</div>
							)}
						</div>

						{/* Message Input */}
						<div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
							<form onSubmit={handleSendMessage} className="flex gap-2">
								<Input
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									placeholder="Ketik pesan..."
									className="flex-1"
									disabled={connectionStatus !== 'connected' || isSendingMessage}
								/>
								<Button 
									type="submit" 
									size="icon"
									disabled={!newMessage.trim() || connectionStatus !== 'connected' || isSendingMessage}
								>
									{isSendingMessage ? (
										<div className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
								</Button>
							</form>
							{connectionStatus !== 'connected' && (
								<p className="text-xs text-red-500 mt-2">
									Koneksi terputus. Mencoba menyambung kembali...
								</p>
							)}
						</div>
					</div>
				</AnimatedModal>
			)}
		</div>
	)
}
