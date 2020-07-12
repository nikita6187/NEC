import React, {useState, useEffect} from 'react';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import {getQueries} from "../services/RequestsQueryService";

const columns = [
    {id: 'query_id', label: 'Query Id', minWidth: 10},
    {id: 'stage', label: 'Stage', minWidth: 10},
    {id: 'wallet_id', label: 'Wallet Id', minWidth: 10},
    {id: 'max_budget', label: 'Max Budget', minWidth: 10},
    {id: 'min_users', label: 'Min Users', minWidth: 10},
    {id: 'num_approve', label: 'Approvals', minWidth: 10,},
    {id: 'num_disapprove', label: 'Disapprovals', minWidth: 10,},
    {id: 'num_majority', label: 'Majority', minWidth: 10,},
    {id: 'query_as_text', label: 'Query as Text', minWidth: 10},
];

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: `#512DA8`,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

// function createData(entry) {
//   [query_id, stage, wallet_id, max_budget, min_users, num_approve, num_disapprove, num_majority, query_as_text] = entry;

//   return { query_id, code, population, size, density };
// }

export default function QueryTable() {
    const classes = useStyles();

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => handleTick(), 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);


    const handleTick = () => {
        getQueries()
            .then(response => {
                setRows(response.data);
            });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper className={classes.root}>
            <TableContainer className={classes.container}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{minWidth: column.minWidth}}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                                    {columns.map((column, j) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={j}>
                                                {column.format && typeof value === 'number' ? column.format(value) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[3, 5, 10]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
