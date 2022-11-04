import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import CustomizeFlexComponents from './flex-hooks/components';

const PLUGIN_NAME = 'ScheduleManagerPlugin';

export default class ScheduleManagerPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    
    const initializers = [
      CustomizeFlexComponents
    ];
    
    initializers.forEach((initializer) => initializer(flex, manager));
  }
}
