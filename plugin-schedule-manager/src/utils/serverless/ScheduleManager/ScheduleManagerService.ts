import * as Flex from '@twilio/flex-ui';
import { ScheduleManagerConfig, UpdateSchedulesResponse, UpdateSchedulesStatusResponse, PublishSchedulesRequest, PublishSchedulesResponse } from '../../../types/schedule-manager';
import { EncodedParams } from '../../../types/serverless';
import ApiService from '../ApiService';

class ScheduleManagerService extends ApiService {

  async listSchedules(): Promise<ScheduleManagerConfig | null> {
    try {
      const config = await this.#listSchedules();
      return config;
    } catch (error) {
      console.log('Unable to list schedules', error);
      return null;
    }
  }
  
  async updateSchedules(config: ScheduleManagerConfig): Promise<UpdateSchedulesResponse> {
    try {
      const response = await this.#updateSchedules(config);
      return response;
    } catch (error) {
      console.log('Unable to update schedules', error);
      
      // TODO: Modify request util to return status too.
      if (error == 'Provided version SID is not the latest deployed asset version SID')
      {
        return {
          success: false,
          buildSid: 'versionError'
        };
      }
      
      return {
        success: false,
        buildSid: 'error'
      };
    }
  }
  
  async updateSchedulesStatus(buildSid: string): Promise<UpdateSchedulesStatusResponse> {
    try {
      const response = await this.#updateSchedulesStatus({buildSid});
      return response;
    } catch (error) {
      console.log('Unable to get schedule build status', error);
      return {
        success: false,
        buildStatus: 'error'
      };
    }
  }
  
  async publishSchedules(buildSid: string): Promise<PublishSchedulesResponse> {
    try {
      const response = await this.#publishSchedules({buildSid});
      return response;
    } catch (error) {
      console.log('Unable to publish schedules', error);
      return {
        success: false,
        deploymentSid: 'error'
      };
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
  
  #updateSchedules = async (config: ScheduleManagerConfig) : Promise<UpdateSchedulesResponse> => {
    const manager = Flex.Manager.getInstance();
    
    const params = {
      ...config,
      Token: manager.user.token,
    };
    
    const response = await this.fetchJsonWithReject<UpdateSchedulesResponse>(
      `https://${this.serverlessDomain}/update-schedules`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      }
    );
    
    return {
      ...response,
    };
  };
  
  #updateSchedulesStatus = async (request: PublishSchedulesRequest) : Promise<UpdateSchedulesStatusResponse> => {
    const manager = Flex.Manager.getInstance();
    
    const encodedParams: EncodedParams = {
      buildSid: encodeURIComponent(request.buildSid),
      Token: encodeURIComponent(manager.user.token),
    };
    
    const response = await this.fetchJsonWithReject<UpdateSchedulesStatusResponse>(
      `https://${this.serverlessDomain}/update-schedules-status`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams)
      }
    );
    
    return response;
  };
  
  #publishSchedules = async (request: PublishSchedulesRequest) : Promise<PublishSchedulesResponse> => {
    const manager = Flex.Manager.getInstance();
    
    const encodedParams: EncodedParams = {
      buildSid: encodeURIComponent(request.buildSid),
      Token: encodeURIComponent(manager.user.token),
    };
    
    const response = await this.fetchJsonWithReject<PublishSchedulesResponse>(
      `https://${this.serverlessDomain}/publish-schedules`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams)
      }
    );
    
    return response;
  };
}

export default new ScheduleManagerService();
