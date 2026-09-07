import AcceptInviteClient from "./AcceptInviteClient";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  return <AcceptInviteClient token={token} />;
}