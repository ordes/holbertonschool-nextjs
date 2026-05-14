"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { User } from "lucide-react";

export default function LoggedInUser() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const { name, image } = session.user;

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      {image ? (
        <Image
          src={image}
          alt={name ?? "User avatar"}
          width={28}
          height={28}
          className="rounded-full object-cover ring-1 ring-gray-200"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-gray-200">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
      <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">
        {name ?? "User"}
      </span>
    </div>
  );
}
