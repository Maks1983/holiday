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
  // Europe
  { code: "AD", name: "Andorra", flag: "🇦🇩", continent: "Europe" },
  { code: "AL", name: "Albania", flag: "🇦🇱", continent: "Europe" },
  { code: "AT", name: "Austria", flag: "🇦🇹", continent: "Europe" },
  { code: "AX", name: "Åland Islands", flag: "🇦🇽", continent: "Europe" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "🇧🇦", continent: "Europe" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", continent: "Europe" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", continent: "Europe" },
  { code: "BY", name: "Belarus", flag: "🇧🇾", continent: "Europe" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", continent: "Europe" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾", continent: "Europe" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", continent: "Europe" },
  { code: "DE", name: "Germany", flag: "🇩🇪", continent: "Europe" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", continent: "Europe" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", continent: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", continent: "Europe" },
  { code: "FI", name: "Finland", flag: "🇫🇮", continent: "Europe" },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", continent: "Europe" },
  { code: "FR", name: "France", flag: "🇫🇷", continent: "Europe" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", continent: "Europe" },
  { code: "GG", name: "Guernsey", flag: "🇬🇬", continent: "Europe" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", continent: "Europe" },
  { code: "GR", name: "Greece", flag: "🇬🇷", continent: "Europe" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", continent: "Europe" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", continent: "Europe" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", continent: "Europe" },
  { code: "IM", name: "Isle of Man", flag: "🇮🇲", continent: "Europe" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", continent: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", continent: "Europe" },
  { code: "JE", name: "Jersey", flag: "🇯🇪", continent: "Europe" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", continent: "Europe" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹", continent: "Europe" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", continent: "Europe" },
  { code: "LV", name: "Latvia", flag: "🇱🇻", continent: "Europe" },
  { code: "MC", name: "Monaco", flag: "🇲🇨", continent: "Europe" },
  { code: "MD", name: "Moldova", flag: "🇲🇩", continent: "Europe" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", continent: "Europe" },
  { code: "MK", name: "North Macedonia", flag: "🇲🇰", continent: "Europe" },
  { code: "MT", name: "Malta", flag: "🇲🇹", continent: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", continent: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", continent: "Europe" },
  { code: "PL", name: "Poland", flag: "🇵🇱", continent: "Europe" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", continent: "Europe" },
  { code: "RO", name: "Romania", flag: "🇷🇴", continent: "Europe" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", continent: "Europe" },
  { code: "RU", name: "Russia", flag: "🇷🇺", continent: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", continent: "Europe" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮", continent: "Europe" },
  { code: "SJ", name: "Svalbard and Jan Mayen", flag: "🇸🇯", continent: "Europe" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", continent: "Europe" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", continent: "Europe" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", continent: "Europe" },
  { code: "VA", name: "Vatican City", flag: "🇻🇦", continent: "Europe" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰", continent: "Europe" },

  // North America / Central America
  { code: "BB", name: "Barbados", flag: "🇧🇧", continent: "North America" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", continent: "North America" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", continent: "North America" },
  { code: "CA", name: "Canada", flag: "🇨🇦", continent: "North America" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", continent: "North America" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", continent: "North America" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴", continent: "North America" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", continent: "North America" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", continent: "North America" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", continent: "North America" },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", continent: "North America" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", continent: "North America" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", continent: "North America" },
  { code: "PA", name: "Panama", flag: "🇵🇦", continent: "North America" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", continent: "North America" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", continent: "North America" },
  { code: "US", name: "United States", flag: "🇺🇸", continent: "North America" },

  // South America
  { code: "AR", name: "Argentina", flag: "🇦🇷", continent: "South America" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", continent: "South America" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", continent: "South America" },
  { code: "CL", name: "Chile", flag: "🇨🇱", continent: "South America" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", continent: "South America" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", continent: "South America" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", continent: "South America" },
  { code: "PE", name: "Peru", flag: "🇵🇪", continent: "South America" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", continent: "South America" },
  { code: "SR", name: "Suriname", flag: "🇸🇺", continent: "South America" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", continent: "South America" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", continent: "South America" },

  // Asia
  { code: "CN", name: "China", flag: "🇨🇳", continent: "Asia" },
  { code: "IN", name: "India", flag: "🇮🇳", continent: "Asia" },
  { code: "JP", name: "Japan", flag: "🇯🇵", continent: "Asia" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", continent: "Asia" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", continent: "Asia" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", continent: "Asia" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", continent: "Asia" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", continent: "Asia" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", continent: "Asia" },

  // Oceania
  { code: "AU", name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", continent: "Oceania" },
  { code: "PG", name: "Papua New Guinea", flag: "🇵🇬", continent: "Oceania" },

  // Africa
  { code: "BJ", name: "Benin", flag: "🇧🇯", continent: "Africa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", continent: "Africa" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", continent: "Africa" },
  { code: "GM", name: "Gambia", flag: "🇬🇲", continent: "Africa" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", continent: "Africa" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", continent: "Africa" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", continent: "Africa" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", continent: "Africa" },
  { code: "NA", name: "Namibia", flag: "🇳🇦", continent: "Africa" },
  { code: "NE", name: "Niger", flag: "🇳🇪", continent: "Africa" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", continent: "Africa" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", continent: "Africa" },
  { code: "TG", name: "Togo", flag: "🇹🇬", continent: "Africa" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", continent: "Africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", continent: "Africa" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", continent: "Africa" }
];
