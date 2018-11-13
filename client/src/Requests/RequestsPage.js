import React from 'react';
import _ from 'lodash';
import { Grid, PageHeader, ListGroup, Panel } from 'react-bootstrap';
import { Route, Switch, Link } from 'react-router-dom';
import Requests from './Requests';

const findProject = (projects, organisation, repo, label) => {
  return _.find(projects, p => p.organisation === organisation && 
                          p.repository === repo && 
                          (p.label === label || p.label.replace(" ", "+") === label)) || {};
};

const RequestsPage = ({ match, ...rest }) => rest.projects.length > 0 &&
  <div>
    <Switch>
      <Route
        path={`${match.path}/:organisation/:repo/:label/:issueNumber`}
        render={props => (
          <Requests
            issueNumber={props.match.params.issueNumber}
            isAdmin={rest.isAdmin}
            userProfile={rest.userProfile}
            project={findProject(rest.projects, props.match.params.organisation, props.match.params.repo, props.match.params.label)}
          />
        )}
      />
      <Route
        render={props => (
          <RequestsPageHome
            {...props}
            isAdmin={rest.isAdmin}
            userProfile={rest.userProfile}
            projects={rest.projects}
            groups={rest.groups}
          />
        )}
      />
    </Switch>
  </div>;

export default RequestsPage;

const RequestsPageHome = props => (
  <Grid>
    <PageHeader>Please select a project: </PageHeader>
    {props.groups.length > 0 &&
      props.groups.map(pg => (
        <ProjectGroup
          key={pg.name}
          name={pg.name}
          description={pg.description}
          projects={props.projects.filter(p => _.includes(p.groups, pg.key))}
        />
      ))}
  </Grid>
);

const ProjectGroup = props => (
  <Panel collapsible defaultExpanded header={props.name}>
    {props.description && props.description}
    <ListGroup fill>
      {props.projects.map(p => (
        <Link key={p.label} to={`/requests/${p.organisation}/${p.repository}/${p.label}`} className="list-group-item">
          {p.name}
        </Link>
      ))}
    </ListGroup>
  </Panel>
);
