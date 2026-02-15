import { AccessToken } from "livekit-server-sdk";

// Generate LiveKit access token
export const generateLiveKitToken = (
    userId: string,
    roomName: string,
    apiKey: string,
    apiSecret: string
): string => {
    const token = new AccessToken(apiKey, apiSecret, {
        identity: userId,
    });

    token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
    });

    return token.toJwt();
};

// Get LiveKit server credentials
export const getLiveKitServerCredentials = () => {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
        throw new Error("LiveKit API credentials are not set");
    }

    return { apiKey, apiSecret };
};

// Get LiveKit WebSocket URL
export const getLiveKitUrl = () => {
    return process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "";
};

