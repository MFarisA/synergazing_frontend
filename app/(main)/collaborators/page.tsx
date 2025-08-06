"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { AnimatedModal } from "@/components/ui/animated-modal"

// Mock data for collaborators
const collaboratorsData = [
	{
		id: 1,
		name: "Budi Santoso",
		avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14647.jpg",
		title: "Frontend Developer",
		location: "Jakarta, Indonesia",
		skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
		isReadyForCollaboration: true,
		bio: "Passionate about building beautiful and performant user interfaces. Always looking for exciting new projects.",
		email: "budi.s@example.com",
		phone: "+62 812 3456 7890",
		experience: "5 years in web development, specializing in scalable single-page applications.",
		portfolio: "https://budi.dev",
	},
	{
		id: 2,
		name: "Citra Dewi",
		avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14100.jpg", // Updated avatar URL
		title: "UI/UX Designer",
		location: "Surabaya, Indonesia",
		skills: ["Figma", "Sketch", "User Research", "Prototyping"],
		isReadyForCollaboration: true,
		bio: "Creating intuitive and delightful user experiences is my passion. Let's build something amazing together!",
		email: "citra.d@example.com",
		phone: "+62 813 4567 8901",
		experience: "4 years in UI/UX design, with a strong focus on user-centered design principles.",
		portfolio: "https://citra.design",
	},
	{
		id: 3,
		name: "Dian Permata",
		avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14100.jpg", // Updated avatar URL
		title: "Backend Engineer",
		location: "Bandung, Indonesia",
		skills: ["Node.js", "Python", "MongoDB", "AWS"],
		isReadyForCollaboration: true,
		bio: "Experienced in scalable backend systems and API development. Open to collaborating on challenging projects.",
		email: "dian.p@example.com",
		phone: "+62 814 5678 9012",
		experience: "6 years building robust and efficient backend services for various industries.",
		portfolio: "https://dian.tech",
	},
	{
		id: 4,
		name: "Eko Prasetyo",
		avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14100.jpg", // Updated avatar URL
		title: "Mobile Developer",
		location: "Yogyakarta, Indonesia",
		skills: ["React Native", "Firebase", "Flutter", "Dart"],
		isReadyForCollaboration: true,
		bio: "Building cross-platform mobile applications is my expertise. Ready to join a dynamic team.",
		email: "eko.p@example.com",
		phone: "+62 815 6789 0123",
		experience: "3 years developing high-performance mobile apps for both Android and iOS.",
		portfolio: "https://eko.app",
	},
	{
		id: 5,
		name: "Fajar Nugroho",
		avatar: "https://mahasiswa.dinus.ac.id/images/foto/A/A11/2022/A11.2022.14100.jpg", // Updated avatar URL
		title: "Data Scientist",
		location: "Bandung, Indonesia",
		skills: ["Python", "Machine Learning", "Data Analysis", "TensorFlow"],
		isReadyForCollaboration: true,
		bio: "Turning data into actionable insights. Seeking projects in AI/ML and data-driven solutions.",
		email: "fajar.n@example.com",
		phone: "+62 816 7890 1234",
		experience: "7 years in data science, with a focus on predictive modeling and statistical analysis.",
		portfolio: "https://fajar.ai",
	},
]

export default function CollaboratorsPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSkills, setSelectedSkills] = useState<string[]>([])
	const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
	const [selectedCollaborator, setSelectedCollaborator] = useState<(typeof collaboratorsData)[0] | null>(null)

	const allSkills = Array.from(new Set(collaboratorsData.flatMap((c) => c.skills))).sort()

	const filteredCollaborators = collaboratorsData.filter((collaborator) => {
		const matchesSearch =
			collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			collaborator.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			collaborator.bio.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesSkills =
			selectedSkills.length === 0 || selectedSkills.every((skill) => collaborator.skills.includes(skill))

		return matchesSearch && matchesSkills && collaborator.isReadyForCollaboration
	})

	const handleSkillToggle = (skill: string) => {
		setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
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
										<AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
										<AvatarFallback className="text-3xl">
											{collaborator.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<h3 className="text-xl font-bold">{collaborator.name}</h3>
									<p className="text-md text-gray-600 mb-2">{collaborator.title}</p>
									<div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
										<MapPin className="h-4 w-4" />
										<span>{collaborator.location}</span>
									</div>
									<div className="flex flex-wrap justify-center gap-1 mb-4">
										{collaborator.skills.map((skill) => (
											<Badge key={skill} variant="secondary" className="text-xs">
												{skill}
											</Badge>
										))}
									</div>
									<p className="text-sm text-gray-700 mb-4 line-clamp-3">{collaborator.bio}</p>
									<div className="flex gap-2 w-full mt-auto">
										<Link href={`/profile/${collaborator.id}`} passHref>
											<Button
												variant="default"
												className="flex-1"
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
											className="flex-1 bg-transparent"
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
								Tidak ada kolaborator yang ditemukan dengan kriteria ini.
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
