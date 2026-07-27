export interface ScheduleItem {
  id?: string | number;
  kelas?: string;
  class_name?: string;
  hari?: string;
  day?: string;
  jam_ke?: number | string;
  period?: number | string;
  jam?: string;
  mapel?: string;
  subject?: string;
  guru?: string;
  teacher?: string;
  ruang?: string;
}

export interface ParsedSchedule {
  kelas: string;
  hari: string;
  jam_ke: string;
  mapel: string;
  guru: string;
  ruang: string;
}
