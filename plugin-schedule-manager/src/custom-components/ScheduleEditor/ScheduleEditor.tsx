import React, { useEffect, useState } from 'react';
import tzdata from 'tzdata';
import { ColumnDefinition, DataTable, SidePanel } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { Checkbox } from '@twilio-paste/core/checkbox';
import { Combobox, UseComboboxState } from '@twilio-paste/core/combobox';
import { Heading } from '@twilio-paste/core/heading';
import { HelpText } from '@twilio-paste/core/help-text';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Stack } from '@twilio-paste/core/stack';
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import { ChevronUpIcon } from "@twilio-paste/icons/esm/ChevronUpIcon";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";

import { isScheduleUnique, updateScheduleData } from '../../utils/schedule-manager';
import { Schedule, Rule } from '../../types/schedule-manager';

interface OwnProps {
  onPanelClosed: () => void;
  rules: Rule[];
  showPanel: boolean;
  selectedSchedule: Schedule | null;
  onUpdateSchedule: (schedules: Schedule[]) => void;
}

const ScheduleEditor = (props: OwnProps) => {
  const [timeZones, setTimeZones] = useState([] as string[]);
  
  const [name, setName] = useState("");
  const [emergencyClose, setEmergencyClose] = useState(false);
  const [timeZone, setTimeZone] = useState("");
  const [rules, setRules] = useState([] as Rule[]);
  
  useEffect(() => {
    let zones = [];
    for (const [key, _value] of Object.entries(tzdata.zones)) {
      zones.push(key);
    }
    
    setTimeZones(zones.sort());
  }, []);
  
  useEffect(() => {
    if (props.selectedSchedule !== null) {
      setName(props.selectedSchedule.name);
      setEmergencyClose(props.selectedSchedule.emergencyClose);
      setTimeZone(props.selectedSchedule.timeZone);
      
      let rules = [] as Rule[];
      
      props.selectedSchedule.rules.forEach(ruleGuid => {
        const matchingRule = props.rules.find(rule => rule.id == ruleGuid);
        
        if (matchingRule) {
          rules.push(matchingRule);
        }
      });
      
      setRules(rules);
    } else {
      setName("");
      setEmergencyClose(false);
      setTimeZone("");
      setRules([]);
    }
  }, [props.selectedSchedule]);
  
  const handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  }
  
  const handleChangeTimeZone = (changes: Partial<UseComboboxState<string>>) => {
    if (changes.selectedItem) {
      setTimeZone(changes.selectedItem);
    }
  }
  
  const handleChangeEmergencyClose = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmergencyClose(event.target.checked);
  }
  
  const handleAddRule = (changes: Partial<UseComboboxState<Rule>>) => {
    if (changes.selectedItem) {
      setRules([ ...rules, changes.selectedItem ]);
      // TODO clear combobox
    }
  }
  
  const handleRuleUp = (rule: Rule) => {
    const newRules = [...rules];
    
    var fromIndex = newRules.indexOf(rule);
    
    if (fromIndex > 0) {
      newRules.splice(fromIndex, 1);
      newRules.splice(fromIndex - 1, 0, rule);
    }
    
    setRules(newRules);
  }
  
  const handleRuleDown = (rule: Rule) => {
    const newRules = [...rules];
    
    var fromIndex = newRules.indexOf(rule);
    
    if (fromIndex < newRules.length) {
      newRules.splice(fromIndex, 1);
      newRules.splice(fromIndex + 1, 0, rule);
    }
    
    setRules(newRules);
  }
  
  const handleRuleRemove = (rule: Rule) => {
    setRules(rules => rules.filter(item => rule.id !== item.id));
  }
  
  const handleSave = () => {
    if (!name) {
      // TODO error
      return;
    }
    
    if (!timeZone) {
      // TODO error
      return;
    }
    
    const newSchedule = { name, emergencyClose, timeZone, rules: rules.map(rule => rule.id) };
    
    if (isScheduleUnique(newSchedule, props.selectedSchedule)) {
      const newScheduleData = updateScheduleData(newSchedule, props.selectedSchedule);
      props.onUpdateSchedule(newScheduleData);
    } else {
      // TODO show error
    }
  }
  
  const handleDelete = () => {
    // TODO
  }
  
  return (
    <SidePanel
      displayName='scheduleEditor'
      isHidden={!props.showPanel}
      handleCloseClick={props.onPanelClosed}
      title={<span>{ props.selectedSchedule === null ? 'New' : 'Edit' } Schedule</span>}
    >
      <Box padding='space60'>
        <Stack orientation="vertical" spacing='space80'>
          <>
            <Label htmlFor="name" required>Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={handleChangeName}
              required />
          </>
          <Combobox
            items={timeZones}
            labelText="Time zone"
            selectedItem={timeZone}
            onSelectedItemChange={handleChangeTimeZone}
            required />
          <Checkbox
            checked={emergencyClose}
            onChange={handleChangeEmergencyClose}
            id="emergencyClose"
            name="emergencyClose"
            helpText="Overrides all selected rules">
            Emergency closed
          </Checkbox>
          <Heading as="h3" variant="heading30">
            Rules
          </Heading>
          <HelpText>If an open rule matches and no closed rules match, the schedule is open. If a closed rule matches, the topmost match in the list is used.</HelpText>
          <DataTable
            items={rules}>
            <ColumnDefinition
              key="actions-column"
              header="Actions"
              content={(item: Rule) => (
                  <Stack orientation='horizontal' spacing='space20'>
                    <Button variant='secondary' size='icon_small' onClick={_ => handleRuleUp(item)}>
                      <ChevronUpIcon decorative={false} title='Up' />
                    </Button>
                    <Button variant='secondary' size='icon_small' onClick={_ => handleRuleDown(item)}>
                      <ChevronDownIcon decorative={false} title='Down' />
                    </Button>
                    <Button variant='destructive_secondary' size='icon_small' onClick={_ => handleRuleRemove(item)}>
                      <DeleteIcon decorative={false} title='Remove from schedule' />
                    </Button>
                  </Stack>
                )} />
            <ColumnDefinition
              key="name-column"
              header="Rule"
              content={(item: Rule) => {
                return <span>{item.name}</span>
              }} />
          </DataTable>
          <Combobox
            items={props.rules.filter(rule => rules.indexOf(rule) < 0).sort((a, b) => (a.name > b.name) ? 1 : -1)}
            labelText="Add rule"
            onSelectedItemChange={handleAddRule}
            optionTemplate={(item: Rule) => item.name}
            itemToString={(item: Rule) => item.name} />
          <Stack orientation='horizontal' spacing='space60'>
            <Button variant='primary' onClick={handleSave}>
              Save
            </Button>
            {
              props.selectedSchedule !== null &&
                (<Button variant='destructive' onClick={handleDelete}>
                  Delete
                </Button>)
            }
          </Stack>
        </Stack>
      </Box>
    </SidePanel>
  );
}

export default ScheduleEditor;