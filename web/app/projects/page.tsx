import ProjectList from '@/app/components/projects/ProjectList'
import { listProjects } from '@/app/lib/mock/projects'

export default function ProjectsPage() {
  const projects = listProjects()
  return (
    <main className="space-y-6">
      <ProjectList projects={projects} />
    </main>
  )
}


