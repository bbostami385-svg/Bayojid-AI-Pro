import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

const SUPPORTED_LANGUAGES = {
  bn: "বাংলা",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  zh: "中文",
  ar: "العربية",
  hi: "हिन्दी",
  pt: "Português",
  ru: "Русский",
  ko: "한국어",
};

export const translationRouter = router({
  /**
   * Translate text to target language
   */
  translate: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        targetLanguage: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [keyof typeof SUPPORTED_LANGUAGES]),
        sourceLanguage: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [keyof typeof SUPPORTED_LANGUAGES]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const sourceLanguageName = input.sourceLanguage ? SUPPORTED_LANGUAGES[input.sourceLanguage] : "auto-detect";
        const targetLanguageName = SUPPORTED_LANGUAGES[input.targetLanguage];

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `আপনি একজন পেশাদার অনুবাদক। ${sourceLanguageName} থেকে ${targetLanguageName} এ নির্ভুলভাবে অনুবাদ করুন।
              শুধুমাত্র অনুবাদিত পাঠ্য ফেরত দিন, অন্য কিছু নয়।`,
            },
            {
              role: "user",
              content: input.text,
            },
          ],
        });

        const translatedText = response.choices[0].message.content;

        return {
          success: true,
          original: input.text,
          translated: typeof translatedText === "string" ? translatedText : "",
          sourceLanguage: input.sourceLanguage || "auto",
          targetLanguage: input.targetLanguage,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Translation failed:", error);
        throw new Error("অনুবাদ ব্যর্থ / Translation failed");
      }
    }),

  /**
   * Detect language of text
   */
  detectLanguage: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `এই পাঠ্যের ভাষা সনাক্ত করুন। শুধুমাত্র ভাষা কোড ফেরত দিন (bn, en, es, fr, de, ja, zh, ar, hi, pt, ru, ko)।`,
            },
            {
              role: "user",
              content: input.text,
            },
          ],
        });

        const languageCode = response.choices[0].message.content;

        return {
          success: true,
          text: input.text,
          detectedLanguage: typeof languageCode === "string" ? languageCode.toLowerCase() : "unknown",
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Language detection failed:", error);
        return {
          success: false,
          text: input.text,
          detectedLanguage: "unknown",
        };
      }
    }),

  /**
   * Translate conversation messages
   */
  translateConversation: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        targetLanguage: z.enum(Object.keys(SUPPORTED_LANGUAGES) as [keyof typeof SUPPORTED_LANGUAGES]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const targetLanguageName = SUPPORTED_LANGUAGES[input.targetLanguage];

        const translatedMessages = await Promise.all(
          input.messages.map(async (msg) => {
            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `এই বার্তা ${targetLanguageName} এ অনুবাদ করুন। শুধুমাত্র অনুবাদিত পাঠ্য ফেরত দিন।`,
                },
                {
                  role: "user",
                  content: msg.content,
                },
              ],
            });

            const translatedContent = response.choices[0].message.content;

            return {
              role: msg.role,
              content: typeof translatedContent === "string" ? translatedContent : msg.content,
            };
          })
        );

        return {
          success: true,
          originalMessages: input.messages,
          translatedMessages,
          targetLanguage: input.targetLanguage,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Conversation translation failed:", error);
        throw new Error("কথোপকথন অনুবাদ ব্যর্থ / Conversation translation failed");
      }
    }),

  /**
   * Get supported languages
   */
  getSupportedLanguages: protectedProcedure.query(() => {
    return {
      languages: SUPPORTED_LANGUAGES,
      count: Object.keys(SUPPORTED_LANGUAGES).length,
    };
  }),
});
