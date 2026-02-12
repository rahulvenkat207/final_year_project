"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";  
import { DataTable } from "../components/data-table";
import { EmptyState } from "@/components/empty-sate";
import { columns } from "../components/columns";
import { AgentGetOne } from "../../types";
import { useAgentsFilters } from "../../hooks/use-agent-filters";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/error-state";


   export const AgentsView = () => {
    
    const router = useRouter();
    const trpc = useTRPC();
    const [filters ,setFilters]=useAgentsFilters()
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters,
    }));

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            
              <DataTable  
              data={data.items} 
              columns={columns}
              onRowClick={(row)=>router.push(`/agents/${row.id}`)}
              />
              <DataPagination 
              page ={filters.page}
              totalPages={data.totalPages}
              onPageChange={ (page) => setFilters({page})}
              />
              {data.items.length===0 &&(
                <EmptyState title="create your first agent" description="Create an agent to join your meeting. Each agent will follow your instructions and can interact with participants during the meeting the call."/>
              )}
            
        </div>
    )

};  

export const AgentsViewLoading = () => {
    return (
       <LoadingState title="Loading Agents" description="This may take few seconds" />
    )
}

export const AgentsViewError = () => {
    return (
       <ErrorState title="Error Loading Agents" description="Something went wrong" />
    )
}