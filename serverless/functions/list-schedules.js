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
    
    // TODO: check if this build is the one that is deployed- otherwise if we loaded during another user's publish mid-flight, we could get the newly built asset version sid with the old version's published data.
    // also get the latest deployment/build sid for this?
    
    const latestBuildResult = await ServerlessOperations.fetchLatestBuild({ scriptName, context, attempts: 0 });
    
    if (!latestBuildResult.success) {
      response.setStatusCode(latestBuildResult.status);
      response.setBody({ message: latestBuildResult.message });
      callback(null, response);
      return;
    }
    
    const { latestBuild } = latestBuildResult;
    
    // get the schedule data asset version sid from the latest build
    const assetVersionSid = latestBuild.assetVersions.find(asset => asset.path == assetPath)?.sid;
    
    if (!assetVersionSid) {
      // error, no schedule data asset in latest build
      callback('Missing asset in latest build');
      return;
    }
    
    // for each schedule in scheduleData, evaluate the schedule and add to the response payload
    if (scheduleData.schedules) {
      scheduleData.schedules.forEach(schedule => {
        schedule.status = ScheduleUtils.evaluateSchedule(schedule.name);
      });
    }
    
    // return schedule data plus version sid
    const returnData = {
      ...scheduleData,
      version: assetVersionSid
    };
    
    response.setBody(returnData);
    callback(null, response);
  } catch (error) {
    console.log('Error executing function', error)
    callback(error);
  }
};
