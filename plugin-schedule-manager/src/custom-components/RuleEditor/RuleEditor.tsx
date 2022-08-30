import React, { useEffect, useState } from 'react';
import { SidePanel } from '@twilio/flex-ui';
import { Alert } from '@twilio-paste/core/alert';
import { Button } from '@twilio-paste/core/button';
import { Box } from '@twilio-paste/core/box';
import { Checkbox, CheckboxGroup } from '@twilio-paste/core/checkbox';
import { DatePicker, formatReturnDate } from '@twilio-paste/core/date-picker';
import { Heading } from '@twilio-paste/core/heading';
import { HelpText } from '@twilio-paste/core/help-text';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Radio, RadioGroup } from '@twilio-paste/core/radio-group';
import { Select, Option } from '@twilio-paste/core/select';
import { Stack } from '@twilio-paste/core/stack';
import { TimePicker, formatReturnTime } from '@twilio-paste/core/time-picker';
import { RRule, Frequency, ByWeekday } from 'rrule';
import { v4 as uuidv4 } from 'uuid';

import { isRuleUnique, updateRuleData } from '../../utils/schedule-manager';
import { Rule } from '../../types/schedule-manager';

interface OwnProps {
  onPanelClosed: () => void;
  showPanel: boolean;
  selectedRule: Rule | null;
  onUpdateRule: (rules: Rule[]) => void;
}

const RuleEditor = (props: OwnProps) => {
  // general
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [closedReason, setClosedReason] = useState('closed');
  
  // time settings
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // date settings
  const [recurrence, setRecurrence] = useState('none');
  
  // daily recurrence
  const [singleDate, setSingleDate] = useState('');
  
  // weekly recurrence
  const [dowMonday, setDowMonday] = useState(false);
  const [dowTuesday, setDowTuesday] = useState(false);
  const [dowWednesday, setDowWednesday] = useState(false);
  const [dowThursday, setDowThursday] = useState(false);
  const [dowFriday, setDowFriday] = useState(false);
  const [dowSaturday, setDowSaturday] = useState(false);
  const [dowSunday, setDowSunday] = useState(false);
  
  // monthly or yearly recurrence
  const [dayOfMonth, setDayOfMonth] = useState('');
  
  // yearly recurrence
  const [month, setMonth] = useState('');
  
  // restrict dates
  const [restrictDates, setRestrictDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    resetView();
    
    if (props.selectedRule === null) {
      return;
    }
    
    const rule = props.selectedRule;
    
    setName(rule.name);
    setIsOpen(rule.isOpen);
    setClosedReason(rule.closedReason);
    setAllDay(!rule.startTime && !rule.endTime);
    setStartTime(rule.startTime);
    setEndTime(rule.endTime);
    
    if (rule.dateRRule) {
      const ruleOptions = RRule.parseString(rule.dateRRule);
      
      switch (ruleOptions.freq) {
        case Frequency.DAILY:
          setRecurrence('daily');
          break;
        case Frequency.WEEKLY:
          setRecurrence('weekly');
          if (ruleOptions.byweekday) {
            const isArray = Array.isArray(ruleOptions.byweekday);
            setDowMonday(ruleOptions.byweekday === RRule.MO || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.MO) >= 0));
            setDowTuesday(ruleOptions.byweekday === RRule.TU || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.TU) >= 0));
            setDowWednesday(ruleOptions.byweekday === RRule.WE || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.WE) >= 0));
            setDowThursday(ruleOptions.byweekday === RRule.TH || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.TH) >= 0));
            setDowFriday(ruleOptions.byweekday === RRule.FR || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.FR) >= 0));
            setDowSaturday(ruleOptions.byweekday === RRule.SA || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.SA) >= 0));
            setDowSunday(ruleOptions.byweekday === RRule.SU || (isArray && (ruleOptions.byweekday as ByWeekday[]).indexOf(RRule.SU) >= 0));
          }
          break;
        case Frequency.MONTHLY:
          setRecurrence('monthly');
          if (!Array.isArray(ruleOptions.bymonthday)) {
            setDayOfMonth(ruleOptions.bymonthday ? ruleOptions.bymonthday.toString() : '');
          }
          break;
        case Frequency.YEARLY:
          setRecurrence('yearly');
          if (!Array.isArray(ruleOptions.bymonthday)) {
            setDayOfMonth(ruleOptions.bymonthday ? ruleOptions.bymonthday.toString() : '');
          }
          if (!Array.isArray(ruleOptions.bymonth)) {
            setMonth(ruleOptions.bymonth ? ruleOptions.bymonth.toString() : '');
          }
          break;
        default:
          setRecurrence('none');
          break;
      }
    } else {
      setRecurrence('none');
      setSingleDate(rule.startDate);
    }
    
    if (rule.dateRRule && (rule.startDate || rule.endDate)) {
      setRestrictDates(true);
    } else {
      setRestrictDates(false);
    }
    
    setStartDate(rule.startDate);
    setEndDate(rule.endDate);
  }, [props.selectedRule]);
  
  useEffect(() => {
    if (!props.showPanel) {
      resetView();
    }
  }, [props.showPanel]);
  
  const resetView = () => {
    setError('');
    setName('');
    setIsOpen(true);
    setClosedReason('closed');
    setAllDay(true);
    setStartTime('');
    setEndTime('');
    setRecurrence('none');
    setSingleDate('');
    setDowMonday(false);
    setDowTuesday(false);
    setDowWednesday(false);
    setDowThursday(false);
    setDowFriday(false);
    setDowSaturday(false);
    setDowSunday(false);
    setDayOfMonth('');
    setMonth('');
    setRestrictDates(false);
    setStartDate('');
    setEndDate('');
  }
  
  const handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  }
  
  const handleIsOpenChange = (value: string) => {
    if (value === "open") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }
  
  const handleChangeClosedReason = (event: React.FormEvent<HTMLInputElement>) => {
    setClosedReason(event.currentTarget.value);
  }
  
  const handleChangeAllDay = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllDay(event.target.checked);
  }
  
  const handleChangeStartTime = (event: React.FormEvent<HTMLInputElement>) => {
    setStartTime(event.currentTarget.value);
  }
  
  const handleChangeEndTime = (event: React.FormEvent<HTMLInputElement>) => {
    setEndTime(event.currentTarget.value);
  }
  
  const handleChangeRecurrence = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRecurrence(event.target.value);
  }
  
  const handleChangeSingleDate = (event: React.FormEvent<HTMLInputElement>) => {
    setSingleDate(event.currentTarget.value);
  }
  
  const handleChangeDow = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch(event.target.name) {
      case 'dowMonday':
        setDowMonday(event.target.checked);
        break;
      case 'dowTuesday':
        setDowTuesday(event.target.checked);
        break;
      case 'dowWednesday':
        setDowWednesday(event.target.checked);
        break;
      case 'dowThursday':
        setDowThursday(event.target.checked);
        break;
      case 'dowFriday':
        setDowFriday(event.target.checked);
        break;
      case 'dowSaturday':
        setDowSaturday(event.target.checked);
        break;
      case 'dowSunday':
        setDowSunday(event.target.checked);
        break;
    }
  }
  
  const handleChangeDayOfMonth = (event: React.FormEvent<HTMLInputElement>) => {
    // the Paste 'number' input type doesn't handle non-numbers well
    // the change handler won't even run if we use the number type and enter a letter
    
    const inputStr = event.currentTarget.value;
    let day = parseInt(inputStr, 10);
    
    if (day.toString() !== inputStr || day < 1 || day > 31) {
      setDayOfMonth('');
      return;
    }
    
    setDayOfMonth(event.currentTarget.value);
  }
  
  const handleChangeMonth = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value);
  }
  
  const handleChangeRestrictDates = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRestrictDates(event.target.checked);
  }
  
  const handleChangeStartDate = (event: React.FormEvent<HTMLInputElement>) => {
    setStartDate(event.currentTarget.value);
  }
  
  const handleChangeEndDate = (event: React.FormEvent<HTMLInputElement>) => {
    setEndDate(event.currentTarget.value);
  }
  
  const handleSave = () => {
    // validation
    if (!name) {
      setError('Name is a required field.');
      return;
    }
    
    if (!isOpen && !closedReason) {
      setError('Closed reason is a required field for closed rules.');
      return;
    }
    
    if (!allDay && (!startTime || !endTime)) {
      setError('Both start and end time are required fields for non-all-day rules.');
      return;
    }
    
    if (!allDay) {
      const start = new Date('2000-01-01 ' + startTime);
      const end = new Date('2000-01-01 ' + endTime);
      
      if (start >= end) {
        setError('End time must be later than start time.');
        return;
      }
    }
    
    switch (recurrence) {
      case 'none':
        if (!singleDate) {
          setError('Date is a required field.');
          return;
        }
        break;
      case 'weekly':
        if (!dowMonday && !dowTuesday && !dowWednesday && !dowThursday && !dowFriday && !dowSaturday && !dowSunday) {
          setError('At least one day of week must be selected.');
          return;
        }
        break;
      case 'monthly':
        if (!dayOfMonth) {
          setError('Day of month is a required field.');
          return;
        }
        const numDayOfMonthMonthly = Number(dayOfMonth);
        if (isNaN(numDayOfMonthMonthly)) {
          setError('Day of month must be a number.');
          return;
        }
        if (numDayOfMonthMonthly < 1 || numDayOfMonthMonthly > 31) {
          setError('Day of month must be between 1 and 31.');
          return;
        }
        break;
      case 'yearly':
        const numDayOfMonthYearly = Number(dayOfMonth);
        if (isNaN(numDayOfMonthYearly)) {
          setError('Day of month must be a number.');
          return;
        }
        if (numDayOfMonthYearly < 1 || numDayOfMonthYearly > 31) {
          setError('Day of month must be between 1 and 31.');
          return;
        }
        break;
    }
    
    if (recurrence !== "none" && restrictDates && !startDate && !endDate) {
      setError('Start and/or end date is required when restricting the date range.');
      return;
    }
    
    if (recurrence !== "none" && restrictDates && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        setError('End date must be after start date.');
        return;
      }
    }
    
    // build new rule
    
    let ruleId;
    
    if (props.selectedRule) {
      ruleId = props.selectedRule.id;
    } else {
      ruleId = uuidv4();
    }
    
    const newRule = {
      id: ruleId,
      name,
      isOpen
    } as Rule;
    
    if (!isOpen) {
      newRule.closedReason = closedReason;
    }
    
    if (!allDay) {
      newRule.startTime = startTime;
      newRule.endTime = endTime;
    }
    
    switch (recurrence) {
      case 'none':
        newRule.startDate = singleDate;
        newRule.endDate = singleDate;
        break;
      case 'daily':
        const dailyRRule = new RRule({
          freq: Frequency.DAILY
        });
        newRule.dateRRule = dailyRRule.toString();
        break;
      case 'weekly':
        let weekdays = [] as ByWeekday[];
        
        if (dowMonday) weekdays.push(RRule.MO);
        if (dowTuesday) weekdays.push(RRule.TU);
        if (dowWednesday) weekdays.push(RRule.WE);
        if (dowThursday) weekdays.push(RRule.TH);
        if (dowFriday) weekdays.push(RRule.FR);
        if (dowSaturday) weekdays.push(RRule.SA);
        if (dowSunday) weekdays.push(RRule.SU);
        
        const weeklyRRule = new RRule({
          freq: Frequency.WEEKLY,
          byweekday: weekdays
        });
        newRule.dateRRule = weeklyRRule.toString();
        break;
      case 'monthly':
        const monthlyRRule = new RRule({
          freq: Frequency.MONTHLY,
          bymonthday: Number(dayOfMonth)
        });
        newRule.dateRRule = monthlyRRule.toString();
        break;
      case 'yearly':
        let monthNum = 1;
        if (month) {
          monthNum = Number(month);
        }
        const yearlyRRule = new RRule({
          freq: Frequency.YEARLY,
          bymonth: monthNum,
          bymonthday: Number(dayOfMonth)
        });
        newRule.dateRRule = yearlyRRule.toString();
        break;
    }
    
    if (recurrence !== 'none' && restrictDates) {
      newRule.startDate = startDate;
      newRule.endDate = endDate;
    }
    
    if (isRuleUnique(newRule, props.selectedRule)) {
      setError('');
      const newRuleData = updateRuleData(newRule, props.selectedRule);
      props.onUpdateRule(newRuleData);
    } else {
      setError('Name must be unique.');
    }
  }
  
  const handleDelete = () => {
    if (!props.selectedRule) {
      return;
    }
    
    // TODO: Check if rule is referenced. If so, fail!
    
    const newRuleData = updateRuleData(null, props.selectedRule);
    props.onUpdateRule(newRuleData);
  }
  
  return (
    <SidePanel
      displayName='ruleEditor'
      isHidden={!props.showPanel}
      handleCloseClick={props.onPanelClosed}
      title={<span>{ props.selectedRule === null ? 'New' : 'Edit' } Rule</span>}
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
          <RadioGroup
            name="isOpen"
            value={isOpen ? "open" : "closed"}
            legend="Type"
            onChange={handleIsOpenChange}
            orientation="horizontal"
            required>
            <Radio
              id="open"
              value="open"
              name="isOpen">
              Open
            </Radio>
            <Radio
              id="closed"
              value="closed"
              name="isOpen">
              Closed
            </Radio>
          </RadioGroup>
          { !isOpen && (
            <>
              <Label htmlFor="closedReason" required>Closed reason</Label>
              <Input
                id="closedReason"
                name="closedReason"
                type="text"
                value={closedReason}
                onChange={handleChangeClosedReason}
                required />
              <HelpText>This value will be provided to your application when the rule matches.</HelpText>
            </>
          )}
          <Heading as="h3" variant="heading30">
            Time Settings
          </Heading>
          <Checkbox
            checked={allDay}
            onChange={handleChangeAllDay}
            id="allDay"
            name="allDay">
            All day
          </Checkbox>
          { !allDay && (
            <>
              <Label htmlFor="startTime" required>Start time</Label>
              <TimePicker
                id="startTime"
                name="startTime"
                value={startTime}
                onChange={handleChangeStartTime}
                required />
            </>
          )}
          { !allDay && (
          <>
            <Label htmlFor="endTime" required>End time</Label>
            <TimePicker
              id="endTime"
              name="endTime"
              value={endTime}
              onChange={handleChangeEndTime}
              required />
          </>
          )}
          <Heading as="h3" variant="heading30">
            Date Settings
          </Heading>
          <>
            <Label htmlFor="recurrence" required>Recurrence</Label>
            <Select
              id="recurrence"
              name="recurrence"
              defaultValue="none"
              value={recurrence}
              onChange={handleChangeRecurrence}>
              <Option value="none">One time</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </>
          { recurrence === "none" && (
            <>
              <Label htmlFor="singleDate" required>Date</Label>
              <DatePicker
                id="singleDate"
                name="singleDate"
                value={singleDate}
                onChange={handleChangeSingleDate}
                required />
            </>
          )}
          { recurrence === "weekly" && (
            <CheckboxGroup
              name="dayOfWeek"
              legend="Day of week"
              required>
              <Checkbox
                checked={dowMonday}
                onChange={handleChangeDow}
                id="dowMonday"
                name="dowMonday">
                Monday
              </Checkbox>
              <Checkbox
                checked={dowTuesday}
                onChange={handleChangeDow}
                id="dowTuesday"
                name="dowTuesday">
                Tuesday
              </Checkbox>
              <Checkbox
                checked={dowWednesday}
                onChange={handleChangeDow}
                id="dowWednesday"
                name="dowWednesday">
                Wednesday
              </Checkbox>
              <Checkbox
                checked={dowThursday}
                onChange={handleChangeDow}
                id="dowThursday"
                name="dowThursday">
                Thursday
              </Checkbox>
              <Checkbox
                checked={dowFriday}
                onChange={handleChangeDow}
                id="dowFriday"
                name="dowFriday">
                Friday
              </Checkbox>
              <Checkbox
                checked={dowSaturday}
                onChange={handleChangeDow}
                id="dowSaturday"
                name="dowSaturday">
                Saturday
              </Checkbox>
              <Checkbox
                checked={dowSunday}
                onChange={handleChangeDow}
                id="dowSunday"
                name="dowSunday">
                Sunday
              </Checkbox>
            </CheckboxGroup>
          )}
          { recurrence === "yearly" && (
            <>
              <Label htmlFor="month" required>Month</Label>
              <Select
                id="month"
                name="month"
                defaultValue="1"
                value={month}
                onChange={handleChangeMonth}>
                <Option value="1">January</Option>
                <Option value="2">February</Option>
                <Option value="3">March</Option>
                <Option value="4">April</Option>
                <Option value="5">May</Option>
                <Option value="6">June</Option>
                <Option value="7">July</Option>
                <Option value="8">August</Option>
                <Option value="9">September</Option>
                <Option value="10">October</Option>
                <Option value="11">November</Option>
                <Option value="12">December</Option>
              </Select>
            </>
          )}
          { (recurrence === "monthly" || recurrence === "yearly") && (
            <>
              <Label htmlFor="dayOfMonth" required>Day of month</Label>
              <Input
                id="dayOfMonth"
                name="dayOfMonth"
                type="text"
                value={dayOfMonth}
                onChange={handleChangeDayOfMonth}
                required />
            </>
          )}
          { recurrence !== "none" && (
            <Checkbox
              checked={restrictDates}
              onChange={handleChangeRestrictDates}
              id="restrictDates"
              name="restrictDates">
              Restrict date range
            </Checkbox>
          )}
          { recurrence !== "none" && restrictDates && (
            <>
              <Label htmlFor="startDate">Start date</Label>
              <DatePicker
                id="startDate"
                name="startDate"
                max={endDate}
                value={startDate}
                onChange={handleChangeStartDate} />
            </>
          )}
          { recurrence !== "none" && restrictDates && (
            <>
              <Label htmlFor="endDate">End date</Label>
              <DatePicker
                id="endDate"
                name="endDate"
                min={startDate}
                value={endDate}
                onChange={handleChangeEndDate} />
            </>
          )}
          {
            error.length > 0 &&
            (
              <Alert variant='error'>{error}</Alert>
            )
          }
          <Stack orientation='horizontal' spacing='space60'>
            <Button variant='primary' onClick={handleSave}>
              Save
            </Button>
            {
              props.selectedRule !== null &&
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

export default RuleEditor;