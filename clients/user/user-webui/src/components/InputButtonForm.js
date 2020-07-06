import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, TextField} from "@material-ui/core";

export class InputButtonForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {    this.setState({value: event.target.value});  }
  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value + this.props.buttonText);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <TextField id="outlined-basic" label={this.props.fieldText} variant="outlined" value={this.state.value} onChange={this.handleChange}/>
        <Button type="submit" variant="contained" color="primary">
           {this.props.buttonText}
        </Button>
      </form>
    );
  }
}