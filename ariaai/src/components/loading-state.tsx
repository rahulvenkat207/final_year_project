import { Title } from "@radix-ui/react-dialog";
import { Loader2Icon } from "lucide-react";

interface Props {
    title: string;
    description: string;
};

export const LoadingState = ({ title, description }: Props) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
            <div className=" flex flex-col items-center justify-center gap-y-6 bg-white/95 backdrop-blur-sm p-10 rounded-lg shadow-sm">
                <Loader2Icon className="size-6 text-purple-600 animate-spin" />
                <div className="flex flex-col gap-y-2 text-center">
                    <h6 className="text-lg font-medium text-gray-900">
                        {title}
                    </h6>
                    <p className="text-gray-600">{description}</p>
                </div>
            </div>

        </div>
    )
}
