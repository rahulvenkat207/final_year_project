// AI Agent Voice Integration
// Combines SST (Speech-to-Speech) + LLM + TTS for complete voice interaction

import { createSSTClient, SSTProvider } from "./sst";
import { createLLMClient, LLMProvider } from "./llm";
import { createTTSClient, TTSProvider } from "./tts";

interface AgentVoiceConfig {
    sstProvider: SSTProvider;
    sstApiKey: string;
    llmProvider: LLMProvider;
    llmApiKey: string;
    ttsProvider: TTSProvider;
    ttsApiKey: string;
    ttsVoiceId?: string;
    meetingId: string;
    agentInstructions: string;
    onTranscript?: (text: string) => void;
}

export class AgentVoiceHandler {
    private sstClient: any;
    private llmClient: any;
    private ttsClient: any;
    private meetingId: string;
    private agentInstructions: string;
    private onTranscript?: (text: string) => void;
    private audioContext: AudioContext | null = null;
    private mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;

    constructor(config: AgentVoiceConfig) {
        this.meetingId = config.meetingId;
        this.agentInstructions = config.agentInstructions;
        this.onTranscript = config.onTranscript;

        // Initialize SST client
        this.sstClient = createSSTClient({
            provider: config.sstProvider,
            apiKey: config.sstApiKey,
            meetingId: config.meetingId,
            agentInstructions: config.agentInstructions,
            onTranscript: (text: string) => {
                this.onTranscript?.(text);
                this.processTranscript(text);
            },
        });

        // Initialize LLM client
        this.llmClient = createLLMClient({
            provider: config.llmProvider,
            apiKey: config.llmApiKey,
        });

        // Initialize TTS client
        this.ttsClient = createTTSClient({
            provider: config.ttsProvider,
            apiKey: config.ttsApiKey,
            voiceId: config.ttsVoiceId,
        });
    }

    async connect() {
        await this.sstClient.connect();
    }

    async disconnect() {
        await this.sstClient.disconnect();
        if (this.audioContext) {
            await this.audioContext.close();
        }
    }

    async sendAudio(audioData: ArrayBuffer) {
        await this.sstClient.sendAudio(audioData);
    }

    private async processTranscript(transcript: string) {
        try {
            // Get LLM response
            const response = await this.llmClient.chatCompletion([
                {
                    role: "system",
                    content: this.agentInstructions,
                },
                {
                    role: "user",
                    content: transcript,
                },
            ]);

            // Convert response to speech
            const audioBuffer = await this.ttsClient.synthesize(response);
            
            // Send audio back through SST or directly to LiveKit
            // This depends on your implementation
            this.onAudioResponse?.(audioBuffer);
        } catch (error) {
            console.error("Error processing transcript:", error);
        }
    }

    private onAudioResponse?: (audio: ArrayBuffer) => void;

    setAudioResponseHandler(handler: (audio: ArrayBuffer) => void) {
        this.onAudioResponse = handler;
    }

    // Process audio from LiveKit and send to SST
    async processLiveKitAudio(audioStream: MediaStream) {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
        }

        const source = this.audioContext.createMediaStreamSource(audioStream);
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = async (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = this.convertFloat32ToPCM16(inputData);
            await this.sendAudio(pcm16.buffer);
        };

        source.connect(processor);
        processor.connect(this.audioContext.destination);
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

