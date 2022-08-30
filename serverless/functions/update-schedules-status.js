const ParameterValidator = require(Runtime.getFunctions()['common/helpers/parameter-validator'].path);
const ServerlessOperations = require(Runtime.getFunctions()['common/twilio-wrappers/serverless'].path);

exports.handler = async function(context, event, callback) {
  const scriptName = arguments.callee.name;
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const requiredParameters = [
    { key: 'buildSid', purpose: 'build sid to check status of' }
  ];
  const parameterError = ParameterValidator.validate(context.PATH, event, requiredParameters);
  
  if (parameterError) {
    response.setStatusCode(400);
    response.setBody({ parameterError });
    callback(null, response);
    return;
  }
  
  const { buildSid } = event;
  
  try {
    // get status of the given build sid
    const buildStatusResult = await ServerlessOperations.fetchBuildStatus({ scriptName, context, attempts: 0, buildSid });
    
    response.setStatusCode(buildStatusResult.status);
    response.setBody(buildStatusResult);
    callback(null, response);
  } catch (error) {
    console.log('Error executing function', error);
    callback(error);
  }
};
