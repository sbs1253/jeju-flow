export interface Performance {
  performance_id: string;
  title: string;
  genre: string;
  region: string;
  venue: string;
  start_date: string;
  end_date: string;
  status: string;
  poster_url: string | null;
  cast?: string | null;
  crew?: string | null;
  runtime?: string | null;
  age?: string | null;
  price?: string | null;
  runtime_info?: string | null;
  relate_url?: string | null;
  relate_urls?: { name: string; url: string }[] | null;
  styurls?: string[] | null;
  kopis_url?: string | null;
  created_at?: string;
}

export interface PerformanceStats {
  total: number;
  byGenre: Record<string, number>;
  byRegion: Record<string, number>;
  byVenue: Record<string, number>;
  jejuCount: number;
  trend?: {
    value: number;
    label: string;
  };
}
