"use client";

import { useState, useTransition, type FormEvent } from "react";

import { updateDisplayName } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AccountDisplayNameFormProps {
  initialDisplayName: string;
}

export function AccountDisplayNameForm({
  initialDisplayName,
}: AccountDisplayNameFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateDisplayName(displayName);
      if (result.ok) {
        setIsError(false);
        setMessage("Display name updated.");
        return;
      }

      setIsError(true);
      setMessage(result.error ?? "Could not update display name.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-foreground">Display name</span>
        <Input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={40}
          required
          autoComplete="nickname"
        />
      </label>
      <Button type="submit" variant="outline" disabled={isPending} size="sm">
        {isPending ? "Saving…" : "Save name"}
      </Button>
      {message ? (
        <p
          className={
            isError ? "text-sm text-red-400" : "text-sm text-muted-foreground"
          }
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
