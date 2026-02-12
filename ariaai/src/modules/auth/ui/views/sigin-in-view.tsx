"use client";

import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { FaGoogle, FaGithub } from "react-icons/fa";

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

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "password is required" }),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign in. Please check your credentials.");
        setPending(false);
      } else {
        setPending(false);
        // Use window.location for reliable navigation
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(
        err?.message || 
        "Failed to connect to server. Please make sure the server is running and try again."
      );
      setPending(false);
    }
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          // Social login redirects to OAuth provider
          // Navigation will happen automatically
        },
        onError: ({ error }) => {
          setError(error.message || `An error occurred during ${provider} sign in`);
          setPending(false);
        },
      }
    );
  };
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0 border-0 shadow-xl bg-white/10 backdrop-blur-md">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-8 md:p-10 bg-white/95 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                  <p className="text-gray-600 mt-2">Login to your account</p>
                </div>
                {/* Email Field*/}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="a@example.com"
                            className="border-gray-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Field */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            className="border-gray-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button 
                  disabled={pending} 
                  type="submit" 
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-2.5"
                >
                  Sign in
                </Button>
                <div
                  className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-200"
                >
                  <span className="bg-white text-gray-500 relative z-10 px-3">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    onClick={() => onSocial("google")}
                    variant="outline"
                    type="button"
                    className="w-full flex items-center gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <FaGoogle className="h-4 w-4" />
                    Google
                  </Button>

                  <Button
                    disabled={pending}
                    onClick={() => onSocial("github")}
                    variant="outline"
                    type="button"
                    className="w-full flex items-center gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <FaGithub className="h-4 w-4" />
                    Github
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-[#7c3aed] hover:text-[#6d28d9] font-medium underline underline-offset-2"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div
            className="bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] relative hidden md:flex flex-col gap-y-4 items-center justify-center p-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <img src="/logo.svg" alt="Logo" className="h-[92px] w-[92px] mx-auto" />
            </div>
            <p className="text-3xl font-bold text-white">Aria.AI</p>
            <p className="text-white/80 text-center max-w-xs">Your AI meeting assistant powered by intelligent agents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
