import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAgentsFilters } from "../../hooks/use-agent-filters";


export const AgentsSearchFilter = () => {
    const [filters , setFilters]=useAgentsFilters()
    return (
        <div className="relative">
           
            <Input 
            className="h-9 bg-white w-[200px] pl-7"
            placeholder="Filter by Name..." value={filters.search} 
            onChange={(e)=>setFilters({search:e.target.value})}/>
           <SearchIcon className="absolute size-4 left-2 top-1/2 -translate-y-1/2
           text-muted-foreground" />
            
        </div>
       
    )
}
