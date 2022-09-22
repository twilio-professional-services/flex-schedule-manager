const TokenValidator = require('twilio-flex-token-validator').functionValidator;
const ParameterValidator = require(Runtime.getFunctions()['common/helpers/parameter-validator'].path);
const ServerlessOperations = require(Runtime.getFunctions()['common/twilio-wrappers/serverless'].path);

exports.handler = TokenValidator(async function updateSchedules(context, event, callback) {
  const scriptName = arguments.callee.name;
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const requiredParameters = [
    { key: 'rules', purpose: 'array of schedule rules to save' },
    { key: 'schedules', purpose: 'array of schedules to save' },
    { key: 'version', purpose: 'asset version SID that is being updated, so that multiple users making updates do not accidentally overwrite each other' }
  ];
  const parameterError = ParameterValidator.validate(context.PATH, event, requiredParameters);
  
  if (parameterError) {
    response.setStatusCode(400);
    response.setBody({ parameterError });
    callback(null, response);
    return;
  }
  
  const assetPath = '/schedules.json';
  
  const { rules, schedules, version, TokenResult } = event;
  
  if (TokenResult.roles.indexOf('admin') < 0) {
    response.setStatusCode(403);
    response.setBody("Not authorized");
    callback(null, response);
    return;
  }
  
  try {
    
    // if status was passed back to us, remove it
    if (schedules) {
      schedules.forEach(schedule => {
        if (schedule.status) {
          delete schedule.status;
        }
      });
    }
    
    const scheduleData = {
      rules,
      schedules
    };
    
    // get latest build
    const latestBuildResult = await ServerlessOperations.fetchLatestBuild({ scriptName, context, attempts: 0 });
    
    if (!latestBuildResult.success) {
      response.setStatusCode(latestBuildResult.status);
      response.setBody({ message: latestBuildResult.message });
      callback(null, response);
      return;
    }
    
    const { latestBuild } = latestBuildResult;
    
    // compare latest asset version sid to provided version sid
    const assetVersion = latestBuild.assetVersions.find(asset => asset.path == assetPath);
    
    if (!assetVersion) {
      // error, no asset to update
      callback('Missing asset from latest build');
      return;
    }
    
    if (assetVersion.sid != version) {
      // error, someone else made an update
      response.setStatusCode(409);
      response.setBody("Provided version SID is not the latest deployed asset version SID");
      callback(null, response);
      return;
    }
    
    // upload new asset version
    const uploadResult = await ServerlessOperations.uploadAsset({
      scriptName,
      context,
      attempts: 0,
      assetSid: assetVersion.asset_sid,
      assetPath,
      assetData: scheduleData
    });
    
    if (!uploadResult.success) {
      response.setStatusCode(uploadResult.status);
      response.setBody({ message: uploadResult.message });
      callback(null, response);
      return;
    }
      
    const newVersionSid = uploadResult.assetVersionSid;
    
    // create new build with the new asset, but with functions and dependencies from the latest build
    const assetVersions = [ newVersionSid ];
    const functionVersions = latestBuild.functionVersions.map(version => version.sid);
    const dependencies = latestBuild.dependencies;
    
    const buildResult = await ServerlessOperations.createBuild({ scriptName, context, attempts: 0, assetVersions, dependencies, functionVersions });
    
    response.setStatusCode(buildResult.status);
    response.setBody(buildResult);
    callback(null, response);
  } catch (error) {
    console.log('Error executing function', error);
    callback(error);
  }
});
