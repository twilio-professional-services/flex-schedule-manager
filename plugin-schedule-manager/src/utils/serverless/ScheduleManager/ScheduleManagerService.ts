import * as Flex from '@twilio/flex-ui';
import { ScheduleManagerConfig } from '../../../types/schedule-manager';
import { EncodedParams } from '../../../types/serverless';
import ApiService from '../ApiService';

class ScheduleManagerService extends ApiService {

  async listSchedules(): Promise<ScheduleManagerConfig | null> {

    try {
      const config = await this.#listSchedules()
      return config;
    } catch (error) {
      return null;
    }
  }

  #listSchedules = async () : Promise<ScheduleManagerConfig> => {
    const manager = Flex.Manager.getInstance();
    
    const encodedParams: EncodedParams = {
      Token: encodeURIComponent(manager.user.token),
    };
    
    const response = await this.fetchJsonWithReject<ScheduleManagerConfig>(
      `https://${this.serverlessDomain}/list-schedules`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams)
      }
    );
    
    return {
        ...response,
    };
  };
}

export default new ScheduleManagerService();
