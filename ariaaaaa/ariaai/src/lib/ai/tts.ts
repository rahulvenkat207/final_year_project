// Text-to-Speech (TTS) Integration
// Supports: Cartesian, ElevenLabs, Sarvam AI, Web Speech API

export type TTSProvider = "cartesian" | "elevenlabs" | "sarvam" | "webspeech";

interface TTSConfig {
    provider: TTSProvider;
    apiKey: string;
    voiceId?: string;
    model?: string;
}

// Browser Native Web Speech API TTS
export class WebSpeechTTS {
    constructor(config: TTSConfig) {
        // Native Speech doesn't need config, but we keep the signature consistent
    }
    async synthesize(text: string): Promise<ArrayBuffer> {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                // Since this goes directly to speakers, we return an empty buffer
                // but we could theoretically capture it if needed.
                resolve(new ArrayBuffer(0));
            };
            window.speechSynthesis.speak(utterance);
        });
    }

    async synthesizeStream(text: string, onChunk: (audio: ArrayBuffer) => void): Promise<void> {
        await this.synthesize(text);
    }
}

// Cartesian TTS Integration
export class CartesianTTS {
    private apiKey: string;
    private voiceId: string;
    private baseUrl = "https://api.cartesian.ai/v1";

    constructor(config: TTSConfig) {
        this.apiKey = config.apiKey;
        this.voiceId = config.voiceId || "default";
    }

    async synthesize(text: string): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/tts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                text,
                voice_id: this.voiceId,
                format: "pcm16",
                sample_rate: 24000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Cartesian TTS error: ${error}`);
        }

        return await response.arrayBuffer();
    }

    async synthesizeStream(text: string, onChunk: (audio: ArrayBuffer) => void): Promise<void> {
        const response = await fetch(`${this.baseUrl}/tts/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                text,
                voice_id: this.voiceId,
                format: "pcm16",
                sample_rate: 24000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Cartesian TTS error: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onChunk(value.buffer);
        }
    }
}

// ElevenLabs TTS Integration
export class ElevenLabsTTS {
    private apiKey: string;
    private voiceId: string;
    private model: string;
    private baseUrl = "https://api.elevenlabs.io/v1";

    constructor(config: TTSConfig) {
        this.apiKey = config.apiKey;
        this.voiceId = config.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default voice
        this.model = config.model || "eleven_multilingual_v2";
    }

    async synthesize(text: string): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": this.apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: this.model,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs TTS error: ${error}`);
        }

        return await response.arrayBuffer();
    }

    async synthesizeStream(text: string, onChunk: (audio: ArrayBuffer) => void): Promise<void> {
        const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": this.apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: this.model,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ElevenLabs TTS error: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onChunk(value.buffer);
        }
    }
}

// Sarvam AI TTS Integration
export class SarvamTTS {
    private apiKey: string;
    private voiceId: string;
    private baseUrl = "https://api.sarvam.ai/v1";

    constructor(config: TTSConfig) {
        this.apiKey = config.apiKey;
        this.voiceId = config.voiceId || "default";
    }

    async synthesize(text: string): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/tts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                text,
                voice_id: this.voiceId,
                language: "en-IN",
                format: "pcm16",
                sample_rate: 24000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Sarvam TTS error: ${error}`);
        }

        return await response.arrayBuffer();
    }

    async synthesizeStream(text: string, onChunk: (audio: ArrayBuffer) => void): Promise<void> {
        const response = await fetch(`${this.baseUrl}/tts/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                text,
                voice_id: this.voiceId,
                language: "en-IN",
                format: "pcm16",
                sample_rate: 24000,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Sarvam TTS error: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No response body");
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onChunk(value.buffer);
        }
    }
}

// Factory function to create TTS client
export const createTTSClient = (config: TTSConfig) => {
    switch (config.provider) {
        case "cartesian": return new CartesianTTS(config);
        case "elevenlabs": return new ElevenLabsTTS(config);
        case "sarvam": return new SarvamTTS(config);
        case "webspeech": return new WebSpeechTTS(config);
        default: return new WebSpeechTTS(config);
    }
};
