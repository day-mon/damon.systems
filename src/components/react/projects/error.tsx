interface ProjectsErrorProps {
  message: string;
}

export default function ProjectsError({ message }: ProjectsErrorProps) {
  return <p className="text-destructive">error loading projects: {message}</p>;
}
