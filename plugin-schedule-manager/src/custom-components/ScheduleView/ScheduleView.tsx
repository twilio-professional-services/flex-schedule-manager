import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Flex } from '@twilio-paste/core/flex';
import { Grid, Column } from '@twilio-paste/core/grid';
import { Stack } from '@twilio-paste/core/stack';

import RuleDataTable from '../RuleDataTable/RuleDataTable';
import ScheduleDataTable from '../ScheduleDataTable/ScheduleDataTable';
import { Rule, Schedule } from '../../types/schedule-manager';
import { loadScheduleData } from '../../utils/schedule-manager';

const ScheduleView = ({}) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ rules, setRules ] = useState([] as Rule[]);
  const [ schedules, setSchedules ] = useState([] as Schedule[]);
  
  useEffect(() => {
    listSchedules();
  }, []);
  
  const listSchedules = async () => {
    setIsLoading(true);
    
    const scheduleData = await loadScheduleData();
    
    if (scheduleData === null) {
      // TODO: Error, handle it!
    } else {
      setRules(scheduleData.rules);
      setSchedules(scheduleData.schedules);
    }
    
    setIsLoading(false);
  }
  
  const updateSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
  }
  
  const updateRules = (newRules: Rule[]) => {
    setRules(newRules);
  }
  
  // TODO: add heading with publish button. need to bring in emotion for css stuff
  return (
    <Tabs>
      <Tab label="Schedules">
        <ScheduleDataTable isLoading={isLoading} rules={rules} schedules={schedules} updateSchedules={updateSchedules} />
      </Tab>
      <Tab label="Rules">
        <RuleDataTable isLoading={isLoading} rules={rules} updateRules={updateRules} />
      </Tab>
    </Tabs>
  );
}

export default ScheduleView;