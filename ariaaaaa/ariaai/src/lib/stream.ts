import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";

// Stream Video Client
export const getStreamVideoClient = (userId: string, token: string) => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
    }

    return new StreamVideoClient({
        apiKey,
        user: {
            id: userId,
        },
        token,
    });
};

// Stream Chat Client
export const getStreamChatClient = (userId: string, token: string) => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
    }

    return StreamChat.getInstance(apiKey, {
        token,
        user: {
            id: userId,
        },
    });
};

// Server-side Stream client for API routes
export const getStreamServerClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    
    if (!apiKey || !apiSecret) {
        throw new Error("Stream API credentials are not set");
    }

    return StreamChat.getInstance(apiKey, apiSecret);
};



