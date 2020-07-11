import React, {useState} from "react";
import {makeStyles} from '@material-ui/core/styles';

import {AppBar, Toolbar, Button, IconButton, Typography, TextField} from "@material-ui/core";
import {Grid, Paper} from "@material-ui/core";
import SettingsSystemDaydreamIcon from '@material-ui/icons/SettingsSystemDaydream';

import RequestsTable from "../components/RequestsTable";
import QueryStatusCard from "../components/QueryStatusCard";
import {QueryStatusButtonForm} from "../components/QueryStatusButtonForm";
import {GetQueryAnswer} from "../components/GetQueryAnswer";
import {CreateQueryForm} from "../components/CreateQueryForm";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    icon: {
        marginRight: theme.spacing(1)
    },
    content: {
        padding: theme.spacing(2)
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    demo: {
        backgroundColor: theme.palette.background.default,
    }
}));

export default function LandingView(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Grid container
                      direction="row"
                      justify="center"
                      alignItems="center">
                    <Grid item>
                        <Toolbar>
                            <Grid item>
                                <SettingsSystemDaydreamIcon className={classes.icon}/>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6" className={classes.title}>
                                    Data Consumer
                                </Typography>
                            </Grid>
                        </Toolbar>
                    </Grid>
                </Grid>
            </AppBar>

            <Grid container spacing={3} className={classes.content}>
                <Grid item xs={12} sm={6}>
                    <RequestsTable/>
                </Grid>
                <Grid container sm={6} spacing={3}>
                    <Grid item xs>
                        <QueryStatusButtonForm/>
                    </Grid>
                    <Grid item xs>
                        <GetQueryAnswer/>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                </Grid>
                <Grid container spacing={3} className={classes.content}
                      direction="row"
                      justify="center"
                      alignItems="center">
                    <CreateQueryForm/>
                </Grid>
            </Grid>
        </div>
    );
}