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
  views: number;
  deadline: string;
};

// Tipe untuk data form aplikasi
export type ApplicationData = {
  motivation: string;
  skills: string;
  contribution: string;
  role: string;
};

export type ProjectDetail = typeof import('@/lib/project-detail-data').projectsData['1'];

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  about_me: string;
  location: string;
  interests: string;
  academic: string;
  website_url: string;
  github_url: string;
  linkedin_url: string;
  instagram_url: string;
  portfolio_url: string;
  profile_picture: string;
  cv_file: string;
  collaboration_status?: boolean;
  user_skills: UserSkill[];
}

export interface Skill {
  id: number;
  name: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  proficiency: number;
  skill: Skill;
}