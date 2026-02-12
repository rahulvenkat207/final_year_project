import { Suspense } from "react";
import { MeetingCallView } from "@/modules/meetings/ui/views/meeting-call-view";

interface Props {
    params: Promise<{
        meetingId: string;
    }>;
}

const Page = async ({ params }: Props) => {
    const { meetingId } = await params;

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading call...</div>}>
            <MeetingCallView meetingId={meetingId} />
        </Suspense>
    );
};

export default Page;

