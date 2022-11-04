import React, { useEffect, useState } from 'react';
import { ColumnDefinition, DataTable } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { RRule } from 'rrule';

import RuleEditor from '../RuleEditor/RuleEditor';
import { Rule, Schedule } from '../../types/schedule-manager';

interface OwnProps {
  isLoading: boolean;
  rules: Rule[];
  schedules: Schedule[];
  updateRules: (rules: Rule[]) => void;
}

const RuleDataTable = (props: OwnProps) => {
  const [ showPanel, setShowPanel ] = useState(false);
  const [ selectedRule, setSelectedRule ] = useState(null as Rule | null);
  
  useEffect(() => {
    if (selectedRule !== null) {
      setShowPanel(true);
    }
  }, [selectedRule]);
  
  const createRuleClick = () => {
    setSelectedRule(null);
    setShowPanel(true);
  }
  
  const onPanelClosed = () => {
    setShowPanel(false);
    setSelectedRule(null);
  }
  
  const onRowClick = (item: Rule) => {
    setSelectedRule(item);
  }
  
  const onUpdateRule = (newRules: Rule[]) => {
    props.updateRules(newRules);
    
    setShowPanel(false);
    setSelectedRule(null);
  }
  
  return (
    <>
      <div>
        <Box padding='space60'>
          <Button
            variant="primary"
            disabled={props.isLoading}
            onClick={createRuleClick}>
            <PlusIcon decorative />
            Create Rule
          </Button>
        </Box>
        <DataTable
          items={props.rules}
          isLoading={props.isLoading}
          onRowClick={onRowClick}
          defaultSortColumn="name-column">
          <ColumnDefinition
            key="name-column"
            header="Name"
            sortDirection='asc'
            sortingFn={(a: Rule, b: Rule) => (a.name > b.name) ? 1 : -1}
            content={(item: Rule) => {
              return <span>{item.name}</span>
            }} />
          <ColumnDefinition
            key="type-column"
            header="Type"
            content={(item: Rule) => {
              let typeStr = 'Open';
              
              if (item.isOpen === false) {
                typeStr = 'Closed';
                
                if (item.closedReason && item.closedReason !== 'closed') {
                  typeStr += ` (${item.closedReason})`;
                }
              }
              
              return <span>{typeStr}</span>
            }} />
          <ColumnDefinition
            key="time-column"
            header="Time"
            content={(item: Rule) => {
              let timeStr = 'any time';
              
              if (item.startTime) {
                timeStr = item.startTime;
              }
              
              if (item.endTime) {
                timeStr += ` - ${item.endTime}`;
              }
              
              return <span>{timeStr}</span>
            }} />
          <ColumnDefinition
            key="date-column"
            header="Date"
            content={(item: Rule) => {
              let dateStr = 'any day';
              
              if (item.startDate && item.endDate && item.startDate == item.endDate) {
                dateStr = `${item.startDate}`;
              } else {
                dateStr = '';
                
                if (item.dateRRule) {
                  dateStr += RRule.fromString(item.dateRRule).toText();
                }
                
                if (dateStr && (item.startDate || item.endDate)) {
                  dateStr += ', ';
                }
                
                if (item.startDate) {
                  dateStr += `from ${item.startDate}`;
                }
                
                if (item.endDate) {
                  if (dateStr) {
                    dateStr += ' ';
                  }
                  dateStr += `until ${item.endDate}`;
                }
              }
              
              return <span>{dateStr}</span>
            }} />
        </DataTable>
      </div>
      <RuleEditor
        onPanelClosed={onPanelClosed}
        showPanel={showPanel}
        schedules={props.schedules}
        selectedRule={selectedRule}
        onUpdateRule={onUpdateRule} />
    </>
  );
}

export default RuleDataTable;