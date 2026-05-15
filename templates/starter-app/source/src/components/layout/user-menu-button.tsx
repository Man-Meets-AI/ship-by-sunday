"use client";

import { UserButton } from "@clerk/nextjs";

export function UserMenuButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-10 w-10",
        },
      }}
    />
  );
}
