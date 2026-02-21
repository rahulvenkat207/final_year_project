"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Send, 
    Wand2, 
    Bot, 
    Headphones, 
    Globe, 
    MessageSquare, 
    Lightbulb,
    Loader2
} from "lucide-react";

const USE_CASES = [
    "Customer Support",
    "Sales & Lead Generation",
    "HR & Onboarding",
    "Medical & Healthcare",
    "Legal & Compliance",
    "Education & Training",
    "E-commerce & Retail",
    "Banking & Finance",
    "Real Estate",
    "Other",
];

const VOICE_STYLES = [
    "Professional & Formal",
    "Friendly & Casual",
    "Empathetic & Warm",
    "Technical & Analytical",
    "Energetic & Motivational",
    "Calm & Reassuring",
    "Authoritative & Commanding",
];

const LANGUAGES = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Mandarin",
    "Arabic",
    "Portuguese",
    "Japanese",
    "Tamil",
    "Telugu",
    "Other",
];

const formSchema = z.object({
    agentName: z.string().min(2, "Agent name must be at least 2 characters"),
    useCase: z.string().min(1, "Please select a use case"),
    behaviorDescription: z
        .string()
        .min(20, "Please describe the behavior in at least 20 characters")
        .max(2000, "Max 2000 characters"),
    voiceStyle: z.string().min(1, "Please select a voice style"),
    language: z.string().min(1, "Please select a language"),
    contactEmail: z.string().email("Please enter a valid email"),
    additionalNotes: z.string().max(500, "Max 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RFPFormProps {
    onSuccess: () => void;
}

export const RFPForm = ({ onSuccess }: RFPFormProps) => {
    const trpc = useTRPC();

    const { mutate: submitProposal, isPending } = useMutation(
        trpc.customization.submitProposal.mutationOptions({
            onSuccess: () => {
                toast.success("Proposal submitted!", {
                    description: "We've sent your request to the Aria team. You'll see updates in My Requests.",
                });
                onSuccess();
            },
            onError: (error) => {
                toast.error("Submission failed", {
                    description: error.message || "Something went wrong. Please try again.",
                });
            },
        })
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            agentName: "",
            useCase: "",
            behaviorDescription: "",
            voiceStyle: "",
            language: "English",
            contactEmail: "",
            additionalNotes: "",
        },
    });

    const onSubmit = (values: FormValues) => {
        submitProposal(values);
    };

    const behaviorLength = form.watch("behaviorDescription")?.length ?? 0;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-8" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                        <Wand2 className="w-4 h-4" />
                        Request Custom Agent
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">
                        Design Your AI Agent
                    </h2>
                    <p className="text-white/75 text-sm leading-relaxed max-w-lg">
                        Tell us exactly what you need. Our engineering team will build a fully custom voice AI agent tailored to your business requirements.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-5">
                        {[
                            { icon: Bot,          label: "Custom Voice Agent" },
                            { icon: Headphones,   label: "Voice Optimized"   },
                            { icon: MessageSquare, label: "Your Instructions" },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1.5 text-xs font-bold text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
                                <Icon className="w-3 h-3" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Row 1: Agent Name + Use Case */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                            control={form.control}
                            name="agentName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Agent Name *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Zara, Max, Aria Pro..."
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="useCase"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Use Case *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium">
                                                <SelectValue placeholder="Select a use case" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {USE_CASES.map((uc) => (
                                                <SelectItem key={uc} value={uc} className="font-medium">
                                                    {uc}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Row 2: Voice Style + Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                            control={form.control}
                            name="voiceStyle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Voice Style *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium">
                                                <SelectValue placeholder="Select voice style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {VOICE_STYLES.map((vs) => (
                                                <SelectItem key={vs} value={vs} className="font-medium">
                                                    {vs}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Primary Language *
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {LANGUAGES.map((lang) => (
                                                <SelectItem key={lang} value={lang} className="font-medium">
                                                    {lang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Behavior Description */}
                    <FormField
                        control={form.control}
                        name="behaviorDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Behavior Description *
                                </FormLabel>
                                <FormDescription className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                                    Describe how the agent should behave, what it should say, how it should handle edge cases, its personality, and anything else important.
                                </FormDescription>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g. When a customer calls, the agent should greet them warmly, ask for their order number, then look up their details. If the customer is frustrated, the agent should empathize first before offering solutions. It should never mention competitors..."
                                        className="min-h-[160px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <div className="flex justify-between items-center">
                                    <FormMessage />
                                    <span className={`text-[11px] ml-auto font-medium ${
                                        behaviorLength > 1800 ? "text-red-500" : 
                                        behaviorLength > 1500 ? "text-amber-500" : 
                                        "text-muted-foreground"
                                    }`}>
                                        {behaviorLength}/2000
                                    </span>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Contact Email */}
                    <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Contact Email *
                                </FormLabel>
                                <FormDescription className="text-xs text-muted-foreground">
                                    We'll send proposal updates to this email.
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Additional Notes */}
                    <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    Additional Notes
                                    <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60">
                                        (optional)
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Any integrations, deadlines, budget range, or special requirements..."
                                        className="min-h-[100px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Disclaimer + Submit */}
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Your proposal will be reviewed by the Aria.AI team within{" "}
                                <strong className="text-zinc-700 dark:text-zinc-300">1–2 business days</strong>. You'll receive email updates at each stage and can track progress in the{" "}
                                <strong className="text-zinc-700 dark:text-zinc-300">My Requests</strong> tab.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-13 premium-gradient border-none rounded-2xl font-black text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting Proposal...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Submit Proposal
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
