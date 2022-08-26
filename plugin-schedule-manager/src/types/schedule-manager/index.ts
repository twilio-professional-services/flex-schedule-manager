export interface Rule {
  id: string;
  name: string;
  isOpen: boolean;
  closedReason: string;
  dateRRule: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  name: string;
  emergencyClose: boolean;
  timeZone: string;
  rules: string[];
  status?: CheckScheduleResponse; // only returned by list-schedules
}

export interface ScheduleManagerConfig {
  rules: Rule[];
  schedules: Schedule[];
  version: string;
}

export interface UpdateScheduleResponse {
  buildSid: string;
  success: boolean;
}

export interface PublishScheduleRequest {
  buildSid: string;
}

export interface PublishScheduleResponse {
  deploymentSid: string;
  success: boolean;
}

export interface CheckScheduleResponse {
  isOpen: boolean;
  closedReason: string;
  error?: string;
}