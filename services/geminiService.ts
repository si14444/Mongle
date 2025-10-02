import { DreamInterpretation, DreamSymbol } from "@/types/dream";
import Constants from 'expo-constants';

export class GeminiService {
  private static getAI() {
    try {
      // Check if API key is available - use process.env for Expo environment variables
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;

      if (!apiKey || apiKey.startsWith('${')) {
        console.error("EXPO_PUBLIC_GEMINI_API_KEY not found or not loaded properly");
        throw new Error("EXPO_PUBLIC_GEMINI_API_KEY not found");
      }

      console.log("Initializing GoogleGenAI with API key:", apiKey.substring(0, 10) + "...");

      // Try to import GoogleGenAI dynamically
      const { GoogleGenAI } = require("@google/genai");
      return new GoogleGenAI({ apiKey });
    } catch (error) {
      console.warn("Failed to initialize GoogleGenAI:", error);
      return null;
    }
  }

  static async interpretDream(
    dreamTitle: string,
    dreamContent: string
  ): Promise<Omit<DreamInterpretation, "id" | "dreamId" | "createdAt">> {
    try {
      const ai = this.getAI();
      if (!ai) {
        throw new Error("AI service not available");
      }

      const prompt = `
당신은 전문 꿈 해석가입니다. 다음 꿈을 분석하고 해석해주세요.

꿈 제목: ${dreamTitle}
꿈 내용: ${dreamContent}

**중요: 반드시 다음 JSON 형식으로만 응답해주세요. 다른 설명 없이 오직 JSON만 출력하세요:**

{
  "analysis": "꿈에 대한 전반적인 해석 (200-300자, 한국어)",
  "symbols": [
    {
      "symbol": "상징 이름",
      "meaning": "상징의 의미",
      "significance": "high"
    }
  ],
  "mood": "positive",
  "themes": ["테마1", "테마2"]
}

규칙:
1. 꿈 내용이 불충분해도 최선을 다해 해석하고 위 JSON 형식으로 응답
2. analysis는 따뜻하고 공감적인 톤으로 작성 (한국어)
3. symbols는 최대 4개까지, 꿈에서 추출 가능한 상징 포함
4. mood는 "positive", "negative", "neutral" 중 하나만 사용
5. themes는 최대 3개까지
6. 반드시 유효한 JSON만 출력하고 다른 텍스트는 포함하지 마세요
`;

      const response = await ai.models.generate({
        model: "gemini-2.0-flash-lite",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      // 응답 구조 확인
      console.log("Gemini API response candidates:", response.candidates?.length);

      // 응답에서 텍스트 추출
      let text = "";
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts[0].text || "";
        }
      }

      if (!text) {
        console.error("Unable to extract text from Gemini response");
        console.log("Full response:", JSON.stringify(response, null, 2));
        return this.getFallbackInterpretation(dreamTitle, dreamContent);
      }

      console.log("Gemini API raw response text:", text);

      // 응답이 비어있는지 확인
      if (!text || text.trim().length === 0) {
        console.warn("Empty response from Gemini API, using fallback");
        return this.getFallbackInterpretation(dreamTitle, dreamContent);
      }

      // JSON 응답 파싱
      let interpretation;
      try {
        // 먼저 직접 파싱 시도
        interpretation = JSON.parse(text);
        console.log("Successfully parsed JSON directly:", interpretation);
      } catch (e) {
        console.log("Direct JSON parsing failed, trying regex extraction. Error:", e);

        // 실패하면 정규식으로 JSON 추출 시도
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON object found in response. Response text:", text);
          console.log("Using fallback interpretation due to non-JSON response");
          // JSON이 없으면 fallback 사용
          return this.getFallbackInterpretation(dreamTitle, dreamContent);
        }

        try {
          interpretation = JSON.parse(jsonMatch[0]);
          console.log("Successfully parsed JSON with regex:", interpretation);
        } catch (parseError) {
          console.error("Failed to parse extracted JSON:", parseError);
          console.error("Extracted text:", jsonMatch[0]);
          console.log("Using fallback interpretation due to JSON parse error");
          // 파싱 실패하면 fallback 사용
          return this.getFallbackInterpretation(dreamTitle, dreamContent);
        }
      }

      // 데이터 검증 및 기본값 설정
      return {
        analysis:
          interpretation.analysis ||
          "꿈 해석을 생성하는 중 오류가 발생했습니다.",
        symbols: this.validateSymbols(interpretation.symbols || []),
        mood: this.validateMood(interpretation.mood),
        themes: this.validateThemes(interpretation.themes || []),
      };
    } catch (error) {
      console.error("Failed to interpret dream with Gemini:", error);

      // 심각한 에러인지 확인
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isCriticalError =
        errorMessage.includes("API key") ||
        errorMessage.includes("Network") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("AI service not available");

      if (isCriticalError) {
        // 심각한 에러는 throw하여 UI에서 처리
        throw error;
      }

      // 일반적인 파싱 오류 등은 fallback 해석 반환
      console.log("Using fallback interpretation due to error:", errorMessage);
      return this.getFallbackInterpretation(dreamTitle, dreamContent);
    }
  }

  private static validateSymbols(symbols: any[]): DreamSymbol[] {
    const validSymbols: DreamSymbol[] = [];

    for (const symbol of symbols.slice(0, 4)) {
      if (symbol.symbol && symbol.meaning) {
        validSymbols.push({
          symbol: String(symbol.symbol),
          meaning: String(symbol.meaning),
          significance: ["high", "medium", "low"].includes(symbol.significance)
            ? symbol.significance
            : "medium",
        });
      }
    }

    return validSymbols;
  }

  private static validateMood(mood: any): "positive" | "negative" | "neutral" {
    return ["positive", "negative", "neutral"].includes(mood)
      ? mood
      : "neutral";
  }

  private static validateThemes(themes: any[]): string[] {
    return themes
      .slice(0, 3)
      .filter((theme) => typeof theme === "string" && theme.trim().length > 0)
      .map((theme) => String(theme).trim());
  }

  private static getFallbackInterpretation(
    dreamTitle: string,
    dreamContent: string
  ): Omit<DreamInterpretation, "id" | "dreamId" | "createdAt"> {
    // 기본 상징 추출
    const symbols: DreamSymbol[] = [];
    const content = (dreamTitle + " " + dreamContent).toLowerCase();

    const symbolMap = {
      물: { meaning: "감정과 무의식의 흐름", significance: "high" as const },
      바다: { meaning: "무의식과 감정의 깊이", significance: "high" as const },
      비행: { meaning: "자유와 해방감", significance: "medium" as const },
      날기: {
        meaning: "제약에서 벗어나고 싶은 욕구",
        significance: "medium" as const,
      },
      집: { meaning: "안전과 자아정체성", significance: "high" as const },
      가족: { meaning: "소속감과 정서적 유대", significance: "high" as const },
      동물: {
        meaning: "본능적 충동과 자연성",
        significance: "medium" as const,
      },
      길: { meaning: "인생의 여정과 선택", significance: "medium" as const },
      어둠: { meaning: "불안과 두려움", significance: "medium" as const },
      빛: { meaning: "희망과 깨달음", significance: "medium" as const },
    };

    for (const [symbol, data] of Object.entries(symbolMap)) {
      if (content.includes(symbol) && symbols.length < 3) {
        symbols.push({
          symbol,
          meaning: data.meaning,
          significance: data.significance,
        });
      }
    }

    // 기본 감정 분석
    const positiveWords = [
      "행복",
      "기쁨",
      "웃음",
      "사랑",
      "평화",
      "아름다운",
      "좋은",
      "밝은",
    ];
    const negativeWords = [
      "무서운",
      "슬픈",
      "화나는",
      "걱정",
      "불안",
      "어두운",
      "나쁜",
      "두려운",
    ];

    const positiveCount = positiveWords.filter((word) =>
      content.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      content.includes(word)
    ).length;

    let mood: "positive" | "negative" | "neutral" = "neutral";
    if (positiveCount > negativeCount) mood = "positive";
    else if (negativeCount > positiveCount) mood = "negative";

    // 기본 테마 추출
    const themes: string[] = [];
    if (
      content.includes("가족") ||
      content.includes("부모") ||
      content.includes("형제")
    )
      themes.push("가족 관계");
    if (
      content.includes("학교") ||
      content.includes("공부") ||
      content.includes("시험")
    )
      themes.push("학업과 성장");
    if (
      content.includes("친구") ||
      content.includes("사람") ||
      content.includes("관계")
    )
      themes.push("인간관계");
    if (
      content.includes("미래") ||
      content.includes("목표") ||
      content.includes("꿈")
    )
      themes.push("미래에 대한 고민");
    if (
      content.includes("과거") ||
      content.includes("어린") ||
      content.includes("옛날")
    )
      themes.push("과거 회상");
    if (
      content.includes("직장") ||
      content.includes("일") ||
      content.includes("업무")
    )
      themes.push("직업과 책임");

    return {
      analysis: this.generateFallbackAnalysis(symbols, themes, mood),
      symbols,
      mood,
      themes: themes.slice(0, 3),
    };
  }

  private static generateFallbackAnalysis(
    symbols: DreamSymbol[],
    themes: string[],
    mood: string
  ): string {
    let analysis =
      "이 꿈은 당신의 현재 심리상태와 내면의 감정을 반영하고 있습니다. ";

    if (symbols.length > 0) {
      analysis += `특히 "${symbols[0].symbol}"이 나타나는 것은 ${symbols[0].meaning}을 의미할 수 있습니다. `;
    }

    if (themes.length > 0) {
      analysis += `현재 ${themes[0]}에 대한 관심이나 고민이 꿈에 투영된 것으로 보입니다. `;
    }

    switch (mood) {
      case "positive":
        analysis +=
          "전반적으로 긍정적인 에너지가 감지되며, 내면의 평화로움을 나타냅니다. ";
        break;
      case "negative":
        analysis +=
          "다소 불안하거나 스트레스를 받고 있는 상황이 반영된 것 같습니다. ";
        break;
      default:
        analysis +=
          "균형잡힌 심리상태를 보여주며, 현재 상황을 객관적으로 바라보고 있는 것 같습니다. ";
    }

    analysis +=
      "꿈을 통해 자신의 감정을 이해하고 내면과 소통하는 시간을 가져보세요.";

    return analysis;
  }
}
