import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

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