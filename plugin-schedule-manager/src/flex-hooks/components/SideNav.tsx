import * as Flex from '@twilio/flex-ui';

import ScheduleSideLink from '../../custom-components/ScheduleSideLink/ScheduleSideLink';

export default (flex: typeof Flex, manager: Flex.Manager) => {
  // Add side nav button for the view
  flex.SideNav.Content.add(
    <ScheduleSideLink viewName="schedule-manager" key="schedule-manager-side-nav" />
  );
}
