import { Manager } from '@twilio/flex-ui';
import ScheduleManagerService from '../../utils/serverless/ScheduleManager/ScheduleManagerService';
import { Rule, Schedule, ScheduleManagerConfig } from '../../types/schedule-manager';

let config = {
  rules: [],
  schedules: [],
  version: ''
} as ScheduleManagerConfig;

const delay = async (ms: number): Promise<void> => {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export const canShowScheduleManager = (manager: Manager) => {
  const { roles } = manager.user;
  return roles.indexOf("admin") >= 0;
}

export const loadScheduleData = async (): Promise<ScheduleManagerConfig | null> => {
  const listSchedulesResponse = await ScheduleManagerService.listSchedules();
  
  if (listSchedulesResponse) {
    config = listSchedulesResponse;
  }
  
  return listSchedulesResponse;
}

export const updateScheduleData = (newSchedule: Schedule | null, existingSchedule: Schedule | null): Schedule[] => {
  if (existingSchedule === null && newSchedule !== null) {
    // adding schedule
    config.schedules = [...config.schedules, newSchedule];
  } else if (existingSchedule !== null && newSchedule === null) {
    // removing existing schedule
    const existingIndex = config.schedules.indexOf(existingSchedule);
    
    if (existingIndex >= 0) {
      config.schedules.splice(existingIndex, 1);
    }
  } else if (existingSchedule !== null && newSchedule !== null) {
    // updating existing schedule
    const existingIndex = config.schedules.indexOf(existingSchedule);
    
    if (existingIndex >= 0) {
      config.schedules.splice(existingIndex, 1, newSchedule);
    }
  }
  
  return config.schedules;
}

export const updateRuleData = (newRule: Rule | null, existingRule: Rule | null): Rule[] => {
  if (existingRule === null && newRule !== null) {
    // adding rule
    config.rules = [...config.rules, newRule];
  } else if (existingRule !== null && newRule === null) {
    // removing existing rule
    const existingIndex = config.rules.indexOf(existingRule);
    
    if (existingIndex >= 0) {
      config.rules.splice(existingIndex, 1);
    }
  } else if (existingRule !== null && newRule !== null) {
    // updating existing rule
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

export const publishSchedules = async (): Promise<number> => {
  // return values: 0=success, 2=version error, 3=failure
  const updateResponse = await ScheduleManagerService.updateSchedules(config);
  
  if (!updateResponse.success) {
    console.log('Schedule update failed', updateResponse);
    
    if (updateResponse.buildSid == 'versionError') {
      return 2;
    }
    
    return 3;
  }
  
  // the build will take several seconds. use delay and check in a loop.
  await delay(2000);
  let updateStatus = await ScheduleManagerService.updateSchedulesStatus(updateResponse.buildSid);
  
  while (updateStatus.buildStatus !== 'completed') {
    if (updateStatus.buildStatus === 'failed' || updateStatus.buildStatus === 'error') {
      // oh no
      console.log('Schedule update build failed', updateStatus);
      return 3;
    }
    
    await delay(2000);
    updateStatus = await ScheduleManagerService.updateSchedulesStatus(updateResponse.buildSid);
  }
  
  let publishResponse = await ScheduleManagerService.publishSchedules(updateResponse.buildSid);
  
  if (!publishResponse.success) {
    console.log('Schedule publish failed', publishResponse);
    return 3;
  }
  
  return 0;
}