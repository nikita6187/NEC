import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {getQueryData} from "../services/QueryDataService";
import {acceptQuery} from "../services/AcceptQueryService";

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

export default function CardAcceptQuery(props) {
    const classes = useStyles();
    const [id, setId] = useState("");
    const [query_text, setText] = useState("");
    const bull = <span className={classes.bullet}>•</span>;

    useEffect(() => {
        const interval = setInterval(() => handleTick(), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleTick = () => {
        getQueryData()
            .then(response => {
                setId(response.data.query_id);
                setText(response.data.query_text);
            });
    };

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Query Information
                </Typography>
                <Typography variant="h5" component="h2">
                    Query Id: {id}
                </Typography>

                <Typography variant="body2" component="p">
                    <br/>
                    {query_text}
                </Typography>
            </CardContent>
            <CardActions>
                <Button type="submit" variant="contained" color="primary" onClick={() => acceptQuery("u1", id)}>
                    {props.buttonText}
                </Button>
            </CardActions>

        </Card>
    );
}