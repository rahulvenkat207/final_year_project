"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { useState } from "react";
import { useMeetingFilters } from "../../hooks/use-meeting-filters";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import { DEFAULT_PAGE } from "@/constants";

export const MeetingsListHeader = () => {
    const [filters, setFilters] = useMeetingFilters();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onClearFilters = () => {
        setFilters({
            search: "",
            page: DEFAULT_PAGE
        });
    };

    const isAnyFilterModified = !!filters.search;

    return (
        <>
            <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4 bg-white/95 backdrop-blur-sm rounded-lg m-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl text-gray-900">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Meeting
                    </Button>
                </div>
                <div className="flex items-center gap-x-2 p-1">
                    <MeetingsSearchFilter />
                    {isAnyFilterModified && (
                        <Button onClick={onClearFilters} size="sm" variant="outline">
                            <XCircleIcon className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

