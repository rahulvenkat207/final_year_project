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
    private mixerNode: GainNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private lastProcessedTranscript: string = "";
    private lastProcessedTime: number = 0;
    private isLocked: boolean = false;
    private isSpeakingInternal: boolean = false;
    private onIsSpeaking?: (isSpeaking: boolean) => void;


    constructor(config: AgentVoiceConfig) {
        this.meetingId = config.meetingId;
        this.agentInstructions = config.agentInstructions;
        this.onTranscript = config.onTranscript;

        this.sstClient = createSSTClient({
            provider: config.sstProvider,
            apiKey: config.sstApiKey,
            meetingId: config.meetingId,
            agentInstructions: config.agentInstructions,
            onTranscript: (text: string) => {
                if (text?.trim()) {
                    this.onTranscript?.(text);
                    this.processTranscript(text);
                }
            },
        });

        this.llmClient = createLLMClient({
            provider: config.llmProvider,
            apiKey: config.llmApiKey,
        });

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
            this.audioContext = null;
        }
    }

    async sendAudio(audioData: ArrayBuffer) {
        await this.sstClient.sendAudio(audioData);
    }

    private async processTranscript(transcript: string) {
        // Prevent duplicate firing or hallucinations
        const now = Date.now();
        const cleanTranscript = transcript.toLowerCase().trim();
        
        // Ignore hallucinations or single common words if repeated too quickly
        if (cleanTranscript.length < 2 || (cleanTranscript === this.lastProcessedTranscript && now - this.lastProcessedTime < 5000)) {
            return;
        }

        if (this.isLocked) return;

        try {
            this.isLocked = true;
            this.lastProcessedTranscript = cleanTranscript;
            this.lastProcessedTime = now;

            const systemPrompt = this.agentInstructions || "You are a helpful AI assistant in a meeting. Be concise and natural in your speech. Focus on being a helpful participant.";
            
            const response = await this.llmClient.chatCompletion([
                { role: "system", content: systemPrompt },
                { role: "user", content: transcript },
            ]);

            console.log("[AI Agent] Response:", response);

            this.isSpeakingInternal = true;
            this.onIsSpeaking?.(true);

            const audioBuffer = await this.ttsClient.synthesize(response);
            this.onAudioResponse?.(audioBuffer);
            
            // Heuristic for speaking duration (rough estimation)
            const duration = (audioBuffer.byteLength / 2) / 24000 * 1000;
            setTimeout(() => {
                this.isSpeakingInternal = false;
                this.onIsSpeaking?.(false);
            }, duration + 500);

        } catch (error) {
            console.error("Error processing transcript:", error);
            this.isSpeakingInternal = false;
            this.onIsSpeaking?.(false);
        } finally {
            this.isLocked = false;
        }
    }

    private onAudioResponse?: (audio: ArrayBuffer) => void;
    private onInterrupt?: () => void;

    setAudioResponseHandler(handler: (audio: ArrayBuffer) => void) {
        this.onAudioResponse = handler;
    }

    setInterruptHandler(handler: () => void) {
        this.onInterrupt = handler;
    }

    setIsSpeakingHandler(handler: (isSpeaking: boolean) => void) {
        this.onIsSpeaking = handler;
    }


    async processAudioStream(audioStream: MediaStream) {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.mixerNode = this.audioContext.createGain();
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
            
            this.processor.onaudioprocess = async (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                // Simple VAD: calculate RMS volume
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                
                // Detect interruption: if user volume is high, stop AI
                if (rms > 0.01 && this.isSpeakingInternal) {
                    this.onInterrupt?.();
                }

                // Only send audio if there's actual sound
                if (rms > 0.002) {
                    const pcm16 = this.convertFloat32ToPCM16(inputData);
                    await this.sendAudio(pcm16.buffer as ArrayBuffer);
                }
            };


            this.mixerNode.connect(this.processor);
            const silent = this.audioContext.createGain();
            silent.gain.value = 0;
            this.processor.connect(silent);
            silent.connect(this.audioContext.destination);
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.mixerNode!);
    }

    async speak(text: string) {
        try {
            this.isSpeakingInternal = true;
            this.onIsSpeaking?.(true);
            const audioBuffer = await this.ttsClient.synthesize(text);
            this.onAudioResponse?.(audioBuffer);
            
            const duration = (audioBuffer.byteLength / 2) / 24000 * 1000;
            setTimeout(() => {
                this.isSpeakingInternal = false;
                this.onIsSpeaking?.(false);
            }, duration + 500);
        } catch (error) {
            console.error("Agent speak error:", error);
            this.isSpeakingInternal = false;
            this.onIsSpeaking?.(false);
        }
    }


    async sayWelcome() {
        const welcomeText = "Hello! I am Aria, your AI assistant. I'm ready to help with this meeting.";
        await this.speak(welcomeText);
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
