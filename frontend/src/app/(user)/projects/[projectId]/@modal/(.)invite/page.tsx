'use client';

import { useRouter, useParams } from 'next/navigation';
import InviteModal from '@/components/InviteModal';

export default function InterceptedInvitePage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <InviteModal isOpen onClose={() => router.back()} projectId={projectId} />
  );
}