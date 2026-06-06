import { api } from "./client";

export interface ContentRevision {
  id: number;
  entity_type: string;
  entity_id: number;
  revision_number: number;
  snapshot: Record<string, unknown>;
  change_summary: string;
  created_by: number | null;
  created_at: string;
}

export interface RevisionListResponse {
  code: number;
  message: string;
  data: {
    items: ContentRevision[];
    meta: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
    };
  };
}

export const revisionsAPI = {
  list(entityType: string, entityId: number, page = 1, perPage = 20) {
    return api.get<RevisionListResponse>("/revisions", {
      entity_type: entityType,
      entity_id: entityId,
      page,
      per_page: perPage,
    });
  },

  get(id: number) {
    return api.get<{ code: number; data: ContentRevision }>(`/revisions/${id}`);
  },

  rollback(id: number, entityType: string) {
    return api.post(`/revisions/${id}/rollback?entity_type=${entityType}`);
  },
};
