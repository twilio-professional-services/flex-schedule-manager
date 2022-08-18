import ScheduleManagerService from '../../utils/serverless/ScheduleManager/ScheduleManagerService';
import { Rule, Schedule, ScheduleManagerConfig } from '../../types/schedule-manager';

let config = {
  rules: [],
  schedules: [],
  version: ''
} as ScheduleManagerConfig;

export const loadScheduleData = async (): Promise<ScheduleManagerConfig | null> => {
  const listSchedulesResponse = await ScheduleManagerService.listSchedules();
  
  if (listSchedulesResponse) {
    config = listSchedulesResponse;
  }
  
  return listSchedulesResponse;
}

export const updateScheduleData = (newSchedule: Schedule, existingSchedule: Schedule | null): Schedule[] => {
  if (existingSchedule === null) {
    config.schedules = [...config.schedules, newSchedule];
  } else {
    const existingIndex = config.schedules.indexOf(existingSchedule);
    
    if (existingIndex >= 0) {
      config.schedules.splice(existingIndex, 1, newSchedule);
    }
  }
  
  return config.schedules;
}

export const updateRuleData = (newRule: Rule, existingRule: Rule | null): Rule[] => {
  if (existingRule === null) {
    config.rules = [...config.rules, newRule];
  } else {
    const existingIndex = config.rules.indexOf(existingRule);
    
    if (existingIndex >= 0) {
      config.rules.splice(existingIndex, 1, newRule);
    }
  }
  
  return config.rules;
}

export const isScheduleUnique = (newSchedule: Schedule, existingSchedule: Schedule | null): boolean => {
  if (existingSchedule !== null) {
    const otherSchedules = config.schedules.filter(item => existingSchedule.name !== item.name);
    const matchingSchedules = otherSchedules.filter(item => newSchedule.name === item.name);
    return matchingSchedules.length == 0;
  } else {
    const matchingSchedules = config.schedules.filter(item => newSchedule.name === item.name);
    return matchingSchedules.length == 0;
  }
}

export const isRuleUnique = (newRule: Rule, existingRule: Rule | null): boolean => {
  if (existingRule !== null) {
    const otherRules = config.rules.filter(item => existingRule.id !== item.id);
    const matchingRules = otherRules.filter(item => newRule.name === item.name);
    return matchingRules.length == 0;
  } else {
    const matchingRules = config.rules.filter(item => newRule.name === item.name);
    return matchingRules.length == 0;
  }
}