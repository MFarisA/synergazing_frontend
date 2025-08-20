export type Project = {
  id: number;
  title: string;
  description: string;
  completion_stage: number;
  creator_id: number;
  creator: {
    id: number;
    name: string;
    email: string;
    phone: string;
    status_collaboration: string;
    created_at: string;
    updated_at: string;
    profile?: {
      profile_picture?: string;
      interests?: string;
    };
  };
  status: string;
  project_type: string;
  picture_url: string;
  duration: string;
  total_team: number;
  filled_team: number;
  remaining_team: number;
  start_date: string;
  end_date: string;
  location: string;
  budget: string;
  registration_deadline: string;
  time_commitment: string;
  benefits: Array<{
    project_id: number;
    benefit_id: number;
    benefit: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }>;
  timeline: Array<{
    project_id: number;
    timeline_id: number;
    timeline: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }>;
  required_skills: Array<{
    project_id: number;
    skill_id: number;
    skill: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }>;
  conditions: Array<{
    id: number;
    project_id: number;
    description: string;
  }>;
  tags: Array<{
    project_id: number;
    tag_id: number;
    tag: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
    };
  }>;
  members: Array<{
    name: string;
    role_description: string;
    role_name: string;
    skill_names: string[];
  }>;
  roles: Array<{
    id: number;
    project_id: number;
    name: string;
    slots_available: number;
    description: string;
    required_skills: Array<{
      project_role_id: number;
      skill_id: number;
      skill: {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
      };
    }>;
    created_at: string;
    updated_at: string;
  }>;
  created_at?: string;
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

export interface TimelineStatusOption {
  value: string;
  label: string;
  description: string;
  color?: string;
}