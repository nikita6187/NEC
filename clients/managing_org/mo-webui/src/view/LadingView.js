import React, {useState} from "react";
import { makeStyles } from '@material-ui/core/styles';

import {AppBar, Toolbar, Button, IconButton, Typography, TextField} from "@material-ui/core";
import {Grid, Paper} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';

import QueryTable from "../components/QueryTable";
import RequestsTable from "../components/RequestsTable";
import {InputButtonForm} from "../components/InputButtonForm";

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
            <Grid item xs={12} sm={6}>
                <RequestsTable/>
            </Grid>
              <Grid container sm={6} spacing={3}>
            <Grid item xs>
                <InputButtonForm  buttonText="Ask users" fieldText="Query Id"/>
            </Grid>
            <Grid item xs>
                <InputButtonForm  buttonText="Notify users" fieldText="Query Id"/>
            </Grid>
              </Grid>
          </Grid>
        </div>
      );
}