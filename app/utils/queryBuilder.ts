import { SortState } from "./towers";
import { API_BASE_URL } from "@/next.config";

export const sortToOrdering = (sortMode: SortState): string => {
  const mapping: Record<SortState, string> = {
    'scoreUp': 'score',
    'scoreDown': '-score',
    'difficultyUp': 'difficulty',
    'difficultyDown': '-difficulty',
    'dateUp': 'date',
    'dateDown': '-date',
  };
  return mapping[sortMode];
};

export function buildQueryParams(
  selectedAreas: string[],
  areas: string[],
  difficultyRange: number[],
  completedToggle: boolean,
  towerStatuses: Map<number, string>,
  sortMode: SortState
) {
  const params = new URLSearchParams();
  if (selectedAreas.length && selectedAreas.length !== areas.length) {
    selectedAreas.forEach(area => params.append("area", area));
  }
  params.append("difficulty_min", difficultyRange[0].toString());
  params.append("difficulty_max", difficultyRange[1].toString());
  if (completedToggle && towerStatuses.size) {
    params.append("exclude_completed", "true");
    towerStatuses.forEach((status, id) => {
      if (status === 'completed') {
        params.append("completed_ids", id.toString());
      }
    });
  } 
  towerStatuses.forEach((status, id) => {
    if (status === 'ignored') {
      params.append("ignored_ids", id.toString());
    }
  });
  
  if (sortMode) {
    params.append("ordering", sortToOrdering(sortMode));
  }
  return `${API_BASE_URL}/api/towers/?${params.toString()}`;
}