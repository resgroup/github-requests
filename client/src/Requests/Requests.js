import React from 'react';
import { Grid, Button, PageHeader, Panel, ListGroup, Label } from 'react-bootstrap';
import { Route, Switch, Link, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { Loading } from '../shared/Loading';
import ghClient from '../shared/githubClient';
import { CreatedBy } from '../shared/IssueHelpers';
import NewRequest from './NewRequest';
import RequestDetails from './RequestDetails';

const issueVisibilityText = showOpen => showOpen ? 'open' : 'closed';

class Requests extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      issues: [],
      showOpen: true
    };
    this.findIssue = this.findIssue.bind(this);
    this.toggleShowOpen = this.toggleShowOpen.bind(this);
    this.handleNewIssue = this.handleNewIssue.bind(this);
  }

  componentDidMount() {
    const labels = ['user request'];
    if (this.props.project.label !== this.props.project.repository) {
      labels.push(this.props.project.label);
    }

    if (this.props.project && !_.isEmpty(this.props.project)) {
      this.getIssues({ labels: labels.join(), state: 'all' }, this.props.project.organisation, this.props.project.repository);
    }
  }

  getIssues(issueOptions, organisation, repository) {
    this.setState({
      isLoading: true
    });
    return ghClient.gh
      .getIssues(organisation, repository)
      .listIssues(issueOptions)
      .then(response => {
        this.setState({
          issues: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err));
  }
  handleNewIssue(issue) {
    this.setState({
      issues: [issue, ...this.state.issues]
    });
  }

  findIssue(issueNumber) {
    return _.find(this.state.issues, i => i.number === parseInt(issueNumber, 10));
  }

  toggleShowOpen() {
    this.setState({ showOpen: !this.state.showOpen });
  }

  render() {
    if (this.props.project && _.isEmpty(this.props.project)) {
      //url parameters did not match the list of configured projects.
      return (<Redirect to="/requests" />);
    }

    const newRequestButton = this.props.issueNumber !== 'new' &&
      (<Button
        onClick={() => this.props.history.push(`/requests/${this.props.project.organisation}/${this.props.project.repository}/${this.props.project.label}/new`)}
        bsStyle="default"
        bsSize="large"
      >
        New Request
      </Button>);

    return (
      <Grid>
        <div>
          <PageHeader>
            <Link to={this.props.issueNumber ? `/requests` : `/requests/${this.props.project.organisation}/${this.props.project.repository}/${this.props.project.label}`}>
              <small className="back-link-container"><i className="fa fa-chevron-circle-left" /></small>
            </Link>
            {this.props.project.name}
            <span className="pull-right">
              {' '}
              {newRequestButton}
              {' '}
              {rest.isAdmin &&
                <a href={`http://github.com/${this.props.project.organisation}/${this.props.project.repository}/issues`} target="_blank">
                  <i className="fa fa-github fa-lg" />
                </a>}
              {' '}
            </span>
          </PageHeader>
        </div>
        {this.state.isLoading
          ? <Loading />
          : this.props.issueNumber === 'new' ?
              <NewRequest
              isAdmin={this.props.isAdmin}
              userProfile={this.props.userProfile}
              project={this.props.project}
              onIssueCreated={this.handleNewIssue}
              /> : this.props.issueNumber ?
                <RequestDetails
                  isAdmin={this.props.isAdmin}
                  userProfile={this.props.userProfile}
                  project={this.props.project}
                  issue={this.findIssue(this.props.issueNumber)}
                /> :
                <RequestList
                  organisation={this.props.organisation}
                  repo={this.props.repo}
                  label={this.props.label}
                  isAdmin={this.props.isAdmin}
                  userProfile={this.props.userProfile}
                  project={this.props.project}
                  issues={this.state.issues.filter(i => i.state === issueVisibilityText(this.state.showOpen))}
                  shown={issueVisibilityText(this.state.showOpen)}
                  hidden={issueVisibilityText(!this.state.showOpen)}
                  onVisibilityToggle={this.toggleShowOpen}
                />}
      </Grid>
    );
  }
}

Requests.defaultProps = {
  project: { name: '' }
};

export default Requests;

const RequestList = props => {
  const header = (
    <span>
      {props.issues.length}
      {' '}
      {props.shown}
      {' '}
      issues
      {' '}
      <a role="button" className="text pull-right" onClick={props.onVisibilityToggle}>Show {props.hidden} issues</a>
    </span>
  );

  return (
    <Panel defaultExpanded header={header} bsStyle="default">
      {props.issues && props.issues.length > 0
        ? <ListGroup fill>
            {props.issues.map(i => (
              <Link key={i.number} to={`/requests/${this.props.project.organisation}/${this.props.project.repository}/${this.props.project.label}/${i.number}`} className="list-group-item">
                <IssueInfo issue={i} />
              </Link>
            ))}
          </ListGroup>
        : <div className="text text-center">
            <p><i className="fa fa-check fa-4x" aria-hidden="true" /></p>
            This project does not have any issues!
          </div>}
    </Panel>
  );
};

export const IssueInfo = props => (
  <span>
    <strong>{props.issue.title}</strong>
    <small className="text-muted"><CreatedBy issueOrComment={props.issue} />
    </small>
    <span className="text pull-right">{props.issue.labels.map(l => <Tag key={l.name} label={l} />)}</span>
  </span>
);

const Tag = props => {
  const { label } = props;
  if (label.name === 'bug') return <Label bsStyle="danger">{label.name}</Label>;
  if (label.name === 'enhancement') return <Label bsStyle="success">{label.name}</Label>;

  return null;
};
