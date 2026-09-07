import InviteModal from '@/components/InviteModal';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <InviteModal isOpen onClose={() => {}} projectId={projectId} />
    </div>
  );
}