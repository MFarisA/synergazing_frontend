import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, AlertCircle, Target, Clock, Play, Check, UserPlus, UserMinus, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import type { Project, ProjectInvitation } from '@/types';
import { inviteMemberToProject, removeMemberFromProject, getUserProjectInvitations, respondToProjectInvitation } from '@/lib/api/project-member-management';

interface ProjectTabsContentProps {
  project: Project;
}

// Timeline status configuration
const TIMELINE_STATUS_CONFIG = {
  "not-started": {
    label: "Belum Dimulai",
    color: "#6B7280", // Gray
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: Clock
  },
  "in-progress": {
    label: "Sedang Berjalan", 
    color: "#F59E0B", // Yellow/Orange
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    icon: Play
  },
  "done": {
    label: "Selesai",
    color: "#10B981", // Green
    bgColor: "bg-green-100", 
    textColor: "text-green-700",
    icon: Check
  }
};

export function ProjectTabsContent({ project }: ProjectTabsContentProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [userInvitations, setUserInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Load user invitations on component mount
  useEffect(() => {
    const loadUserInvitations = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        const invitations = await getUserProjectInvitations(token);
        setUserInvitations(invitations.data || []);
      } catch (error) {
        console.error('Failed to load user invitations:', error);
        // Set empty array on error to prevent UI issues
        setUserInvitations([]);
      }
    };

    loadUserInvitations();
  }, []);

  // Handle invite member
  const handleInviteMember = async () => {
    if (!selectedUserId || !selectedRoleId) {
      addToast({
        title: "Error",
        description: "Please select both user and role",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to invite members",
          type: "error",
        });
        return;
      }

      await inviteMemberToProject(token, project.id.toString(), {
        user_id: selectedUserId,
        project_role_id: selectedRoleId,
      });

      addToast({
        title: "Success",
        description: "Member invited successfully!",
        type: "success",
      });

      // Reset form and close dialog
      setSelectedUserId("");
      setSelectedRoleId("");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
      addToast({
        title: "Error",
        description: "Failed to invite member. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId: string) => {
    try {
      const token = getToken();
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to remove members",
          type: "error",
        });
        return;
      }

      await removeMemberFromProject(token, project.id.toString(), userId);
      
      addToast({
        title: "Success",
        description: "Member removed successfully!",
        type: "success",
      });

      // You might want to refresh the project data here
    } catch (error) {
      console.error('Failed to remove member:', error);
      addToast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        type: "error",
      });
    }
  };

  // Handle invitation response
  const handleInvitationResponse = async (projectId: string, response: 'accept' | 'decline') => {
    try {
      const token = getToken();
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to respond to invitations",
          type: "error",
        });
        return;
      }

      await respondToProjectInvitation(token, projectId, { response });
      
      addToast({
        title: "Success",
        description: `Invitation ${response}ed successfully!`,
        type: "success",
      });

      // Refresh invitations after response
      const invitations = await getUserProjectInvitations(token);
      setUserInvitations(invitations.data || []);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      addToast({
        title: "Error",
        description: "Failed to respond to invitation. Please try again.",
        type: "error",
      });
    }
  };
  // Map API data to display format
  const skills = project.required_skills.map(skill => skill.skill.name);
  const benefits = project.benefits.map(benefit => benefit.benefit.name);
  const conditions = project.conditions.map(condition => condition.description);
  
  // Updated timeline mapping to handle the correct structure
  const timelineItems = project.timeline.map(item => ({
    name: item.timeline.name,
    status: "not-started" // Default status since timeline_status doesn't exist in the type
  }));

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="team">Tim</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-4">
        <Card>
          <CardHeader><CardTitle>Deskripsi Lengkap Proyek</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-line text-gray-700">{project.description}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Teknologi & Skills</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Apa yang Akan Anda Dapatkan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /><span>{benefit}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Timeline Proyek</CardTitle>
            <CardDescription>Rencana pengembangan dari awal hingga selesai dengan status terkini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineItems.map((phase, i) => {
              const statusConfig = TIMELINE_STATUS_CONFIG[phase.status as keyof typeof TIMELINE_STATUS_CONFIG] || TIMELINE_STATUS_CONFIG["not-started"];
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}
                      style={{ borderColor: statusConfig.color, borderWidth: '2px' }}
                    >
                      <StatusIcon 
                        className="h-4 w-4" 
                        style={{ color: statusConfig.color }}
                      />
                    </div>
                    {i < timelineItems.length - 1 && (
                      <div className="h-8 w-0.5 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{phase.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 text-xs`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {timelineItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Timeline belum ditentukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="space-y-6 mt-4">
        {/* User Invitations Section */}
        {userInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Undangan Proyek ({userInvitations.length})
              </CardTitle>
              <CardDescription>Undangan proyek yang menunggu respons Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userInvitations.map((invitation, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div>
                    <p className="font-medium">{invitation.project.title}</p>
                    <p className="text-sm text-gray-600">Role: {invitation.project_role.name}</p>
                    <p className="text-xs text-gray-500">{invitation.project_role.description}</p>
                    <p className="text-xs text-gray-400">Status: {invitation.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleInvitationResponse(invitation.project_id.toString(), 'accept')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleInvitationResponse(invitation.project_id.toString(), 'decline')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Team Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tim Saat Ini ({project.members.length} orang)</CardTitle>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Member to Project</DialogTitle>
                    <DialogDescription>
                      Invite a new member to join this project
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <Input
                        id="userId"
                        placeholder="Enter user ID"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleId">Project Role</Label>
                      <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {project.roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name} ({role.slots_available} slots available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember} disabled={isLoading}>
                      {isLoading ? "Inviting..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.members.map((member, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{member.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role_name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skill_names.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                    </div>
                  </div>
                </div>
                {/* Only show remove button if user has permission (you might want to add role-based logic here) */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveMember(member.name)} // You might need member.id instead
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Posisi yang Dibutuhkan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {project.roles.map((role, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge variant="secondary">{role.slots_available} slot tersedia</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.required_skills.map(skillItem => 
                    <Badge key={skillItem.skill.name} variant="outline" className="text-xs">{skillItem.skill.name}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requirements" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Persyaratan</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {conditions.map((condition, i) => (
                <li key={i} className="flex items-start gap-2"><Target className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" /><span>{condition}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}