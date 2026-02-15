import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SignUp = async () => {
  // Optimize: Use Promise.race to timeout session check after 3 seconds
  try {
    const sessionPromise = auth.api.getSession({
      headers: await headers(),
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Session check timeout")), 3000)
    );

    const session = await Promise.race([sessionPromise, timeoutPromise]).catch(() => null);

    if (session) {
      redirect("/");
    }
  } catch (error) {
    // If session check fails, still show sign up page
    console.error("Session check error:", error);
  }
  
  return <SignUpView />;
};
export default SignUp;
