
import { AlertCircleIcon } from "lucide-react";

interface Props {
    title: string;
    description: string;
};

export const ErrorState = ({ title, description }: Props) => {
    return (
        <div className="py-4 px-8 flex flex-1 items-center justify-center">
            <div className=" flex flex-col items-center justify-center gap-y-6 bg-background p-10 rounded-lg shadow-sm">
                <AlertCircleIcon className="size-6  text-red-500  animate-pulse" />
                <div className="flex flex-col gap-y-2 text-center">
                    <h6 className="text-lg font-medium">
                        {title}
                    </h6>
                    <p>{description}</p>
                </div>
            </div>

        </div>
    )
}
