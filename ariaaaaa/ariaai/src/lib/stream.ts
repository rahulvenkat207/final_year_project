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

    return StreamChat.getInstance(apiKey);
};

// Server-side Stream client for API routes
export const getStreamServerClient = (type: "chat" | "video" = "chat") => {
    if (type === "video") {
        const { StreamClient } = require("@stream-io/node-sdk");
        const apiKey = process.env.NEXT_PUBLIC_STREAM_VEDIO_API_KEY;
        const apiSecret = process.env.STREAM_VEDIO_SECRET_KEY;

        if (!apiKey || !apiSecret) {
            throw new Error("Stream Video API credentials are not set");
        }

        return new StreamClient(apiKey, apiSecret);
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    
    if (!apiKey || !apiSecret) {
        throw new Error("Stream Chat API credentials are not set");
    }

    return StreamChat.getInstance(apiKey, apiSecret);
};




