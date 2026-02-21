import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

export default async function CustomizationPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    return <CustomizationView />;
}
