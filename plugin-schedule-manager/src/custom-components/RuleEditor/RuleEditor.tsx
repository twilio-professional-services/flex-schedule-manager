import React from 'react';
import { SidePanel } from '@twilio/flex-ui';

import { Rule } from '../../types/schedule-manager';

interface OwnProps {
  onPanelClosed: () => void;
  showPanel: boolean;
  selectedRule: Rule | null;
}

const RuleEditor = (props: OwnProps) => {
  return (
    <SidePanel
      displayName='ruleEditor'
      isHidden={!props.showPanel}
      handleCloseClick={props.onPanelClosed}
      title={<span>{ props.selectedRule === null ? 'New' : 'Edit' } Rule</span>}
    >
    <div>Hello</div>
    </SidePanel>
  );
}

export default RuleEditor;