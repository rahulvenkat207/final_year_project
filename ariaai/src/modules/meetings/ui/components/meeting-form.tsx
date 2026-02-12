import { useMutation, useQuery } from "@tanstack/react-query";
import { MeetingGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingsInsertSchema } from "../../schemas";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface MeetingFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues
}: MeetingFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch agents for the dropdown
    const { data: agentsData } = useQuery(
        trpc.agents.getMany.queryOptions({
            page: 1,
            pageSize: 100, // Get all agents
        })
    );

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: (data) => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                //todo: Invalidate free tier usage
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
                //todo: check if error code is "Forbidden", redirect to "/upgrade"
            }
        })
    );

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
        },
        resolver: zodResolver(meetingsInsertSchema)
    });

    const isPending = createMeeting.isPending;
    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        createMeeting.mutate(values);
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meeting Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g Team Standup" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="agentId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Agent</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an agent" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {agentsData?.items.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isPending || !agentsData?.items.length}
                    >
                        {isPending ? "Creating..." : "Create Meeting"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

