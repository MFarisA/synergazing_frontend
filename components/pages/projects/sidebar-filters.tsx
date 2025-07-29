"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // <-- Import Separator

// Interface props tidak berubah
interface SidebarFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  locationOptions: string[];
  skillOptions: string[];
  selectedSkills: string[];
  handleSkillToggle: (skill: string) => void;
}

export function SidebarFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  locationOptions,
  skillOptions,
  selectedSkills,
  handleSkillToggle,
}: SidebarFiltersProps) {
  // Cek apakah filter utama sedang aktif
  const areMainFiltersActive =
    searchQuery !== "" || selectedType !== "all" || selectedLocation !== "all";

  // Fungsi untuk membersihkan filter utama
  const clearMainFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedLocation("all");
  };

  return (
    <aside className="w-full lg:w-80 space-y-6 flex-shrink-0">
      {/* Tombol Buat Proyek Baru */}
      <Link href="/create-project" className="block">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Buat Proyek Baru
        </Button>
      </Link>

      {/* Card untuk Search dan Filter Utama */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari proyek atau skill..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Tugas Akhir">Tugas Akhir</SelectItem>
              <SelectItem value="Lomba">Lomba</SelectItem>
              <SelectItem value="Riset Dosen">Riset Dosen</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Semua Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* === TOMBOL CLEAR BARU === */}
          {areMainFiltersActive && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMainFilters}
                className="w-full text-red-500 hover:text-red-600"
              >
                Clear Filter
              </Button>
            </>
          )}
          {/* ======================= */}

        </CardContent>
      </Card>

      {/* Card untuk Filter Skill */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter berdasarkan Skill</CardTitle>
        </CardHeader>
        <CardContent>
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
                  className="text-sm font-medium leading-none"
                >
                  {skill}
                </label>
              </div>
            ))}
          </div>
          {selectedSkills.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleSkillToggle('')}
              className="w-auto p-0 mt-3 text-red-500"
            >
              Clear All Skill Filters
            </Button>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}