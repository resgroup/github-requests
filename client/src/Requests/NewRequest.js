import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, ControlLabel, ButtonGroup, Button, HelpBlock, Panel } from 'react-bootstrap';

import ghClient from '../shared/githubClient';
import { quoteRequestBody } from '../shared/requestUtils';
import MarkdownBlock from '../shared/MarkdownBlock';

class NewRequest extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: '',
      body: '',
      type: 'bug',
      submissionInProgress: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.createIssue();
  }

  getValidationState() {
    return this.state.title.length > 0 ? 'success' : 'error';
  }

  createIssue() {
    this.setState({ submissionInProgress: true });

    const labels = ['user request', this.state.type];
    if (this.props.project.label !== this.props.project.repo) {
      labels.push(this.props.project.label);
    }

    const issueData = {
      title: this.state.title,
      body: this.props.isAdmin ? this.state.body : quoteRequestBody(this.state.body, this.props.userProfile),
      labels
    };

    const issue = ghClient.gh.getIssues(this.props.project.organisation, this.props.project.repository);

    issue
      .createIssue(issueData)
      .then(response => {
        this.context.router.history.push(
          `/requests/${this.props.project.organisation}/${this.props.project.repository}/${this.props.project.label}`
        );
        this.props.onIssueCreated(response.data);
      })
      .catch(err => {
        console.log(err);
        this.setState({ submissionInProgress: false });
      });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} disabled={this.state.submissionInProgress}>
        <FormGroup controlId="formBasicText" bsSize="large" validationState={this.getValidationState()}>
          <ControlLabel>Request title</ControlLabel>
          <FormControl
            type="text"
            value={this.state.title}
            placeholder="Enter request title"
            onChange={e => this.setState({ title: e.target.value })}
            required
          />
          <FormControl.Feedback />
        </FormGroup>
        <FormGroup>
          <FormControl
            type="text"
            componentClass="textarea"
            value={this.state.body}
            placeholder="Enter request description"
            onChange={e => this.setState({ body: e.target.value })}
            style={{ height: 200 }}
          />
          <HelpBlock className="pull-right">
            You can format your request using{' '}
            <a target="_blank" rel="noopener noreferrer" href="https://guides.github.com/features/mastering-markdown/">Markdown</a>
            {' '}syntax
          </HelpBlock>
        </FormGroup>
        <FormGroup>
          <ButtonGroup>
            <Button onClick={() => this.setState({ type: 'bug' })} active={this.state.type === 'bug'}>Bug</Button>
            <Button onClick={() => this.setState({ type: 'enhancement' })} active={this.state.type !== 'bug'}>New Feature</Button>
          </ButtonGroup>
        </FormGroup>
        <Button
          bsSize="large"
          disabled={this.state.submissionInProgress}
          onClick={!this.state.submissionInProgress ? this.handleSubmit : null}
        >
          {this.state.submissionInProgress ? 'Submitting...' : 'Submit request'}
        </Button>
        <h3>Preview:</h3>
        {this.props.userProfile &&
          <Panel header={this.state.title}>
            <MarkdownBlock body={this.state.body} />
          </Panel>}
      </form>
    );
  }
}

NewRequest.contextTypes = {
  router: PropTypes.object.isRequired
};

export default NewRequest;
