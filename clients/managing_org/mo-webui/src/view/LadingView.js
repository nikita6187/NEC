import React, {useState} from "react";
import { makeStyles } from '@material-ui/core/styles';

import {AppBar, Toolbar, Button, IconButton, Typography} from "@material-ui/core";
import {Grid, Paper} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';

import QueryTable from "../components/QueryTable";

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
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title} align='center'>
                <AccountBalanceIcon className={classes.icon}/>
                Managing Organisation
              </Typography>
              <Button color="inherit">Login</Button>
            </Toolbar>
          </AppBar>
          <Grid container spacing={3} className={classes.content}> 
            <Grid item xs={12}>
                <QueryTable />
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.paper}>xs=6</Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.paper}>xs=6</Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.paper}>xs=6</Paper>
            </Grid>
          </Grid>
        </div>
      );
}