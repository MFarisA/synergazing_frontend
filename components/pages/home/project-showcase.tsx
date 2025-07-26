import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import { Calendar, Users, ArrowRight } from "lucide-react";
  
  const projects = [
    {
      avatar: "AM",
      name: "Ahmad Maulana",
      major: "Teknik Informatika",
      title: "Aplikasi Smart Campus IoT",
      description: "Mengembangkan sistem IoT untuk monitoring fasilitas kampus dengan dashboard real-time.",
      tags: ["React", "IoT", "Python"],
      duration: "3 bulan",
      members: "2/5 anggota",
    },
    {
      avatar: "SR",
      name: "Sari Rahayu",
      major: "Desain Komunikasi Visual",
      title: "Kampanye Sosial Lingkungan",
      description: "Merancang kampanye kreatif untuk meningkatkan kesadaran lingkungan di kalangan mahasiswa.",
      tags: ["Design", "Marketing", "Video"],
      duration: "2 bulan",
      members: "4/6 anggota",
    },
    {
      avatar: "DP",
      name: "Dr. Pratama",
      major: "Dosen Peneliti",
      title: "Riset AI untuk Kesehatan",
      description: "Penelitian pengembangan model AI untuk diagnosis dini penyakit berbasis data medis.",
      tags: ["Machine Learning", "Python", "Research"],
      duration: "6 bulan",
      members: "1/3 anggota",
    },
  ];
  
  export function ProjectShowcase() {
    return (
      <section id="projects" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Proyek Terbaru
            </h2>
            <p className="mt-4 text-gray-600 md:text-xl max-w-[600px] mx-auto">
              Temukan proyek menarik yang sedang mencari kolaborator
            </p>
          </div>
  
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>{project.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.major}</p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.members}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Synergize It!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
  
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Lihat Semua Proyek
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }