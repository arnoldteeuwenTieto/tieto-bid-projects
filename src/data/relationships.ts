export interface RelatedProject { id: string; customerId: string; name: string; status: 'Planning' | 'In progress' | 'Completed' }
// Explicit fictional relationships to the preserved application IDs, not source-system IDs.
export const mockProjects: readonly RelatedProject[] = [
  { id: 'PRJ-DEMO-001', customerId: '1', name: 'Customer portal discovery', status: 'In progress' },
  { id: 'PRJ-DEMO-002', customerId: '2', name: 'Factory data foundation', status: 'Planning' },
]

