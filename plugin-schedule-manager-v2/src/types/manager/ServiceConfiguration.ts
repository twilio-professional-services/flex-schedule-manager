import * as Flex from '@twilio/flex-ui';

type FlexUIAttributes = Flex.ServiceConfiguration["ui_attributes"];

export interface UIAttributes extends FlexUIAttributes {
  schedule_manager: {
    serverless_functions_domain: string;
  }
}
