import React from 'react';
import {Button, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import {createQuery, getQueryStatus} from "../services/ApiService";


export class CreateQueryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {query: '', minUsers: "", maxBudget: ""};
        this.handleQueryChange = this.handleQueryChange.bind(this);
        this.handleUsersChange = this.handleUsersChange.bind(this);
        this.handleBudgetChange = this.handleBudgetChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleQueryChange(event) {
        this.setState({query: event.target.value});
    }

    handleUsersChange(event) {
        this.setState({minUsers: event.target.value});
    }

    handleBudgetChange(event) {
        this.setState({maxBudget: event.target.value});
    }

    handleSubmit(event) {
        createQuery(this.state.query, this.state.minUsers, this.state.maxBudget)
        event.preventDefault();
    }

    render() {
        return (
            <Grid container spacing={3}
                  direction="row"
                  justify="center"
                  alignItems="center">
                <Grid item>
                    <form noValidate autoComplete="off">
                        <div>
                            <TextField required id="standard-required" label="Query"
                                       value={this.state.value} onChange={this.handleQueryChange}/>
                            <TextField required id="standard-required" label="Min. Users"
                                       value={this.state.value} onChange={this.handleUsersChange}/>
                            <TextField required id="standard-required" label="Max. Budget"
                                       value={this.state.value} onChange={this.handleBudgetChange}/>
                        </div>
                    </form>
                </Grid>
                <Grid item>
                    <Button type="submit" variant="contained" color="primary" onClick={() =>
                        createQuery(this.state.query, this.state.minUsers, this.state.maxBudget)}>
                        {"Create Query"}
                    </Button>
                </Grid>
            </Grid>

        );
    }
}