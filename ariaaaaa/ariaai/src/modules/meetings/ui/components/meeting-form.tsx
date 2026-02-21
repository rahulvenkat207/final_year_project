"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MeetingGetOne } from "../../types";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
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
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, Users, Settings2, Sparkles, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MeetingFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialValues?: MeetingGetOne;
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

export const MeetingForm = ({
    onSuccess,
    onCancel,
    initialValues
}: MeetingFormProps) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [emailInput, setEmailInput] = useState("");
    const [activeTab, setActiveTab] = useState("details");

    // Separate Date State
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [selectedTime, setSelectedTime] = useState("12:00");

    const { data: agentsData, isLoading: isLoadingAgents, isError: isErrorAgents } = useQuery(
        trpc.agents.getMany.queryOptions({
            page: 1,
            pageSize: 100,
        })
    );

    const createMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                toast.success("Intelligence Session Scheduled");
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

    // Sync separate components back to form
    useEffect(() => {
        const date = new Date(selectedYear, selectedMonth, selectedDay);
        const [hours, minutes] = selectedTime.split(":").map(Number);
        date.setHours(hours || 0, minutes || 0);
        form.setValue("scheduledAt", date);
    }, [selectedYear, selectedMonth, selectedDay, selectedTime, form]);

    const addEmail = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Invalid binary route (email)");
            return;
        }
        if (invitees.includes(email)) {
            toast.error("Node already in stack");
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex items-center justify-start bg-transparent border-b border-zinc-100 dark:border-zinc-900 h-11 p-0 rounded-none mb-8 gap-x-8">
                        <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent flex items-center gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary transition-all pb-3 h-full px-1">
                            <Settings2 className="w-3.5 h-3.5" />
                            Session Matrix
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent flex items-center gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary transition-all pb-3 h-full px-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Temporal Slot
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid gap-6">
                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Session Designation</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="e.g. Q3 Strategic Alignment" 
                                                className="h-12 bg-white/50 dark:bg-black/20 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 font-medium px-4" 
                                            />
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
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Autonomous Intelligence</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                            disabled={isLoadingAgents || isErrorAgents}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 font-medium px-4">
                                                    <SelectValue placeholder={isLoadingAgents ? "Syncing..." : "Assign Agent"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                                {agentsData?.items?.map((agent) => (
                                                    <SelectItem key={agent.id} value={agent.id} className="rounded-xl my-1">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                                            {agent.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[24px] border border-indigo-100 dark:border-indigo-900/50">
                                 <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-indigo-500 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Aria Auto-Ingest Active</p>
                                        <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 leading-relaxed font-medium mt-1">
                                            The selected agent will automatically join and synthesize real-time transcripts once the session initializes.
                                        </p>
                                    </div>
                                 </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab("schedule")} className="h-11 rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest premium-gradient border-none">
                                Proceed to Scheduling
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Separate Selectors for Year, Month, Day, and Time */}
                        <div className="space-y-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Temporal Coordinates</p>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Year */}
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter px-1">Year</p>
                                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                        <SelectTrigger className="h-11 bg-white/50 dark:bg-black/20 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Month */}
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter px-1">Month</p>
                                    <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                        <SelectTrigger className="h-11 bg-white/50 dark:bg-black/20 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {months.map((m, i) => <SelectItem key={m} value={i.toString()}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Day */}
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter px-1">Day</p>
                                    <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                                        <SelectTrigger className="h-11 bg-white/50 dark:bg-black/20 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {generateDays(selectedYear, selectedMonth).map(d => (
                                                <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Timing */}
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter px-1">Timing</p>
                                    <Input 
                                        type="time" 
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="h-11 bg-white/50 dark:bg-black/20 rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-bold"
                                    />
                                </div>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Neural Network Ingestion (Invitees)</p>
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
                                    placeholder="Enter collaborator email"
                                    className="h-12 bg-white/50 dark:bg-black/20 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 font-medium px-4"
                                />
                                <Button type="button" variant="secondary" onClick={addEmail} className="h-12 px-6 rounded-2xl font-bold bg-zinc-100 dark:bg-zinc-800">
                                    Incorporate
                                </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-zinc-50/30 dark:bg-zinc-950/20">
                                {invitees.length === 0 && (
                                    <div className="w-full flex flex-col items-center justify-center py-2 opacity-30">
                                        <Users className="w-4 h-4 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Collaborators Added</span>
                                    </div>
                                )}
                                {invitees.map((email) => (
                                    <Badge key={email} variant="secondary" className="pl-4 pr-1.5 py-1.5 gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm group">
                                        <span className="text-[11px] font-bold">{email}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeEmail(email)}
                                            className="hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 rounded-lg p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-900">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setActiveTab("details")}
                                className="h-12 px-6 rounded-2xl font-bold text-zinc-500"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || isLoadingAgents || !agentsData?.items?.length}
                                className="h-12 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest premium-gradient border-none shadow-xl shadow-indigo-500/20"
                            >
                                {isPending ? "Initializing..." : "Register Session"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
};
