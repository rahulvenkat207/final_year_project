"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { StreamChat, type Channel as StreamChannel } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import { LoadingState } from "@/components/loading-state";

interface MeetingChatProps {
    meetingId: string;
}

export const MeetingChat = ({ meetingId }: MeetingChatProps) => {
    const { data: session } = authClient.useSession();
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) return;

        const initializeChat = async () => {
            try {
                setIsLoading(true);

                const tokenResponse = await fetch("/api/stream/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "chat" }),
                });

                if (!tokenResponse.ok) throw new Error("Failed to get Stream token");

                const { token } = await tokenResponse.json();

                const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
                if (!apiKey) throw new Error("Stream API key not configured");

                const client = StreamChat.getInstance(apiKey);
                await client.connectUser(
                    {
                        id: session.user.id,
                        name: session.user.name || "User",
                        image: session.user.image || undefined,
                    },
                    token
                );

                const channelId = `meeting-${meetingId}`;
                const ch = client.channel("messaging", channelId);
                await ch.watch();

                setChatClient(client);
                setChannel(ch);
                setIsLoading(false);
            } catch (error) {
                console.error("Error initializing chat:", error);
                setIsLoading(false);
            }
        };

        initializeChat();

        return () => {
            chatClient?.disconnectUser().catch(console.error);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id, meetingId]);

    if (isLoading || !chatClient || !channel) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <LoadingState title="Loading chat..." description="This may take a few seconds" />
            </div>
        );
    }

    return (
        <Chat client={chatClient}>
            <Channel channel={channel}>
                <div className="flex flex-col h-[600px]">
                    <div className="flex-1 overflow-hidden">
                        <MessageList />
                    </div>
                    <div className="border-t p-4">
                        <MessageInput />
                    </div>
                </div>
            </Channel>
        </Chat>
    );
};
