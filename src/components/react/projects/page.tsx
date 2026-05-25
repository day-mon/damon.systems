import QueryProvider from '~/providers/query';
import ProjectsList from './list';

export default function ProjectsPage() {
  return (
    <QueryProvider>
      <ProjectsList />
    </QueryProvider>
  );
}
