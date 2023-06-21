import * as Flex from '@twilio/flex-ui';

import SideNav from './SideNav';
import ViewCollection from './ViewCollection';

export default (flex: typeof Flex, manager: Flex.Manager) => {
  SideNav(flex, manager);
  ViewCollection(flex, manager);
}
