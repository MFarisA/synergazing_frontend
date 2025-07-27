import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface SidebarFiltersProps {
  skillOptions: string[];
  selectedSkills: string[];
  handleSkillToggle: (skill: string) => void;
}

export function SidebarFilters({
  skillOptions,
  selectedSkills,
  handleSkillToggle,
}: SidebarFiltersProps) {
  return (
    <aside className="w-full lg:w-80 space-y-6 flex-shrink-0">
       {/* Create Project Button */}
       <Link href="/create-project">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium mb-3">
          <Plus className="h-5 w-5 mr-2" />
          Buat Proyek Baru
        </Button>
      </Link>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter berdasarkan Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {skillOptions.map((skill) => (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSkillToggle('')} // Menggunakan string kosong untuk reset
              className="w-full mt-3"
            >
              Clear All
            </Button>
          )}
        </CardContent>
      </Card>

    </aside>
  );
}