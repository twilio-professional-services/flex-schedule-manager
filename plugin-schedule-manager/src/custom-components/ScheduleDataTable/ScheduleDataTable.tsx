import React, { useEffect, useState } from 'react';
import { ColumnDefinition, DataTable } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";

import ScheduleEditor from '../ScheduleEditor/ScheduleEditor';
import { Rule, Schedule } from '../../types/schedule-manager';

interface OwnProps {
  isLoading: boolean;
  rules: Rule[];
  schedules: Schedule[];
  updateSchedules: (schedules: Schedule[]) => void;
  updated: Date;
}

const ScheduleDataTable = (props: OwnProps) => {
  const [ showPanel, setShowPanel ] = useState(false);
  const [ selectedSchedule, setSelectedSchedule ] = useState(null as Schedule | null);
  const [ statusTimestamp, setStatusTimestamp ] = useState('');
  const [ openIndexNext, setOpenIndexNext ] = useState(null as number | null);
  
  useEffect(() => {
    setStatusTimestamp(`${props.updated.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`);
  }, [props.updated]);
  
  useEffect(() => {
    if (openIndexNext) {
      setSelectedSchedule(props.schedules[openIndexNext]);
      setOpenIndexNext(null);
    }
  }, [props.schedules]);
  
  useEffect(() => {
    if (selectedSchedule !== null) {
      setShowPanel(true);
    }
  }, [selectedSchedule]);
  
  const createScheduleClick = () => {
    setSelectedSchedule(null);
    setShowPanel(true);
  }
  
  const onPanelClosed = () => {
    setShowPanel(false);
    setSelectedSchedule(null);
  }
  
  const onRowClick = (item: Schedule) => {
    setSelectedSchedule(item);
  }
  
  const onUpdateSchedule = (newSchedules: Schedule[], openIndex: number | null) => {
    if (openIndex) {
      setOpenIndexNext(openIndex);
    }
    
    props.updateSchedules(newSchedules);
    document.querySelector('#schedule-data-table-root')?.scrollIntoView({ behavior: 'smooth' });
    
    if (!openIndex) {
      setShowPanel(false);
      setSelectedSchedule(null);
    }
  }
  
  const getScheduleStatus = (schedule: Schedule): string => {
    if (!schedule.status) {
      return 'Pending Publish';
    }
    
    const { isOpen, closedReason } = schedule.status;
    
    if (isOpen) {
      return 'Open';
    }
    
    if (closedReason.toLowerCase() === 'closed') {
      return 'Closed';
    } else {
      return `Closed (${closedReason})`;
    }
  }
  
  const getScheduleRules = (schedule: Schedule): string => {
    let ruleNames = [] as string[];
    
    schedule.rules.forEach(ruleGuid => {
      const matchingRule = props.rules.find(rule => rule.id == ruleGuid);
      
      if (matchingRule) {
        ruleNames.push(matchingRule.name)
      }
    });
    
    return ruleNames.join(', ');
  }
  
  return (
    <>
      <div id="schedule-data-table-root">
        <Box padding='space60'>
          <Button
            variant="primary"
            disabled={props.isLoading}
            onClick={createScheduleClick}>
            <PlusIcon decorative />
            Create Schedule
          </Button>
        </Box>
        <DataTable
          items={props.schedules}
          isLoading={props.isLoading}
          onRowClick={onRowClick}
          defaultSortColumn="name-column">
          <ColumnDefinition
            key="name-column"
            header="Name"
            sortDirection='asc'
            sortingFn={(a: Schedule, b: Schedule) => (a.name > b.name) ? 1 : -1}
            content={(item: Schedule) => (<span>{item.name}</span>)} />
          <ColumnDefinition
            key="status-column"
            header="Status"
            subHeader={props.isLoading ? '' : `as of ${statusTimestamp}`}
            sortingFn={(a: Schedule, b: Schedule) => (getScheduleStatus(a) > getScheduleStatus(b)) ? 1 : -1}
            content={(item: Schedule) => (<span>{getScheduleStatus(item)}</span>)} />
          <ColumnDefinition
            key="rules-column"
            header="Rules"
            sortingFn={(a: Schedule, b: Schedule) => (getScheduleRules(a) > getScheduleRules(b)) ? 1 : -1}
            content={(item: Schedule) => (<span>{getScheduleRules(item)}</span>)} />
          <ColumnDefinition
            key="timezone-column"
            header="Time zone"
            sortingFn={(a: Schedule, b: Schedule) => (a.timeZone > b.timeZone) ? 1 : -1}
            content={(item: Schedule) => (<span>{item.timeZone}</span>)} />
          <ColumnDefinition
            key="manually-closed-column"
            header="Manually closed"
            sortingFn={(a: Schedule, b: Schedule) => a.manualClose ? 1 : -1}
            content={(item: Schedule) => (<span>{item.manualClose === true ? 'Yes' : 'No'}</span>)} />
        </DataTable>
      </div>
      <ScheduleEditor
        onPanelClosed={onPanelClosed}
        rules={props.rules}
        showPanel={showPanel}
        selectedSchedule={selectedSchedule}
        onUpdateSchedule={onUpdateSchedule} />
    </>
  );
}

export default ScheduleDataTable;