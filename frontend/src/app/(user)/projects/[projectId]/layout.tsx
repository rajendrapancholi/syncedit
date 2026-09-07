import ProjectSessionProvider from './_session/ProjectSessionProvider';

export default async function ProjectLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <ProjectSessionProvider projectId={projectId}>
      {children}
      {modal}
    </ProjectSessionProvider>
  );
}
