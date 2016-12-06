import React from 'react'
import { Grid, Row, Col, PageHeader } from 'react-bootstrap'
import azureClient from './shared/azureClient'
import githubClient from './shared/githubClient'

class SignOut extends React.Component {
  state = {
    message: ''
  }

  componentDidMount() {
    azureClient.SignOut()
    githubClient.SignOut()
    this.props.onSignOut()
  }

  render() {
    // const { from } = this.props.location.state || { from: { pathname: '/' } }

    const content = (
      <p>You have been signed out.</p>
    )

    return (
      <Grid>
        <PageHeader>Goodbye!</PageHeader>
        <Row>
          <Col md={4}>
            {content}
          </Col>
        </Row>
      </Grid>
    )
  }
}

SignOut.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default SignOut