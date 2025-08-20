"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { AnimatedModal } from "@/components/ui/animated-modal"
import { api } from "@/lib/api"

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

export default function CollaboratorsPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
	const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)
	const [collaborators, setCollaborators] = useState<Collaborator[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Fetch collaborators on component mount
	useEffect(() => {
		const fetchCollaborators = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) {
					setError("Authentication required");
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
				collaboratorsData.forEach((collaborator, index) => {
					console.log(`Collaborator ${index + 1}:`, {
						name: collaborator.name,
						profile: collaborator.profile,
						user_skills: collaborator.user_skills,
						interests: collaborator.profile?.interests,
						location: collaborator.profile?.location,
						about_me: collaborator.profile?.about_me
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
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Collaborators</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>
						Try Again
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
											onClick={() => {
												setSelectedCollaborator(collaborator)
												setIsMessageModalOpen(true)
											}}
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

			{/* Message Modal */}
			{selectedCollaborator && (
				<AnimatedModal
					isOpen={isMessageModalOpen}
					onClose={() => setIsMessageModalOpen(false)}
					showCloseButton={true}
					className="max-w-lg"
				>
					<div className="p-6">
						<h2 className="text-2xl font-bold mb-4">Komunikasi Dengan {selectedCollaborator.name}</h2>
						<div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 flex flex-col-reverse">
							{/* Chat messages will go here */}
							<div className="text-center text-gray-500 text-sm">
								Mulai Komunikasi Dengan {selectedCollaborator.name}
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<Input placeholder="Ketik Pesanmu..." className="flex-grow" />
							<Button>Kirim</Button>
						</div>
					</div>
				</AnimatedModal>
			)}
		</div>
	)
}
