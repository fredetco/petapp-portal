export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

/** Common notification types used across portal + main app */
export type NotificationType =
  | 'link_request'           // Business requests to link with pet
  | 'link_approved'          // Owner approved the link
  | 'link_revoked'           // Link was revoked
  | 'new_record'             // Business added a record visible to owner
  | 'reminder'               // Business sent a care reminder
  | 'team_invite'            // Invited to join a business team
  | 'campaign_status_change' // Campaign status changed
  | 'system';                // System notification
