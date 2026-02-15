import { SignInView } from "@/modules/auth/ui/views/sigin-in-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SignIn = async () => {
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
    // If session check fails, still show sign in page
    console.error("Session check error:", error);
  }
  
  return <SignInView />;
};
export default SignIn;
