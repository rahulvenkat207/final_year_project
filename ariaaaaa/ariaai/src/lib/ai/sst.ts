// Speech-to-Speech (SST) Integration
// Supports: Sarvam AI and AssemblyAI

export type SSTProvider = "sarvam" | "assemblyai";

interface SSTConfig {
    provider: SSTProvider;
    apiKey: string;
    meetingId: string;
    agentInstructions: string;
    onTranscript?: (text: string) => void;
    onResponse?: (audio: ArrayBuffer) => void;
}

// Sarvam AI SST Integration
export class SarvamSST {
    private apiKey: string;
    private meetingId: string;
    private agentInstructions: string;
    private onTranscript?: (text: string) => void;
    private onResponse?: (audio: ArrayBuffer) => void;
    private ws: WebSocket | null = null;

    constructor(config: SSTConfig) {
        this.apiKey = config.apiKey;
        this.meetingId = config.meetingId;
        this.agentInstructions = config.agentInstructions;
        this.onTranscript = config.onTranscript;
        this.onResponse = config.onResponse;
    }

    async connect() {
        // Sarvam AI WebSocket connection for real-time speech-to-speech
        // Note: Check Sarvam AI documentation for actual WebSocket endpoint
        const wsUrl = `wss://api.sarvam.ai/v1/realtime?api_key=${this.apiKey}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log("Sarvam SST connected");
            // Send initial configuration
            this.ws?.send(JSON.stringify({
                type: "config",
                instructions: this.agentInstructions,
                meeting_id: this.meetingId,
            }));
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "transcript") {
                this.onTranscript?.(data.text);
            } else if (data.type === "audio") {
                // Convert base64 audio to ArrayBuffer
                const audioBuffer = Buffer.from(data.audio, "base64");
                this.onResponse?.(audioBuffer);
            }
        };

        this.ws.onerror = (error) => {
            console.error("Sarvam SST error:", error);
        };

        this.ws.onclose = () => {
            console.log("Sarvam SST disconnected");
        };
    }

    async sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not connected");
        }

        // Convert audio to base64
        const base64Audio = Buffer.from(audioData).toString("base64");
        this.ws.send(JSON.stringify({
            type: "audio",
            data: base64Audio,
        }));
    }

    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// AssemblyAI SST Integration
export class AssemblyAISST {
    private apiKey: string;
    private meetingId: string;
    private agentInstructions: string;
    private onTranscript?: (text: string) => void;
    private onResponse?: (audio: ArrayBuffer) => void;
    private ws: WebSocket | null = null;

    constructor(config: SSTConfig) {
        this.apiKey = config.apiKey;
        this.meetingId = config.meetingId;
        this.agentInstructions = config.agentInstructions;
        this.onTranscript = config.onTranscript;
        this.onResponse = config.onResponse;
    }

    async connect() {
        // AssemblyAI Realtime API WebSocket
        const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${this.apiKey}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log("AssemblyAI SST connected");
            // Send configuration
            this.ws?.send(JSON.stringify({
                config: {
                    sample_rate: 16000,
                    word_boost: this.agentInstructions.split(" "),
                },
            }));
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.message_type === "SessionBegins") {
                console.log("AssemblyAI session started");
            } else if (data.message_type === "PartialTranscript" || data.message_type === "FinalTranscript") {
                this.onTranscript?.(data.text);
            }
        };

        this.ws.onerror = (error) => {
            console.error("AssemblyAI SST error:", error);
        };

        this.ws.onclose = () => {
            console.log("AssemblyAI SST disconnected");
        };
    }

    async sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not connected");
        }

        // AssemblyAI expects PCM16 audio
        this.ws.send(audioData);
    }

    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Factory function to create SST client
export const createSSTClient = (config: SSTConfig) => {
    if (config.provider === "sarvam") {
        return new SarvamSST(config);
    } else if (config.provider === "assemblyai") {
        return new AssemblyAISST(config);
    }
    throw new Error(`Unsupported SST provider: ${config.provider}`);
};

