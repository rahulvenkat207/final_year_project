"use client "

import { ColumnDef } from "@tanstack/react-table"
import { AgentGetOne } from "../../types"
import { GeneratedAvatar } from "@/components/generated-avatar"

import { Badge } from "@/components/ui/badge"
import { CornerDownRight, VideoIcon } from "lucide-react"

export const columns: ColumnDef<AgentGetOne>[] = [
    {
        accessorKey: "name",
        header: () => <span className="text-gray-900 font-semibold">Agent Name</span>,

        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-2">
                    <GeneratedAvatar
                        variant="botttsNeutral"
                        seed={row.original.name}
                        className="size-6"
                    />
                    <span className="font-semibold capitalize text-gray-900">{row.original.name}</span>
                </div>

                <div className="flex item-center gap-x-2">
                    <CornerDownRight className="size-3 text-gray-500" />
                    <span className="text-sm text-gray-600 max-w-[200px] truncate capitalize">
                        {row.original.instructions}
                    </span>

                </div>
            </div>
        )
    },
    {
        accessorKey: "meetingCount",
        header: () => <span className="text-gray-900 font-semibold">Meetings</span>,
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4"
            >
                <VideoIcon className="text-purple-600" />
        <span className="text-gray-900">{row.original.meetingCount} {row.original.meetingCount===1? "meeting" : "meetings"}</span> 
            </Badge>
        )
    }

]