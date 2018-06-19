const config = require('../../config');
const request = require('request');
const { getProxyRequestOptions, genericErrorHandler, rewriteResponseHeaders } = require( '../gitHubProxyHelpers');
const validateRepository = require( '../configHelpers');

const authenticatedRouter = require('./authenticatedRouter');

function githubProxyRequest (req, res) {
  console.log('Request App received request to: ', req.url);

  const gitHubRequest = request(getProxyRequestOptions(req.url)); // add the authorization that github wants
  
  console.log('Request App: Proxying request to: ', getProxyRequestOptions(req.url).url);
  
  req
  .pipe(gitHubRequest, genericErrorHandler) // send to git hub
  .on('response', response => rewriteResponseHeaders(req, response)) // response from github, monkey with the headers for some reason. Looking at the logs it doesn't seem to do anything
  .pipe(res, genericErrorHandler); // pipe response from github back to response from this route / function

  console.log('Request App: Finished proxying request to: ', getProxyRequestOptions(req.url).url);
}

authenticatedRouter.get('/repositories/*/issues', githubProxyRequest);

authenticatedRouter.get('/repos/:organisation/:repo/issues', githubProxyRequest);

authenticatedRouter.post('/repos/:organisation/:repo/issues', function(req, res) {
  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);
  const r = request.post(getProxyRequestOptions(req.url));
  req.pipe(r, genericErrorHandler).pipe(res);
});

