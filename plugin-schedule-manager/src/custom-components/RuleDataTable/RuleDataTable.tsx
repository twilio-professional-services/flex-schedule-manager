import React, { useEffect, useState } from 'react';
import { ColumnDefinition, DataTable } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { RRule } from 'rrule'

import RuleEditor from '../RuleEditor/RuleEditor';
import { Rule } from '../../types/schedule-manager';

interface OwnProps {
  isLoading: boolean;
  rules: Array<Rule>;
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
    setShowPanel(true);
  }
  
  const onPanelClosed = () => {
    setShowPanel(false);
    setSelectedRule(null);
  }
  
  const onRowClick = (item: Rule) => {
    setSelectedRule(item);
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
          onRowClick={onRowClick}>
          <ColumnDefinition
            key="name-column"
            header="Name"
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
                
                if (item.startDate) {
                  dateStr += `from ${item.startDate}`;
                }
                
                if (item.endDate) {
                  dateStr += ` to ${item.endDate}`;
                }
                
                if (item.dateRRule) {
                  if (dateStr) {
                    dateStr += ', ';
                  }
                  
                  dateStr += RRule.fromString(item.dateRRule).toText();
                }
              }
              
              return <span>{dateStr}</span>
            }} />
        </DataTable>
      </div>
      <RuleEditor
        onPanelClosed={onPanelClosed}
        showPanel={showPanel}
        selectedRule={selectedRule} />
    </>
  );
}

export default RuleDataTable;