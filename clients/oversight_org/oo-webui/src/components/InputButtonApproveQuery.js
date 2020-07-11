import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, TextField} from "@material-ui/core";
import {OO_SERVER_HOST, OO_SERVER_PORT} from "../services/ConfigService";

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

        <TextField id="outlined-basic" name="query_id" label={this.props.fieldText} variant="outlined" onChange={this.handleChange}/>
        <TextField id="outlined-basic-2" name="answer" label="Answer" variant="outlined" onChange={this.handleChange}/>
        <Button type="submit" variant="contained" color="primary">
           {this.props.buttonText}
        </Button>
      </form>
    );
  }
}