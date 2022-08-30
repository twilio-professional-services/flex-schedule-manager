const ServerlessOperations = require(Runtime.getFunctions()['common/twilio-wrappers/serverless'].path);
const ScheduleUtils = require(Runtime.getFunctions()['common/helpers/schedule-utils'].path);

exports.handler = async function(context, event, callback) {
  const scriptName = arguments.callee.name;
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS GET');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const assetPath = '/schedules.json';
  
  // load schedule data
  const openScheduleData = Runtime.getAssets()[assetPath].open;
  const scheduleData = JSON.parse(openScheduleData());
  
  try {
    // get latest build
    // this is so we can provide a version sid in the response to avoid racing with multiple users updating schedules.
    // when updating the schedule, the client provides the sid, and we will only save if it matches the latest one.
    
    const latestBuildResult = await ServerlessOperations.fetchLatestBuild({ scriptName, context, attempts: 0 });
    
    if (!latestBuildResult.success) {
      response.setStatusCode(latestBuildResult.status);
      response.setBody({ message: latestBuildResult.message });
      callback(null, response);
      return;
    }
    
    const { latestBuild } = latestBuildResult;
    
    // get the schedule data asset version sid from the latest build
    const version = latestBuild.assetVersions.find(asset => asset.path == assetPath)?.sid;
    
    if (!version) {
      // error, no schedule data asset in latest build
      callback('Missing asset in latest build');
      return;
    }
    
    // now validate that this build is what is deployed
    const latestDeploymentResult = await ServerlessOperations.fetchLatestDeployment({ scriptName, context, attempts: 0 });
    
    if (!latestDeploymentResult.success) {
      response.setStatusCode(latestDeploymentResult.status);
      response.setBody({ message: latestDeploymentResult.message });
      callback(null, response);
      return;
    }
    
    const { latestDeployment } = latestDeploymentResult;
    
    const versionIsDeployed = latestDeployment.buildSid === latestBuild.sid;
    
    // for each schedule in scheduleData, evaluate the schedule and add to the response payload
    if (scheduleData.schedules) {
      scheduleData.schedules.forEach(schedule => {
        schedule.status = ScheduleUtils.evaluateSchedule(schedule.name);
      });
    }
    
    // return schedule data plus version data
    const returnData = {
      ...scheduleData,
      version,
      versionIsDeployed
    };
    
    response.setBody(returnData);
    callback(null, response);
  } catch (error) {
    console.log('Error executing function', error)
    callback(error);
  }
};
