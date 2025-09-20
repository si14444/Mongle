import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream, DreamInterpretation, DreamStats } from '@/types/dream';

const DREAMS_STORAGE_KEY = 'mongle_dreams';
const INTERPRETATIONS_STORAGE_KEY = 'mongle_interpretations';

export class DreamService {
  static async getAllDreams(): Promise<Dream[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_STORAGE_KEY);
      return dreamsJson ? JSON.parse(dreamsJson) : [];
    } catch (error) {
      console.error('Failed to get dreams:', error);
      return [];
    }
  }

  static async saveDream(dream: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dream> {
    try {
      const dreams = await this.getAllDreams();
      const newDream: Dream = {
        ...dream,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dreams.unshift(newDream);
      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));
      return newDream;
    } catch (error) {
      console.error('Failed to save dream:', error);
      throw error;
    }
  }

  static async updateDream(dreamId: string, updates: Partial<Dream>): Promise<void> {
    try {
      const dreams = await this.getAllDreams();
      const dreamIndex = dreams.findIndex(d => d.id === dreamId);

      if (dreamIndex !== -1) {
        dreams[dreamIndex] = {
          ...dreams[dreamIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(dreams));
      }
    } catch (error) {
      console.error('Failed to update dream:', error);
      throw error;
    }
  }

  static async deleteDream(dreamId: string): Promise<void> {
    try {
      const dreams = await this.getAllDreams();
      const filteredDreams = dreams.filter(d => d.id !== dreamId);
      await AsyncStorage.setItem(DREAMS_STORAGE_KEY, JSON.stringify(filteredDreams));
    } catch (error) {
      console.error('Failed to delete dream:', error);
      throw error;
    }
  }

  static async getDreamById(dreamId: string): Promise<Dream | null> {
    try {
      const dreams = await this.getAllDreams();
      return dreams.find(d => d.id === dreamId) || null;
    } catch (error) {
      console.error('Failed to get dream by id:', error);
      return null;
    }
  }

  static async saveInterpretation(interpretation: Omit<DreamInterpretation, 'id' | 'createdAt'>): Promise<DreamInterpretation> {
    try {
      const interpretationsJson = await AsyncStorage.getItem(INTERPRETATIONS_STORAGE_KEY);
      const interpretations: DreamInterpretation[] = interpretationsJson ? JSON.parse(interpretationsJson) : [];

      const newInterpretation: DreamInterpretation = {
        ...interpretation,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      interpretations.push(newInterpretation);
      await AsyncStorage.setItem(INTERPRETATIONS_STORAGE_KEY, JSON.stringify(interpretations));

      // Get current dream to update interpretation history
      const dream = await this.getDreamById(interpretation.dreamId);
      if (dream) {
        const interpretationHistory = dream.interpretationHistory || [];

        // If there's an existing interpretation and it's not already in history, add it first
        if (dream.interpretation && !interpretationHistory.find(h => h.id === dream.interpretation!.id)) {
          interpretationHistory.push(dream.interpretation);
        }

        // Add the new interpretation
        interpretationHistory.push(newInterpretation);

        await this.updateDream(interpretation.dreamId, {
          interpretation: newInterpretation,
          interpretationHistory: interpretationHistory
        });
      }

      return newInterpretation;
    } catch (error) {
      console.error('Failed to save interpretation:', error);
      throw error;
    }
  }

  static async getDreamStats(): Promise<DreamStats> {
    try {
      const dreams = await this.getAllDreams();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const thisWeek = dreams.filter(d => new Date(d.createdAt) >= weekAgo).length;
      const thisMonth = dreams.filter(d => new Date(d.createdAt) >= monthAgo).length;

      const emotions = dreams.map(d => d.emotion).filter(Boolean);
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion!] = (acc[emotion!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonEmotion = Object.entries(emotionCounts).reduce(
        (a, b) => emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b,
        ['neutral', 0]
      )[0] as 'positive' | 'negative' | 'neutral';

      const averageLength = dreams.reduce((sum, dream) => sum + dream.content.length, 0) / (dreams.length || 1);

      return {
        totalDreams: dreams.length,
        thisWeek,
        thisMonth,
        mostCommonEmotion,
        averageLength: Math.round(averageLength),
      };
    } catch (error) {
      console.error('Failed to get dream stats:', error);
      return {
        totalDreams: 0,
        thisWeek: 0,
        thisMonth: 0,
        mostCommonEmotion: 'neutral',
        averageLength: 0,
      };
    }
  }

  static generateMockInterpretation(dreamContent: string): DreamInterpretation {
    const symbols = this.extractSymbols(dreamContent);
    const mood = this.analyzeMood(dreamContent);
    const themes = this.extractThemes(dreamContent);

    return {
      id: Date.now().toString(),
      dreamId: '',
      analysis: this.generateAnalysis(dreamContent, symbols, themes),
      symbols,
      mood,
      themes,
      createdAt: new Date().toISOString(),
    };
  }

  private static extractSymbols(content: string) {
    const commonSymbols = [
      { symbol: '물', meaning: '감정과 무의식', significance: 'high' as const },
      { symbol: '비행', meaning: '자유와 해방감', significance: 'medium' as const },
      { symbol: '동물', meaning: '본능과 자연성', significance: 'medium' as const },
      { symbol: '집', meaning: '안전과 자아', significance: 'high' as const },
      { symbol: '길', meaning: '인생의 여정', significance: 'medium' as const },
    ];

    return commonSymbols.filter(symbol =>
      content.toLowerCase().includes(symbol.symbol.toLowerCase())
    ).slice(0, 3);
  }

  private static analyzeMood(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['행복', '기쁨', '웃음', '사랑', '평화', '아름다운'];
    const negativeWords = ['무서운', '슬픈', '화나는', '걱정', '불안', '어두운'];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private static extractThemes(content: string): string[] {
    const themes = [];
    if (content.includes('가족') || content.includes('부모')) themes.push('가족 관계');
    if (content.includes('학교') || content.includes('공부')) themes.push('학업/성장');
    if (content.includes('친구') || content.includes('사람')) themes.push('인간관계');
    if (content.includes('미래') || content.includes('목표')) themes.push('미래에 대한 불안');
    if (content.includes('과거') || content.includes('어릴때')) themes.push('과거 회상');

    return themes.slice(0, 3);
  }

  private static generateAnalysis(content: string, symbols: any[], themes: string[]): string {
    let analysis = '이 꿈은 당신의 내면을 반영하고 있습니다. ';

    if (symbols.length > 0) {
      analysis += `특히 "${symbols[0].symbol}"이(가) 나타나는 것은 ${symbols[0].meaning}을(를) 의미할 수 있습니다. `;
    }

    if (themes.length > 0) {
      analysis += `현재 ${themes[0]}에 대한 관심이나 고민이 꿈에 투영된 것으로 보입니다. `;
    }

    analysis += '꿈을 통해 자신의 감정을 이해하고 성찰하는 시간을 가져보세요.';

    return analysis;
  }
}