import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Button, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import {cashIn} from "../services/CashInService";

export class InputButtonForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Grid container direction="row"
                      justify="center"
                      alignItems="center"
                      spacing={2}>
                    <Grid item xs={6}>
                        <TextField id="outlined-basic" label={this.props.fieldText} variant="outlined"
                                   value={this.state.value} onChange={this.handleChange}/>
                    </Grid>
                    <Grid item xs={6}>
                        <Button type="submit" variant="contained" color="primary" onClick={() => cashIn("u1", this.state.value)}>
                            {this.props.buttonText}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        );
    }
}