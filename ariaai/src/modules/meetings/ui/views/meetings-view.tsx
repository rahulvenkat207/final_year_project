"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { DataTable } from "@/modules/agents/ui/components/data-table";
import { EmptyState } from "@/components/empty-sate";
import { meetingsColumns } from "../components/meetings-columns";
import { useMeetingFilters } from "../../hooks/use-meeting-filters";
import { DataPagination } from "@/modules/agents/ui/components/data-pagination";
import { useRouter } from "next/navigation";

export const MeetingsView = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const [filters, setFilters] = useMeetingFilters();
    
    const { data, error } = useSuspenseQuery(
        trpc.meetings.getMany.queryOptions({
            ...filters,
        })
    );

    if (error) {
        console.error("Meetings query error:", error);
    }

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4 bg-white/95 backdrop-blur-sm rounded-lg m-4">
            <DataTable
                data={data.items}
                columns={meetingsColumns}
                onRowClick={(row) => router.push(`/meetings/${row.id}`)}
            />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            {data.items.length === 0 && (
                <EmptyState
                    title="Create your first meeting"
                    description="Create a meeting and assign an AI agent to join. The agent will follow your instructions and interact with participants during the call."
                />
            )}
        </div>
    );
};

export const MeetingsViewLoading = () => {
    return (
        <LoadingState title="Loading Meetings" description="This may take few seconds" />
    );
};

export const MeetingsViewError = () => {
    return (
        <ErrorState title="Error Loading Meetings" description="Something went wrong" />
    );
};
 