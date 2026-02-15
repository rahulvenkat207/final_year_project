// LLM Integration for Summarization
// Supports: Grok (xAI), Kimi (Moonshot AI), Gemini (Google)

export type LLMProvider = "grok" | "kimi" | "gemini";

interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
}

interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

// Grok (xAI) Integration
export class GrokLLM {
    private apiKey: string;
    private baseUrl = "https://api.x.ai/v1";

    constructor(config: LLMConfig) {
        this.apiKey = config.apiKey;
    }

    async chatCompletion(messages: LLMMessage[], model: string = "grok-beta") {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Grok API error: ${error}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    }

    async summarize(transcript: string, instructions?: string): Promise<string> {
        const messages: LLMMessage[] = [
            {
                role: "system",
                content: instructions || "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
            },
            {
                role: "user",
                content: `Please summarize this meeting transcript:\n\n${transcript}`,
            },
        ];

        return this.chatCompletion(messages);
    }
}

// Kimi (Moonshot AI) Integration
export class KimiLLM {
    private apiKey: string;
    private baseUrl = "https://api.moonshot.cn/v1";

    constructor(config: LLMConfig) {
        this.apiKey = config.apiKey;
    }

    async chatCompletion(messages: LLMMessage[], model: string = "moonshot-v1-8k") {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Kimi API error: ${error}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    }

    async summarize(transcript: string, instructions?: string): Promise<string> {
        const messages: LLMMessage[] = [
            {
                role: "system",
                content: instructions || "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
            },
            {
                role: "user",
                content: `Please summarize this meeting transcript:\n\n${transcript}`,
            },
        ];

        return this.chatCompletion(messages);
    }
}

// Gemini (Google) Integration
export class GeminiLLM {
    private apiKey: string;
    private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    constructor(config: LLMConfig) {
        this.apiKey = config.apiKey;
    }

    async chatCompletion(messages: LLMMessage[], model: string = "gemini-pro") {
        // Convert messages to Gemini format
        const contents = messages
            .filter(m => m.role !== "system")
            .map(m => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

        // Add system instruction if present
        const systemInstruction = messages.find(m => m.role === "system")?.content;

        const response = await fetch(
            `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    async summarize(transcript: string, instructions?: string): Promise<string> {
        const messages: LLMMessage[] = [
            {
                role: "system",
                content: instructions || "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, organized summary with key points and action items.",
            },
            {
                role: "user",
                content: `Please summarize this meeting transcript:\n\n${transcript}`,
            },
        ];

        return this.chatCompletion(messages);
    }
}

// Factory function to create LLM client
export const createLLMClient = (config: LLMConfig) => {
    if (config.provider === "grok") {
        return new GrokLLM(config);
    } else if (config.provider === "kimi") {
        return new KimiLLM(config);
    } else if (config.provider === "gemini") {
        return new GeminiLLM(config);
    }
    throw new Error(`Unsupported LLM provider: ${config.provider}`);
};

