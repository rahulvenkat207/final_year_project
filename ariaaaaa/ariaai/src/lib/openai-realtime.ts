import OpenAI from "openai";

// OpenAI Realtime API client for AI agent voice interaction
export class OpenAIRealtimeClient {
    private ws: WebSocket | null = null;
    private openai: OpenAI;
    private agentId: string;
    private instructions: string;
    private onTranscript?: (text: string) => void;
    private onAudio?: (audio: ArrayBuffer) => void;

    constructor(agentId: string, instructions: string) {
        this.agentId = agentId;
        this.instructions = instructions;
        this.openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
        });
    }

    async connect(
        onTranscript?: (text: string) => void,
        onAudio?: (audio: ArrayBuffer) => void
    ) {
        this.onTranscript = onTranscript;
        this.onAudio = onAudio;

        // Get session from OpenAI Realtime API
        const response = await this.openai.beta.realtime.connect(this.agentId, {
            model: "gpt-4o-realtime-preview-2024-12-17",
            voice: "alloy",
            instructions: this.instructions,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
        });

        // Note: OpenAI Realtime API uses WebSocket
        // This is a simplified implementation - actual implementation would use WebSocket
        // For now, we'll create a placeholder that can be completed with actual WebSocket connection

        return response;
    }

    async sendAudio(audioData: ArrayBuffer) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not connected");
        }

        // Send audio to OpenAI Realtime API
        this.ws.send(audioData);
    }

    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // Process audio from Stream call and send to OpenAI
    async processStreamAudio(audioStream: MediaStream) {
        const audioContext = new AudioContext({ sampleRate: 24000 });
        const source = audioContext.createMediaStreamSource(audioStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = async (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = this.convertFloat32ToPCM16(inputData);
            
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                await this.sendAudio(pcm16.buffer);
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
    }

    private convertFloat32ToPCM16(float32Array: Float32Array): Int16Array {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }
}



