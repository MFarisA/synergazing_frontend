"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Zap, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Project } from '@/types';

interface SynergizeDialogProps {
  project: Project;
}

export function SynergizeDialog({ project }: SynergizeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    project_role_id: "",
    why_interested: "",
    skills_experience: "",
    contribution: "",
  });
  
  const { addToast } = useToast();

  // Check if user is the project creator - better user ID detection
  const getCurrentUserId = () => {
    if (typeof window === 'undefined') return null;
    
    // Try multiple ways to get user ID
    const userIdFromStorage = localStorage.getItem('user_id');
    const userDataString = localStorage.getItem('user');
    
    if (userIdFromStorage) {
      return userIdFromStorage;
    }
    
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.id?.toString() || userData.user_id?.toString();
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    return null;
  };

  const currentUserId = getCurrentUserId();
  const isOwnProject = currentUserId && project.creator.id.toString() === currentUserId;

  // Check if registration deadline has passed
  const now = new Date();
  const deadline = new Date(project.registration_deadline);
  const isDeadlinePassed = now > deadline;
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Check if user can apply (not own project and deadline not passed)
  const canApply = !isOwnProject && !isDeadlinePassed;

  const handleInputChange = (field: string, value: string) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendApplication = async () => {
    // Check if user owns the project - FIRST CHECK
    if (isOwnProject) {
      addToast({
        title: "Tidak Dapat Mendaftar",
        description: "Anda tidak dapat mendaftar untuk proyek Anda sendiri",
        type: "error",
      });
      return;
    }

    // Check deadline before validation
    if (isDeadlinePassed) {
      addToast({
        title: "Pendaftaran Ditutup",
        description: "Maaf, batas waktu pendaftaran untuk proyek ini telah berakhir",
        type: "error",
      });
      return;
    }

    // Validation
    if (!applicationData.project_role_id) {
      addToast({
        title: "Error",
        description: "Silakan pilih role yang ingin Anda isi",
        type: "error",
      });
      return;
    }

    if (!applicationData.why_interested.trim()) {
      addToast({
        title: "Error", 
        description: "Silakan jelaskan mengapa Anda tertarik dengan proyek ini",
        type: "error",
      });
      return;
    }

    if (!applicationData.skills_experience.trim()) {
      addToast({
        title: "Error",
        description: "Silakan ceritakan skill dan pengalaman Anda",
        type: "error",
      });
      return;
    }

    if (!applicationData.contribution.trim()) {
      addToast({
        title: "Error",
        description: "Silakan jelaskan kontribusi yang bisa Anda berikan",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        addToast({
          title: "Error",
          description: "Please login to apply to projects",
          type: "error",
        });
        return;
      }

      await api.applyToProject(token, project.id.toString(), applicationData);
      
      addToast({
        title: "Aplikasi Berhasil Dikirim!",
        description: `Anda telah berhasil melamar untuk proyek "${project.title}". Tunggu konfirmasi dari project owner.`,
        type: "success",
        duration: 5000,
      });

      // Reset form and close dialog
      setApplicationData({
        project_role_id: "",
        why_interested: "",
        skills_experience: "",
        contribution: "",
      });
      setIsOpen(false);

    } catch (error: any) {
      console.error('Application error:', error);
      
      // Handle specific error messages from backend with proper Indonesian messages
      let errorMessage = "Terjadi kesalahan saat mengirim aplikasi. Silakan coba lagi.";
      let errorTitle = "Gagal Mengirim Aplikasi";
      
      if (error.message?.includes("registration deadline has passed")) {
        errorTitle = "Pendaftaran Ditutup";
        errorMessage = "Batas waktu pendaftaran untuk proyek ini telah berakhir.";
      } else if (error.message?.includes("already applied")) {
        errorTitle = "Sudah Pernah Mendaftar";
        errorMessage = "Anda sudah pernah mendaftar untuk proyek ini.";
      } else if (error.message?.includes("already a member")) {
        errorTitle = "Sudah Menjadi Anggota";
        errorMessage = "Anda sudah menjadi anggota proyek ini.";
      } else if (error.message?.includes("own project") || error.message?.includes("cannot apply to your own project")) {
        errorTitle = "Tidak Dapat Mendaftar";
        errorMessage = "Anda tidak dapat mendaftar untuk proyek Anda sendiri.";
      } else if (error.message?.includes("400")) {
        // Generic 400 error - could be own project
        errorTitle = "Tidak Dapat Mendaftar";
        errorMessage = "Anda tidak dapat mendaftar untuk proyek Anda sendiri.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        title: errorTitle,
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Map API data to display format
  const creatorProfile = project.creator.profile;
  const creatorAvatar = creatorProfile?.profile_picture || '';
  const skills = project.required_skills.map(skill => skill.skill.name);
  const availableRoles = project.roles?.filter(role => role.slots_available > 0) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className={`flex-1 ${!canApply 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:brightness-90'
          }`}
          disabled={!canApply}
          onClick={() => {
            if (isOwnProject) {
              addToast({
                title: "Proyek Anda Sendiri",
                description: "Ini adalah proyek yang Anda buat. Gunakan dashboard recruiter untuk mengelola aplikasi masuk.",
                type: "info",
              });
              return;
            }
            if (isDeadlinePassed) {
              addToast({
                title: "Pendaftaran Ditutup", 
                description: "Batas waktu pendaftaran untuk proyek ini telah berakhir",
                type: "error",
              });
              return;
            }
          }}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isOwnProject 
            ? 'Proyek Anda' 
            : isDeadlinePassed 
              ? 'Pendaftaran Ditutup' 
              : 'Synergize It!'
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <DialogTitle className="text-xl font-semibold mb-2">
              {isOwnProject 
                ? 'Ini Proyek Anda'
                : isDeadlinePassed 
                  ? 'Pendaftaran Telah Ditutup' 
                  : 'Bergabung dengan Proyek'
              }
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {isOwnProject
                ? `Anda adalah pemilik proyek "${project.title}". Gunakan dashboard recruiter untuk mengelola aplikasi.`
                : isDeadlinePassed 
                  ? `Batas waktu pendaftaran untuk "${project.title}" telah berakhir pada ${deadline.toLocaleDateString('id-ID')}`
                  : `Ajukan diri Anda untuk bergabung dengan "${project.title}"`
              }
            </DialogDescription>
          </div>

          {/* Own Project Message */}
          {isOwnProject && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Proyek Anda</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Ini adalah proyek yang Anda buat. Sebagai pemilik proyek, Anda dapat:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4">
                <li>• Mengelola aplikasi masuk dari calon anggota tim</li>
                <li>• Menerima atau menolak pelamar</li>
                <li>• Memantau progress proyek</li>
                <li>• Mengedit detail proyek</li>
              </ul>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    window.location.href = `/recruiter-dashboard?projectId=${project.id}`;
                  }}
                >
                  Buka Dashboard Recruiter
                </Button>
              </div>
            </div>
          )}

          {/* Deadline Warning */}
          {!isOwnProject && !isDeadlinePassed && daysUntilDeadline <= 7 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {daysUntilDeadline === 0 
                    ? "Pendaftaran ditutup hari ini!"
                    : daysUntilDeadline === 1
                      ? "Pendaftaran ditutup besok!"
                      : `Tersisa ${daysUntilDeadline} hari untuk mendaftar`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Deadline Passed Message */}
          {!isOwnProject && isDeadlinePassed && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Pendaftaran Ditutup</span>
              </div>
              <p className="text-sm text-red-700">
                Batas waktu pendaftaran untuk proyek ini telah berakhir pada{' '}
                <strong>{deadline.toLocaleDateString('id-ID')}</strong>.
                Silakan cari proyek lain yang masih membuka pendaftaran.
              </p>
            </div>
          )}
          
          {/* Project Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={creatorAvatar} />
                <AvatarFallback>{project.creator.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{project.creator.name}</span>
              {isOwnProject && (
                <Badge variant="outline" className="text-xs ml-2">Anda</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {skills.slice(0, 4).map((skill) => 
                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
              )}
              {skills.length > 4 && <Badge variant="secondary" className="text-xs">+{skills.length - 4}</Badge>}
            </div>
            <p className="text-xs text-gray-500">
              Deadline: {deadline.toLocaleDateString('id-ID')} • 
              {isDeadlinePassed ? ' Ditutup' : ` ${daysUntilDeadline} hari lagi`}
            </p>
          </div>

          {/* Application Form - only show if not own project and deadline hasn't passed */}
          {canApply && (
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Role yang ingin Anda isi *</label>
                {availableRoles.length > 0 ? (
                  <Select
                    value={applicationData.project_role_id}
                    onValueChange={(value) => handleInputChange("project_role_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role yang tersedia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            <span className="text-xs text-gray-500">
                              {role.slots_available} slot tersedia
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Tidak ada role yang tersedia saat ini
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mengapa Anda tertarik dengan proyek ini? *</label>
                <Textarea 
                  placeholder="Jelaskan motivasi dan ketertarikan Anda terhadap proyek ini..."
                  value={applicationData.why_interested}
                  onChange={(e) => handleInputChange("why_interested", e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skill dan pengalaman relevan *</label>
                <Textarea 
                  placeholder="Ceritakan skill teknis dan pengalaman yang mendukung peran Anda di proyek ini..."
                  value={applicationData.skills_experience}
                  onChange={(e) => handleInputChange("skills_experience", e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kontribusi yang bisa Anda berikan *</label>
                <Textarea 
                  placeholder="Apa yang bisa Anda kontribusikan untuk kesuksesan proyek ini..."
                  value={applicationData.contribution}
                  onChange={(e) => handleInputChange("contribution", e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSendApplication}
                disabled={isLoading || availableRoles.length === 0}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:brightness-90 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim Aplikasi...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Synergize It!
                  </>
                )}
              </Button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            {isOwnProject
              ? "Kelola proyek Anda melalui dashboard recruiter untuk melihat dan meninjau aplikasi masuk."
              : isDeadlinePassed 
                ? "Cari proyek lain yang masih membuka pendaftaran di halaman proyek."
                : "Aplikasi Anda akan ditinjau oleh project owner. Anda akan mendapat notifikasi jika diterima atau ditolak."
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}