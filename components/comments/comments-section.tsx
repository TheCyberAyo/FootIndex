import { CommentsPanel } from "@/components/comments/comments-panel";
import { Section } from "@/components/shared/section";
import { listPublicComments } from "@/services/comments/comments.service";
import type { CommentEntityType } from "@/types/database";

interface CommentsSectionProps {
  entityType: CommentEntityType;
  entityId: string;
  nextPath: string;
  title?: string;
  description?: string;
}

export async function CommentsSection({
  entityType,
  entityId,
  nextPath,
  title = "Comments",
  description = "Signed-in fans can comment and like. Keep it football.",
}: CommentsSectionProps) {
  const initialComments = await listPublicComments(entityType, entityId);

  return (
    <Section id="comments" eyebrow="Community" title={title} description={description}>
      <CommentsPanel
        entityType={entityType}
        entityId={entityId}
        initialComments={initialComments}
        nextPath={nextPath}
      />
    </Section>
  );
}
