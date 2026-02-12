"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardUserButton = () => {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  if (isPending || !data?.user) return null;

  const userAvatar = data.user.image ? (
    <Avatar>
      <AvatarImage src={data.user.image} />
    </Avatar>
  ) : (
    <GeneratedAvatar
      seed={data.user.name}
      variant="initials"
      className="size-9 mr-3"
    />
  );

  const userInfo = (
    <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
      <p className="text-sm truncate w-full font-medium">{data.user.name}</p>
      <p className="text-xs truncate w-full text-muted-foreground">
        {data.user.email}
      </p>
    </div>
  );

  // 🟦 Drawer for Mobile
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-white/10"
          >
            {userAvatar}
            {userInfo}
            <ChevronDownIcon className="size-4 shrink-0" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader>
            <DrawerTitle>{data.user.name}</DrawerTitle>
            <DrawerDescription>{data.user.email}</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-2 px-4">
            <Button variant="outline" className="justify-between">
              Billing
              <CreditCardIcon className="size-4" />
            </Button>

            <Button
              variant="destructive"
              className="justify-between"
              onClick={onLogout}
            >
              Logout
              <LogOutIcon className="size-4" />
            </Button>
          </div>

          <DrawerFooter>
            <p className="text-xs text-muted-foreground text-center">
              Manage account settings
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // 🟩 Dropdown Menu for Desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-lg border border-border/10 p-3 w-full flex
        items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2"
      >
        {userAvatar}
        {userInfo}
        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{data.user.name}</span>
            <span className="text-sm font-normal text-muted-foreground truncate">
              {data.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
          Billing
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer flex items-center justify-between"
        >
          Logout
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
