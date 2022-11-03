import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { CustomizationProvider } from "@twilio-paste/core/customization";

import CustomizeFlexComponents from './flex-hooks/components';
import CustomizeFlexStrings from './flex-hooks/strings';
import CustomizeFlexNotifications from './flex-hooks/notifications';

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
    
    flex.setProviders({
       PasteThemeProvider: CustomizationProvider
    });
    
    const initializers = [
      CustomizeFlexComponents,
      CustomizeFlexStrings,
      CustomizeFlexNotifications
    ];
    
    initializers.forEach((initializer) => initializer(flex, manager));
  }
}
