"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";

import { authClient } from "@/lib/auth-client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    try {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });

      if (result?.error) {
        setError(result.error.message || "Sign up failed. Please try again.");
        setPending(false);
        return;
      }

      // Successful signup
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setPending(false);
    }
  };

  const onGoogleSignUp = () => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4">
      <Card className="w-full max-w-[1000px] overflow-hidden border-indigo-100/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-indigo-500/10 dark:bg-zinc-950/80">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Side: Decorative - Switched for variety or keeping consistent with sign-in */}
          <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-indigo-600 p-12 text-white md:flex">
             {/* Background pattern */}
             <div className="absolute inset-0 z-0 opacity-20">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid-signup" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-signup)" />
              </svg>
            </div>
            
            <div className="absolute -left-16 -bottom-16 size-80 rounded-full bg-indigo-500/50 blur-3xl animate-pulse" />
            <div className="absolute -top-16 -right-16 size-64 rounded-full bg-indigo-700/50 blur-3xl" />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Join Aria AI</h2>
              <p className="text-balance text-lg text-indigo-100/90 mb-8">
                Unlock the power of AI-assisted meetings and seamless collaboration.
              </p>
              
              <div className="space-y-4 text-left inline-block">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <ArrowRight className="size-4" />
                  </div>
                  <span className="text-indigo-100">Automated Meeting Minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <ArrowRight className="size-4" />
                  </div>
                  <span className="text-indigo-100">Real-time AI Assistant</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <ArrowRight className="size-4" />
                  </div>
                  <span className="text-indigo-100">Smart Scheduling Tools</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Create an account
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Sign up and start organizing better meetings
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="h-10 border-zinc-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700 dark:text-zinc-300">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-10 border-zinc-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-700 dark:text-zinc-300">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-10 border-zinc-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-700 dark:text-zinc-300">Confirm</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-10 border-zinc-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!!error && (
                  <Alert variant="destructive" className="border-none bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-400">
                    <OctagonAlertIcon className="size-4" />
                    <AlertTitle className="text-sm font-medium">{error}</AlertTitle>
                  </Alert>
                )}

                <Button 
                  disabled={pending} 
                  type="submit" 
                  className="group h-11 w-full bg-indigo-600 font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20"
                >
                  {pending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                  Or sign up with
                </span>
              </div>
            </div>

            <Button
              disabled={pending}
              onClick={onGoogleSignUp}
              variant="outline"
              type="button"
              className="h-11 w-full border-zinc-200 bg-white font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
            >
              <FcGoogle className="mr-2 size-5" />
              Sign up with Google
            </Button>

            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
