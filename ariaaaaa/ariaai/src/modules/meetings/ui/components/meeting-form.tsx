"use client";

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

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

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
    const [emailInput, setEmailInput] = useState("");

    const { data: agentsData, isLoading: isLoadingAgents, isError: isErrorAgents } = useQuery(
        trpc.agents.getMany.queryOptions({
            page: 1,
            pageSize: 100, // Get all agents
        })
    );

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: (data) => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                toast.success("Meeting scheduled and invitations sent!");
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message);
                if (error.data?.code === "FORBIDDEN") {
                    router.push("/upgrade");
                }
            }
        })
    );

    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
            invitees: [],
            scheduledAt: null,
        },
        resolver: zodResolver(meetingsInsertSchema)
    });

    const invitees = form.watch("invitees") || [];

    const addEmail = () => {
        const email = emailInput.trim();
        if (!email) return;
        
        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Invalid email address");
            return;
        }

        if (invitees.includes(email)) {
             toast.error("Email already added");
             return;
        }

        form.setValue("invitees", [...invitees, email]);
        setEmailInput("");
    };

    const removeEmail = (email: string) => {
        form.setValue("invitees", invitees.filter((e) => e !== email));
    };

    const isPending = createMeeting.isPending;
    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        createMeeting.mutate(values);
    };

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meeting Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g Team Standup" className="bg-white/50" />
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
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={isLoadingAgents || isErrorAgents}
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white/50">
                                            <SelectValue placeholder={
                                                isLoadingAgents ? "Loading agents..." : 
                                                isErrorAgents ? "Error loading agents" :
                                                "Select an agent"
                                            } />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {agentsData?.items?.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                        {!isLoadingAgents && !isErrorAgents && (!agentsData?.items || agentsData.items.length === 0) && (
                                            <div className="p-2 text-sm text-gray-500 text-center">No agents found. Create one first.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="scheduledAt"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Schedule Time</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="datetime-local" 
                                        className="bg-white/50" 
                                        {...field}
                                        value={field.value ? new Date(new Date(field.value).getTime() - new Date(field.value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Invite Participants</FormLabel>
                        <div className="flex gap-2">
                            <Input 
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addEmail();
                                    }
                                }}
                                placeholder="Enter email address"
                                className="bg-white/50"
                            />
                            <Button type="button" variant="secondary" onClick={addEmail}>
                                Add
                            </Button>
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Invitees will receive an email with the join link.
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-3 min-h-[40px] p-3 border rounded-lg bg-gray-50/50">
                            {invitees.length === 0 && (
                                <span className="text-sm text-gray-400 italic">No invitees yet</span>
                            )}
                            {invitees.map((email) => (
                                <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1 gap-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {email}
                                    <button 
                                        type="button" 
                                        onClick={() => removeEmail(email)}
                                        className="hover:bg-indigo-200 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </FormItem>
                </div>

                <div className="flex justify-between gap-x-2 pt-2">
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
                        disabled={isPending || isLoadingAgents || !agentsData?.items?.length}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isPending ? "Scheduling..." : "Create Meeting & Invite"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

