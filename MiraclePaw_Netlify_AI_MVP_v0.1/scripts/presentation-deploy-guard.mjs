// No credentials are read, printed, serialized or copied by this deployment gate.
import {pathToFileURL} from 'node:url';
export function deploymentApproved(env){
  return env.PRESENTATION_DEPLOY_APPROVED==='true' && env.CONTEXT==='deploy-preview' &&
    (env.HEAD||env.BRANCH)==='presentation/deepseek-flash-demo';
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href){
  const allowed=deploymentApproved(process.env);
  // Netlify ignore exit 0 cancels a build; build command exit 1 blocks hook/manual bypass.
  if(process.argv.includes('--ignore'))process.exitCode=allowed?1:0;
  else {if(!allowed)console.error('Presentation deploy blocked: explicit branch Preview approval is required.');process.exitCode=allowed?0:1;}
}
