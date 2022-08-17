import React, { useEffect, useState } from 'react';
import tzdata from 'tzdata';
import { SidePanel } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { Checkbox } from '@twilio-paste/core/checkbox';
import { Combobox } from '@twilio-paste/core/combobox';
import { Heading } from '@twilio-paste/core/heading';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Stack } from '@twilio-paste/core/stack';

import { Schedule, Rule } from '../../types/schedule-manager';

interface OwnProps {
  onPanelClosed: () => void;
  rules: Rule[];
  showPanel: boolean;
  selectedSchedule: Schedule | null;
}

const ScheduleEditor = (props: OwnProps) => {
  const newSchedule = {
    name: "",
    emergencyClose: false,
    timeZone: "",
    rules: [] as string[]
  };
  
  const [schedule, setSchedule] = useState(newSchedule);
  const [timeZones, setTimeZones] = useState([] as string[]);
  
  useEffect(() => {
    let zones = [];
    for (const [key, _value] of Object.entries(tzdata.zones)) {
      zones.push(key);
    }
    
    setTimeZones(zones.sort());
  }, []);
  
  useEffect(() => {
    if (props.selectedSchedule !== null) {
      setSchedule(props.selectedSchedule);
    } else {
      setSchedule(newSchedule);
    }
  }, [props.selectedSchedule]);
  
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
              value={schedule.name}
              required />
          </>
          <Combobox
            items={timeZones}
            labelText="Time zone"
            selectedItem={schedule.timeZone}
            required />
          <Checkbox
            checked={schedule.emergencyClose}
            id="emergencyClose"
            name="emergencyClose"
            helpText="Overrides all selected rules">
            Emergency closed
          </Checkbox>
          <Heading as="h3" variant="heading30">
            Rules
          </Heading>
          <Combobox
            items={props.rules.sort((a, b) => (a.name > b.name) ? 1 : -1)}
            labelText="Add rule"
            optionTemplate={(item: Rule) => item.name}
            itemToString={(item: Rule) => item.name} />
          <Stack orientation='horizontal' spacing='space60'>
            <Button variant='primary'>
              Save
            </Button>
          </Stack>
        </Stack>
      </Box>
    </SidePanel>
  );
}

export default ScheduleEditor;