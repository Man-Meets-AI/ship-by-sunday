"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { ConvexReadyGate } from "@/components/app/convex-ready-gate";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureClientEvent } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { formatDate } from "@/lib/utils";

export function NotesWorkbench() {
  return (
    <ConvexReadyGate loadingMessage="Loading the notes workspace...">
      <NotesWorkbenchContent />
    </ConvexReadyGate>
  );
}

function NotesWorkbenchContent() {
  const notes = useQuery(api.notes.listForCurrentWorkspace) as
    | Array<{
        _id: string;
        title: string;
        body: string;
        updatedAt: number;
      }>
    | undefined;
  const createNote = useMutation(api.notes.create);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createNote({ title, body });
      captureClientEvent(analyticsEvents.noteCreated, {
        surface: "notes_page",
      });
      captureClientEvent(analyticsEvents.coreActionCompleted, {
        action: "create_note",
      });
      toast.success("Note saved");
      setTitle("");
      setBody("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't save the note",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Capture a note</CardTitle>
          <CardDescription>
            A small workflow with enough surface area to prove auth, mutations,
            analytics, and entitlement checks are all behaving the way the rest
            of your product should.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Launch week checklist"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-body">Body</Label>
              <Textarea
                id="note-body"
                placeholder="Write the next thing your team should ship, confirm, or follow up on."
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving note
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Save note
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes === undefined ? (
          <Card>
            <CardContent className="flex min-h-56 items-center justify-center text-sm text-zinc-500">
              Loading notes...
            </CardContent>
          </Card>
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes yet"
            description="Create the first note to confirm the authenticated product loop is working end to end."
          />
        ) : (
          notes.map((note) => (
            <Card key={note._id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  Updated {formatDate(note.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {note.body}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
