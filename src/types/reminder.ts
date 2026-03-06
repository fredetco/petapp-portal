export type ReminderType =
  | 'vaccination_due'
  | 'checkup_due'
  | 'followup'
  | 'appointment_reminder'
  | 'grooming_due'
  | 'training_session'
  | 'prescription_refill'
  | 'general';

export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled' | 'failed';

export interface BusinessReminder {
  id: string;
  business_id: string;
  pet_id: string;
  service_link_id: string | null;

  // Content
  title: string;
  message: string;
  type: ReminderType;

  // Scheduling
  scheduled_for: string;
  sent_at: string | null;
  status: ReminderStatus;

  // Tracking
  opened_at: string | null;
  clicked_at: string | null;

  created_at: string;
}

/** Reminder type display metadata */
export const REMINDER_TYPE_META: Record<ReminderType, { label: string; icon: string }> = {
  vaccination_due:      { label: 'Vaccination Due',      icon: 'Syringe' },
  checkup_due:          { label: 'Checkup Due',          icon: 'Stethoscope' },
  followup:             { label: 'Follow-up',            icon: 'CalendarCheck' },
  appointment_reminder: { label: 'Appointment Reminder', icon: 'Clock' },
  grooming_due:         { label: 'Grooming Due',         icon: 'Sparkles' },
  training_session:     { label: 'Training Session',     icon: 'GraduationCap' },
  prescription_refill:  { label: 'Prescription Refill',  icon: 'Pill' },
  general:              { label: 'General',              icon: 'Bell' },
};
