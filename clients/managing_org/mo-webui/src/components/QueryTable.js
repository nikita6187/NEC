import React, {useState, useEffect} from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import {getQueries} from "../services/QueryTableService";

const columns = [
  { id: 'query_id', label: 'Query Id', minWidth: 100 },
  { id: 'stage', label: 'Stage', minWidth: 100 },
  { id: 'wallet_id', label: 'Wallet Id', minWidth: 100 },
  { id: 'max_budget', label: 'Max Budget', minWidth: 100 },
  { id: 'min_users', label: 'Min Users', minWidth: 100 },
  { id: 'num_approve', label: 'Approvals', minWidth: 100, },
  { id: 'num_disapprove', label: 'Disapprovals', minWidth: 100, },
  { id: 'num_majority', label: 'Majority', minWidth: 100, },
  { id: 'query_as_text', label: 'Query as Text', minWidth: 100 },
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
      backgroundColor: theme.palette.common.black,
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

  const [rows, setRows] = useState([
            {
                query_id: 'q1',
                query_as_text: 'ALL',
                num_approve: 0,
                num_disapprove: 0,
                min_users: 2,
                stage: 1,
                num_majority: 1,
                max_budget: 10,
                wallet_id: 'w1',
                fail_message: '',
            },{
                query_id: 'q2',
                query_as_text: 'ALLFGHJN',
                num_approve: 0,
                num_disapprove: 0,
                min_users: 2,
                stage: 1,
                num_majority: 1,
                max_budget: 10,
                wallet_id: 'w1',
                fail_message: '',
            },{
                query_id: 'q4',
                query_as_text: 'TYYTFJF',
                num_approve: 0,
                num_disapprove: 0,
                min_users: 2,
                stage: 3,
                num_majority: 1,
                max_budget: 100,
                wallet_id: 'w1',
                fail_message: '',
            },{
                query_id: 'q4',
                query_as_text: 'TYYTFJF',
                num_approve: 0,
                num_disapprove: 0,
                min_users: 2,
                stage: 3,
                num_majority: 1,
                max_budget: 100,
                wallet_id: 'w1',
                fail_message: '',
            },
        ]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  useEffect(() => {
    handleTick();
    const timer = setInterval(handleTick, 5000);
    return () => clearInterval(timer);
  });

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
                  style={{ minWidth: column.minWidth }}
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
