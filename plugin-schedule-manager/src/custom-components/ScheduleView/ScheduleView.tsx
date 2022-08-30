import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Heading } from '@twilio-paste/core/heading';
import { Modal, ModalBody } from '@twilio-paste/core/modal';
import { Spinner } from '@twilio-paste/core/spinner';
import { Stack } from '@twilio-paste/core/stack';
import { Text } from '@twilio-paste/core/text';

import { PublishModalContent, ScheduleViewWrapper, ScheduleViewHeader } from './ScheduleViewStyles';

import RuleDataTable from '../RuleDataTable/RuleDataTable';
import ScheduleDataTable from '../ScheduleDataTable/ScheduleDataTable';
import { Rule, Schedule } from '../../types/schedule-manager';
import { loadScheduleData, publishSchedules } from '../../utils/schedule-manager';

const ScheduleView = ({}) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ rules, setRules ] = useState([] as Rule[]);
  const [ schedules, setSchedules ] = useState([] as Schedule[]);
  const [ updated, setUpdated ] = useState(new Date());
  const [ isVersionMismatch, setIsVersionMismatch ] = useState(false);
  const [ publishState, setPublishState ] = useState(0); // 0: normal; 1: publish in progress; 2: publish version error; 3: publish failed
  
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
      setUpdated(new Date());
      setIsVersionMismatch(scheduleData.versionIsDeployed === false);
    }
    
    setIsLoading(false);
  }
  
  const updateSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
  }
  
  const updateRules = (newRules: Rule[]) => {
    setRules(newRules);
  }
  
  const publish = async () => {
    setPublishState(1);
    const publishResult = await publishSchedules();
    setPublishState(publishResult);
    
    if (publishResult == 0) {
      await listSchedules();
    }
  }
  
  return (
    <ScheduleViewWrapper>
      <ScheduleViewHeader>
        <Heading as="h3" variant="heading30" marginBottom='space0'>
          Schedule Manager
        </Heading>
        <Stack orientation='horizontal' spacing='space30'>
          { publishState < 2 && isVersionMismatch && (
            <Text as='span'>Another schedule publish in progress. Publishing now will overwrite other changes.</Text>
          )}
          { publishState == 2 && (
            <Text as='span'>Schedule was updated by someone else and cannot be published.</Text>
          )}
          { publishState == 3 && (
            <Text as='span'>Schedule publish failed.</Text>
          )}
          <Button variant='secondary' onClick={publish}>Publish Schedules</Button>
        </Stack>
      </ScheduleViewHeader>
      <Tabs>
        <Tab label="Schedules">
          <ScheduleDataTable isLoading={isLoading} rules={rules} schedules={schedules} updateSchedules={updateSchedules} updated={updated} />
        </Tab>
        <Tab label="Rules">
          <RuleDataTable isLoading={isLoading} rules={rules} updateRules={updateRules} />
        </Tab>
      </Tabs>
      <Modal
        isOpen={publishState === 1}
        onDismiss={()=>{}}
        size='default'
        ariaLabelledby=''>
        <ModalBody>
          <PublishModalContent>
            <Stack orientation='horizontal' spacing='space60'>
              <Spinner decorative={true} size='sizeIcon90' title='Please wait...' />
              <Heading as='h3' variant='heading30' marginBottom='space0'>Publishing schedules, please wait...</Heading>
            </Stack>
          </PublishModalContent>
        </ModalBody>
      </Modal>
    </ScheduleViewWrapper>
  );
}

export default ScheduleView;