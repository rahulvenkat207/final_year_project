"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMeetingFilters } from "../../hooks/use-meeting-filters";
import { useEffect, useState, useRef } from "react";
import { DEFAULT_PAGE } from "@/constants";

export const MeetingsSearchFilter = () => {
    const [filters, setFilters] = useMeetingFilters();
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setFilters({ search: searchValue || "", page: DEFAULT_PAGE });
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchValue, setFilters]);

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
                placeholder="Search meetings..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
            />
        </div>
    );
};

