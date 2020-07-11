import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {getQueryData} from "../services/QueryDataService";
import {acceptQuery} from "../services/AcceptQueryService";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import List from "@material-ui/core/List";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {InputButtonForm} from "./InputButtonForm";

const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});
function generate(element) {
    return [0, 1, 2].map((value) =>
        React.cloneElement(element, {
            key: value,
        }),
    );
}
export default function CardAcceptQuery(props) {
    const classes = useStyles();
    const bull = <span className={classes.bullet}>•</span>;


    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Rewards:
                </Typography>
                <Grid item>
                    <div className={classes.demo}>
                        <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <AddCircleOutlineIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="r1. RNV Single Ticket"
                                        secondary='20 coins'
                                    />
                                </ListItem>
                            <ListItem>
                                    <ListItemIcon>
                                        <AddCircleOutlineIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="r2. RNV Day Ticket"
                                        secondary='55 coins'
                                    />
                                </ListItem>
                            <ListItem>
                                    <ListItemIcon>
                                        <AddCircleOutlineIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="r3. Kurpfälzisches Museum - Entry Ticket"
                                        secondary='25 coins'
                                    />
                                </ListItem>

                        </List>
                    </div>
                </Grid>
            </CardContent>
                <CardActions >
                    <InputButtonForm buttonText={"cashin reward"} fieldText={"Reward Id"}/>

                </CardActions>

        </Card>
    );
}