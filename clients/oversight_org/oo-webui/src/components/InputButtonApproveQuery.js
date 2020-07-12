import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, TextField} from "@material-ui/core";
import {OO_SERVER_HOST, OO_SERVER_PORT} from "../services/ConfigService";
import Grid from "@material-ui/core/Grid";

const axios = require('axios').default;

export class InputButtonApproveQuery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

 handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
}
  handleSubmit(event) {
    alert('Submitting for query: ' + this.state["query_id"] + " with answer: " + this.state["answer"]);
    event.preventDefault();

    try {
        let data = JSON.stringify({query_id: this.state["query_id"], response: this.state["answer"]})
        return axios.post(`http://${OO_SERVER_HOST}:${OO_SERVER_PORT}/processQuery/`, data,
            {headers: {'Content-Type': 'application/json'}});

    } catch(error) {
        console.error(error);
    }

  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
          <Grid container direction="row"
                justify="center"
                alignItems="center"
                spacing={2}>
              <Grid item xs={4}>
                <TextField id="outlined-basic" name="query_id" label={this.props.fieldText} variant="outlined" onChange={this.handleChange}/>
              </Grid>
              <Grid item xs={4}>
        <TextField id="outlined-basic-2" name="answer" label="Answer" variant="outlined" onChange={this.handleChange}/>
              </Grid>
              <Grid item xs={4}>
        <Button type="submit" variant="contained" color="secondary">
           {this.props.buttonText}
        </Button>
              </Grid>
          </Grid>
      </form>
    );
  }
}