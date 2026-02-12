


import Image from "next/image";
interface Props {
    title: string;
    description: string;
};

export const EmptyState = ({ title, description }: Props) => {
    return (
        <div className=" flex flex-col  items-center justify-center">
          <Image src="/empty.svg" alt="Empty" width={240} height={240}/>
     
                <div className="flex flex-col gap-y-6 max-w-md mx-auto text-center">
                    <h6 className="text-lg font-medium text-gray-900">
                        {title}
                    </h6>
                    <p className="text-sm text-gray-600">{description}</p>
                
            </div>

        </div>
    )
}
