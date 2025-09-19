export interface Dream {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  interpretation?: DreamInterpretation;
  tags?: string[];
  emotion?: 'positive' | 'negative' | 'neutral';
}

export interface DreamInterpretation {
  id: string;
  dreamId: string;
  analysis: string;
  symbols: DreamSymbol[];
  mood: 'positive' | 'negative' | 'neutral';
  themes: string[];
  createdAt: string;
}

export interface DreamSymbol {
  symbol: string;
  meaning: string;
  significance: 'high' | 'medium' | 'low';
}

export interface DreamStats {
  totalDreams: number;
  thisWeek: number;
  thisMonth: number;
  mostCommonEmotion: 'positive' | 'negative' | 'neutral';
  averageLength: number;
}