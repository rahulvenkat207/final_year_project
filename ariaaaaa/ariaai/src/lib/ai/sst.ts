// Speech-to-Speech (SST) Integration
// Supports: Sarvam AI, AssemblyAI, Groq, and Web Speech API

export type SSTProvider = "sarvam" | "assemblyai" | "groq" | "webspeech";

interface SSTConfig {
    provider: SSTProvider;
    apiKey: string;
    meetingId: string;
    agentInstructions: string;
    onTranscript?: (text: string) => void;
    onResponse?: (audio: ArrayBuffer) => void;
}

// Groq Whisper STT (REST based on chunks)
export class GroqSST {
    private apiKey: string;
    private onTranscript?: (text: string) => void;
    private audioBuffer: Int16Array[] = [];
    private lastSendTime = 0;

    constructor(config: SSTConfig) {
        this.apiKey = config.apiKey;
        this.onTranscript = config.onTranscript;
    }

    async connect() { 
        console.log("[Groq STT] Ready (Chunk-automated)"); 
    }
    
    async disconnect() { 
        this.audioBuffer = []; 
    }

    async sendAudio(audioData: ArrayBuffer) {
        this.audioBuffer.push(new Int16Array(audioData));
        const now = Date.now();
        
        // Send chunks every 1.5 seconds for near real-time processing
        if (now - this.lastSendTime > 1500 && this.audioBuffer.length > 0) {
            this.lastSendTime = now;
            const wavBlob = this.encodeWAV(this.audioBuffer);
            this.audioBuffer = [];
            this.recognize(wavBlob);
        }
    }

    private encodeWAV(samples: Int16Array[]): Blob {
        const totalLength = samples.reduce((acc, curr) => acc + curr.length, 0);
        const buffer = new ArrayBuffer(44 + totalLength * 2);
        const view = new DataView(buffer);

        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + totalLength * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, 16000, true); // Sample Rate
        view.setUint32(28, 16000 * 2, true); // Byte Rate
        view.setUint16(32, 2, true); // Block Align
        view.setUint16(34, 16, true); // Bits per Sample
        writeString(36, 'data');
        view.setUint32(40, totalLength * 2, true);

        let offset = 44;
        for (const sample of samples) {
            for (let i = 0; i < sample.length; i++) {
                view.setInt16(offset, sample[i], true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    private async recognize(blob: Blob) {
        try {
            const formData = new FormData();
            formData.append("file", blob, "audio.wav");
            formData.append("model", "whisper-large-v3-turbo");
            formData.append("response_format", "json");

            const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${this.apiKey}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.text?.trim() && data.text.length > 1) {
                    console.log("[Groq STT] Transcript:", data.text);
                    this.onTranscript?.(data.text);
                }
            } else {
                const error = await response.text();
                console.warn("[Groq STT] API Error:", error);
            }
        } catch (e) {
            console.warn("[Groq STT] Recognition error:", e);
        }
    }
}

// Browser Native Web Speech API STT
export class WebSpeechSST {
    private recognition: any = null;
    private onTranscript?: (text: string) => void;

    constructor(config: SSTConfig) {
        this.onTranscript = config.onTranscript;
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                
                this.recognition.onresult = (event: any) => {
                    const result = event.results[event.results.length - 1];
                    if (result.isFinal) {
                        const transcript = result[0].transcript;
                        console.log("[Web Speech STT] Final:", transcript);
                        this.onTranscript?.(transcript);
                    }
                };
                
                this.recognition.onerror = (event: any) => {
                    console.error("[Web Speech STT] Error:", event.error);
                };
            }
        }
    }

    async connect() { 
        try {
            this.recognition?.start(); 
            console.log("[Web Speech STT] Started"); 
        } catch (e) {
            console.warn("[Web Speech STT] Start failed (maybe already running)");
        }
    }
    
    async disconnect() { 
        this.recognition?.stop(); 
    }
    
    async sendAudio() { /* Native API uses mic directly */ }
}

// Sarvam AI SST Integration
export class SarvamSST {
    private apiKey: string;
    private onTranscript?: (text: string) => void;
    private onResponse?: (audio: ArrayBuffer) => void;
    private ws: WebSocket | null = null;
    private connected: boolean = false;

    constructor(config: SSTConfig) {
        this.apiKey = config.apiKey;
        this.onTranscript = config.onTranscript;
        this.onResponse = config.onResponse;
    }

    async connect() {
        const wsUrl = `wss://api.sarvam.ai/speech-to-text-translate/ws?api-subscription-key=${this.apiKey}`;
        console.log("[Sarvam SST] Connecting...");
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            this.connected = true;
            console.log("[Sarvam SST] Connected");
            this.ws?.send(JSON.stringify({
                action: "start",
                sampling_rate: 16000,
                provider: "sarvam",
                metadata: { "api-subscription-key": this.apiKey }
            }));
        };
        
        this.ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "transcript") {
                    this.onTranscript?.(data.text);
                } else if (data.type === "audio") {
                    const audioBuffer = Buffer.from(data.audio, "base64");
                    this.onResponse?.(audioBuffer.buffer as ArrayBuffer);
                }
            } catch (e) {}
        };
        
        this.ws.onerror = (err) => { 
            console.error("[Sarvam SST] Socket error");
            this.connected = false; 
        };
        
        this.ws.onclose = () => { 
            this.connected = false; 
        };
    }

    async sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || !this.connected || this.ws.readyState !== WebSocket.OPEN) return;
        const base64Audio = Buffer.from(audioData).toString("base64");
        this.ws.send(JSON.stringify({ type: "audio", data: base64Audio }));
    }

    async disconnect() {
        this.connected = false;
        if (this.ws) { this.ws.close(); this.ws = null; }
    }
}

// AssemblyAI SST Integration
export class AssemblyAISST {
    private apiKey: string;
    private onTranscript?: (text: string) => void;
    private ws: WebSocket | null = null;
    private connected: boolean = false;

    constructor(config: SSTConfig) {
        this.apiKey = config.apiKey;
        this.onTranscript = config.onTranscript;
    }

    async connect() {
        const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${this.apiKey}`;
        console.log("[AssemblyAI SST] Connecting...");
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            this.connected = true;
            console.log("[AssemblyAI SST] Connected");
            this.ws?.send(JSON.stringify({ config: { sample_rate: 16000 } }));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message_type === "PartialTranscript" || data.message_type === "FinalTranscript") {
                this.onTranscript?.(data.text);
            }
        };
        
        this.ws.onerror = () => { this.connected = false; };
        this.ws.onclose = () => { this.connected = false; };
    }

    async sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || !this.connected || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(audioData);
    }

    async disconnect() {
        this.connected = false;
        if (this.ws) { this.ws.close(); this.ws = null; }
    }
}

export const createSSTClient = (config: SSTConfig) => {
    switch (config.provider) {
        case "sarvam": return new SarvamSST(config);
        case "assemblyai": return new AssemblyAISST(config);
        case "groq": return new GroqSST(config);
        case "webspeech": return new WebSpeechSST(config);
        default: return new WebSpeechSST(config); // Fallback
    }
};
