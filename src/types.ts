export interface Holiday {
  date: string;
  name: string;
  local_name: string;
  country_code: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launch_year: number | null;
  types: string[] | null;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  continent?: string;
}

export const COUNTRIES: Country[] = [
  { code: "NO", name: "Norway", flag: "🇳🇴", continent: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", continent: "Europe" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", continent: "Europe" },
  { code: "FI", name: "Finland", flag: "🇫🇮", continent: "Europe" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", continent: "Europe" },
  { code: "US", name: "United States", flag: "🇺🇸", continent: "North America" },
  { code: "DE", name: "Germany", flag: "🇩🇪", continent: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", continent: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", continent: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", continent: "Europe" },
  { code: "CA", name: "Canada", flag: "🇨🇦", continent: "North America" },
  { code: "AU", name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { code: "JP", name: "Japan", flag: "🇯🇵", continent: "Asia" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", continent: "South America" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", continent: "Europe" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", continent: "Europe" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", continent: "Oceania" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", continent: "Europe" }
];
