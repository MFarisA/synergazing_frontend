export type Project = {
    id: number;
    title: string;
    description: string;
    recruiter: {
      name: string;
      avatar: string;
      major: string;
      university: string;
      rating: number;
      projects: number;
      connections: number;
    };
    skills: string[];
    duration: string;
    members: string;
    type: string;
    location: string;
    posted: string;
    image: string;
    urgent?: boolean;
    views: number;
    applicants: number;
    deadline: string;
  };
  
  // Tipe untuk data form aplikasi
  export type ApplicationData = {
    motivation: string;
    skills: string;
    contribution: string;
  };

  export type ProjectDetail = typeof import('@/lib/project-detail-data').projectsData['1'];
