import React from 'react';
import {Button, TextField} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import {getQueryAnswer, getQueryStatus} from "../services/ApiService";
import Card from "@material-ui/core/Card/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions/CardActions";
import {makeStyles} from "@material-ui/core/styles";


export class GetQueryAnswer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: '', qAnswer: ''};
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
            <Card>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        Query Answer:
                    </Typography>
                    <Typography variant="body2" component="p">
                        <br/>
                        {this.state.qAnswer === "" ? " " : "Answer: " + this.state.qAnswer}
                    </Typography>

                </CardContent>
                <CardActions>

                    <form onSubmit={this.handleSubmit}>
                        <Grid container direction="row"
                              justify="center"
                              alignItems="center"
                              spacing={2}>
                            <Grid item xs={6}>
                                <TextField id="outlined-basic" label={"Query Id"} variant="outlined"
                                           value={this.state.value} onChange={this.handleChange}/>
                            </Grid>
                            <Grid item xs={6}>
                                <Button type="submit" variant="contained" color="secondary"
                                        onClick={() => getQueryAnswer(this.state.value)
                                            .then(response => {
                                                this.setState({qAnswer: response.data.data});
                                            })}>
                                    {"Get Query Answer"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>


                </CardActions>

            </Card>
        );
    }
}