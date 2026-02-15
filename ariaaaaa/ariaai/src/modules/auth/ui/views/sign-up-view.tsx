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

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.email(),
    password: z.string().min(1, { message: "password is required" }),
    confirmPassword: z.string().min(1, { message: "Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords don't match",
    path: ["confirmPassword"],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm({
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
      console.log("Attempting signup with:", { email: data.email, name: data.name });
      
      // Use Better Auth client directly - it handles routing correctly
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });

      console.log("Better-auth result:", JSON.stringify(result, null, 2));
      console.log("Result keys:", Object.keys(result || {}));
      console.log("Result error:", result?.error);
      console.log("Result error type:", typeof result?.error);
      console.log("Result error keys:", result?.error ? Object.keys(result.error) : []);

      // Check for error in various formats
      if (result?.error) {
        const errorObj = result.error;
        console.error("Better-auth error object:", errorObj);
        console.error("Error object stringified:", JSON.stringify(errorObj));
        
        // Try to extract error message from various possible structures
        const errorMsg = 
          errorObj?.message || 
          errorObj?.code || 
          (typeof errorObj === 'string' ? errorObj : null) ||
          (errorObj && Object.keys(errorObj).length === 0 ? "Sign up failed. Please check server logs for details." : null) ||
          JSON.stringify(errorObj) ||
          "Sign up failed. Please check your information.";
        
        setError(errorMsg);
        setPending(false);
        return;
      }

      // Check if there's an error status or other error indicators
      if (result?.status === 'error' || result?.success === false) {
        const errorMsg = result?.message || "Sign up failed. Please try again.";
        setError(errorMsg);
        setPending(false);
        return;
      }

      if (result?.data || result?.user) {
        console.log("Sign up successful, redirecting...");
        setPending(false);
        window.location.href = "/";
        return;
      }

      // If we have a result but no data and no error, log it
      console.warn("Unexpected response structure:", result);
      console.warn("Full result object:", JSON.stringify(result, null, 2));
      setError("Sign up completed but received unexpected response. Please check server logs or try signing in.");
      setPending(false);
    } catch (err: any) {
      console.error("Sign up exception:", err);
      
      // Extract error message safely
      let errorMessage = "Failed to sign up. Please try again.";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      }

      setError(errorMessage);
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
          setPending(false);
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error?.message || `An error occurred during ${provider} sign in`);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:pd-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Let&apos;s get started</h1>
                  <p className="text-muted-foreground">Create your account</p>
                </div>
                {/* Name Field */}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="rahul" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* confirm password field*/}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
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

                <Button disabled={pending} type="submit" className="w-full">
                  {pending ? "Signing up..." : "Sign up"}
                </Button>
                <div
                  className="after:border-border relative text-center text-sm after:absolute
                after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
                >
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    onClick={() => onSocial("google")}
                    variant="outline"
                    type="button"
                    className="w-full flex items-center gap-2"
                  >
                    <FaGoogle className="h-4 w-4" />
                    Google
                  </Button>

                  <Button
                    disabled={pending}
                    onClick={() => onSocial("github")}
                    variant="outline"
                    type="button"
                    className="w-full flex items-center gap-2"
                  >
                    <FaGithub className="h-4 w-4" />
                    Github
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-2"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div
            className="bg-radial from-sidebar-accent to-sidebar relative hidden  md:flex flex-col
          gap-y-4 items-center justify-center"
          >
            <img src="/logo.svg" alt="Logo" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">Aria.AI</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
