"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MeetingGetOne } from "../../types";
import { Badge } from "@/components/ui/badge";
import { VideoIcon, Clock, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
    upcoming: { label: "Upcoming", icon: Clock, variant: "outline" as const },
    active: { label: "Active", icon: VideoIcon, variant: "default" as const },
    processing: { label: "Processing", icon: Loader2, variant: "secondary" as const },
    completed: { label: "Completed", icon: CheckCircle2, variant: "default" as const },
    cancelled: { label: "Cancelled", icon: XCircle, variant: "destructive" as const },
};

export const meetingsColumns: ColumnDef<MeetingGetOne>[] = [
    {
        accessorKey: "name",
        header: () => <span className="text-gray-900 font-semibold">Meeting Name</span>,
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold text-gray-900">{row.original.name}</span>
                {row.original.createdAt && (
                    <span className="text-sm text-gray-600">
                        Created {format(new Date(row.original.createdAt), "MMM d, yyyy")}
                    </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <span className="text-gray-900 font-semibold">Status</span>,
        cell: ({ row }) => {
            const status = row.original.status;
            const config = statusConfig[status] || statusConfig.upcoming;
            const Icon = config.icon;
            return (
                <Badge variant={config.variant} className="flex items-center gap-x-2 w-fit">
                    <Icon className="size-3" />
                    {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "startedAt",
        header: () => <span className="text-gray-900 font-semibold">Started</span>,
        cell: ({ row }) => {
            const startedAt = row.original.startedAt;
            if (!startedAt) return <span className="text-gray-500">-</span>;
            return (
                <div className="flex items-center gap-x-1 text-sm text-gray-700">
                    <Calendar className="size-3 text-gray-500" />
                    {format(new Date(startedAt), "MMM d, HH:mm")}
                </div>
            );
        },
    },
    {
        accessorKey: "endedAt",
        header: () => <span className="text-gray-900 font-semibold">Ended</span>,
        cell: ({ row }) => {
            const endedAt = row.original.endedAt;
            if (!endedAt) return <span className="text-gray-500">-</span>;
            return (
                <div className="flex items-center gap-x-1 text-sm text-gray-700">
                    <Calendar className="size-3 text-gray-500" />
                    {format(new Date(endedAt), "MMM d, HH:mm")}
                </div>
            );
        },
    },
];

