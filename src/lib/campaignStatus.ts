import type { CampaignStatus } from './api';

/**
 * What an admin may do to a campaign in each state.
 *
 * Kept here rather than inline in the components for two reasons: the rules
 * are shared between the list and the composer, and predicates are testable
 * without a DOM — which matters because this project has no React testing
 * library installed.
 *
 * The states are Mailchimp's, not ours. `save` is what it calls a draft.
 */

export const isEditable = (status: CampaignStatus) => status === 'save';

export const canSend = (status: CampaignStatus) => status === 'save';

export const canSchedule = (status: CampaignStatus) => status === 'save';

export const canUnschedule = (status: CampaignStatus) => status === 'schedule';

/** Sending is in flight or finished: nothing about it can be changed. */
export const isLocked = (status: CampaignStatus) =>
  status === 'sending' || status === 'sent' || status === 'canceling';

export const canCancel = (status: CampaignStatus) => status === 'sending';

export const hasReport = (status: CampaignStatus) => status === 'sent';

/** Only a draft or a finished campaign is safe to delete. */
export const canDelete = (status: CampaignStatus) =>
  status === 'save' || status === 'sent' || status === 'canceled';

/** True while the status is expected to change on its own, so it is polled. */
export const isSettling = (status: CampaignStatus) =>
  status === 'sending' || status === 'canceling';

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  save: 'Draft',
  paused: 'Paused',
  schedule: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  canceled: 'Cancelled',
  canceling: 'Cancelling',
};

export const statusLabel = (status: CampaignStatus) => STATUS_LABELS[status] ?? status;
