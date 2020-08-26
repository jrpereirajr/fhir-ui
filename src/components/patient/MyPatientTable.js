import React from 'react'
import PropTypes from 'prop-types'
import { lighten, makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
	Button,
  Tooltip,
  FormControlLabel,
} from '@material-ui/core'
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import PatientBanner from '../patient/PatientBanner'
import MyTableHeader from '../table/MyTableHeader'
import MyTableToolbar from '../table/MyTableToolbar'
import AllergyTable from '../allergy/AllergyTable'
import ConditionTable from '../condition/ConditionTable'
import ObservationTable from '../observation/ObservationTable'

const desc = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

const getSorting = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy)
}

const headCells = [
  {
    id: 'identifier',
    numeric: false,
    disablePadding: true,
    label: 'Patient ID',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Patient Name',
  },
  { id: 'dob', numeric: false, disablePadding: false, label: 'Date of Birth' },
  { id: 'gender', numeric: false, disablePadding: false, label: 'Gender' },
  { id: 'phone', numeric: false, disablePadding: false, label: 'Phone' },
  { id: 'language', numeric: false, disablePadding: false, label: 'Language' },
  {
    id: 'organization',
    numeric: false,
    disablePadding: false,
    label: 'Organization',
  },
]

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

const useStylesTab = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  }
}));

const MyPatientTable = ({
  patients = [],
  tableTitle,
  tableRowSize,
  tableHeight,
  stickyHeader,
  defaultRowsPerPage,
	onGetDetailsData = () => {}
}) => {
  const classes = useStyles()
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('patientId')
  const [selected, setSelected] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage || 5)

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
  }

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = patients.map(n => n.id)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event, row) => {
	  singleSelectHandler(event, row.id);
  }

  const singleSelectHandler = (event, name) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected = [name]
    setSelected(newSelected)
  }

  const multiSelectHandler = (event, name) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = name => selected.indexOf(name) !== -1

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, patients.length - page * rowsPerPage);

  const classesTab = useStylesTab();
  
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}
        style={
          tableHeight ? { maxHeight: tableHeight, overflow: 'auto' } : null
        }>
        <MyTableToolbar
          tableTitle={tableTitle}
        />
        <div className={classes.tableWrapper}>
          <Table
            className={classes.table}
            size={tableRowSize}
            stickyHeader={stickyHeader}
            aria-label={tableTitle || 'patient-table'}
          >
            <MyTableHeader
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={patients.length}
              headCells={headCells}
            />
            <TableBody>
              {stableSort(patients, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
									row.details = null;
                  return (
										<MyPatientTableRow row={row} onGetDetailsData={onGetDetailsData}></MyPatientTableRow>)
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={patients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'previous page',
          }}
          nextIconButtonProps={{
            'aria-label': 'next page',
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  )
}

MyPatientTable.propTypes = {
  patients: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableTitle: PropTypes.string,
  tableRowSize: PropTypes.string,
  tableHeight: PropTypes.number,
  stickyHeader: PropTypes.string,
  defaultRowsPerPage: PropTypes.number,
  onGetDetailsData: PropTypes.func,
}

class MyPatientTableRow extends React.Component {
	
  constructor(props) {
    super(props);
    this.state = {
			isShowDetails: false,
			value: 0,
			allergies: [],
			conditions: [],
			observations: []
		};
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }
	
	getDetailsHandler() {
		if (this.props.onGetDetailsData) {
			this.props.onGetDetailsData(this.props.row, 'Patient').then(data => {
				this.setState({isShowDetails: !this.props.row.details ? true : !this.state.isShowDetails});
				this.props.row.details = data[0] || {};
				this.handleChangeTab(null, 0);
			});
		}
	}
	
	handleChangeTab(event, newValue) {
		let promise = Promise.resolve();
		switch(newValue) {
			case 0:
				promise = this.getAllergiesHandler();
				break;
			case 1:
				promise = this.getConditionsHandler();
				break;
			case 2:
				promise = this.getObservationsHandler();
				break;
		}
		promise.then(() => this.setState({value: newValue}));
	};
									
	getAllergiesHandler() {
		if (this.props.onGetDetailsData) {
			return this.props.onGetDetailsData(this.props.row, 'AllergyIntolerance').then(data => {
				this.state.allergies = data || [];
			});
		}
		return Promise.resolve();
	}
	
	getConditionsHandler(){
		if (this.props.onGetDetailsData) {
			return this.props.onGetDetailsData(this.props.row, 'Conditions').then(data => {
				this.state.conditions = data || [];
			});
		}
		return Promise.resolve();
	}
	
	getObservationsHandler() {
		if (this.props.onGetDetailsData) {
			return this.props.onGetDetailsData(this.props.row, 'Observations').then(data => {
				this.state.observations = data || [];
			});
		}
		return Promise.resolve();
	}
		
  getClassesTab() {
		return useStylesTab();
	}

  render() {
    return (
										<React.Fragment>
											<TableRow
												hover
												tabIndex={-1}
												key={this.props.row.id}
											>
												<TableCell>
													<Button onClick={() => this.getDetailsHandler()}>{!this.state.isShowDetails || !this.props.row.details ? 'More' : 'Less'}</Button>
													{this.props.row.identifier[0].value}
												</TableCell>
												<TableCell
												component="th"
												id={`enhanced-table-patient-${this.props.row.id}`}
												scope="row"
												padding="none"
												>
												{this.props.row.name[0].text
													? this.props.row.name[0].text
													: `${this.props.row.name[0].given.join(' ')} ${
														this.props.row.name[0].family
													}`}
												</TableCell>
												<TableCell>{this.props.row.birthDate}</TableCell>
												<TableCell>{this.props.row.gender}</TableCell>
												<TableCell>
												{Array.isArray(this.props.row.telecom) &&
													this.props.row.telecom
													.map(el => (el.system === 'phone' ? el.value : ''))
													.filter(el => !!el)}
												</TableCell>
												<TableCell>
												{Array.isArray(this.props.row.communication) &&
													this.props.row.communication[0].language.text}
												</TableCell>
												<TableCell>
												{this.props.row.managingOrganization &&
													this.props.row.managingOrganization.reference}
												</TableCell>
											</TableRow>
											{ this.state.isShowDetails && this.props.row.details ? 
												<TableRow>
													<TableCell colSpan={7}>
														<PatientBanner patient={this.props.row.details || {}}/>
														<div>
															<AppBar position="static">
																<Tabs
																	value={this.state.value}
																	onChange={(event, newValue) => this.handleChangeTab(event, newValue)}
																	aria-label="simple tabs example"
																>
																	<Tab label="Allergy intolerance" {...a11yProps(0)} />
																	<Tab label="Conditions" {...a11yProps(1)} />
																	<Tab label="Observations" {...a11yProps(2)} />
																</Tabs>
															</AppBar>
															<TabPanel value={this.state.value} index={0}>
																{ this.state.allergies && this.state.allergies.length ? 
																<AllergyTable 
																	allergies={this.state.allergies}
																	tableTitle="Allergy List"
																	tableRowSize="small"
																	hideActionIcons={true}
																	hideCheckboxes={true}
																/>
																: "No alergies found"
																}
															</TabPanel>
															<TabPanel value={this.state.value} index={1}>
																{ this.state.allergies && this.state.allergies.length ? 
																<ConditionTable
																	conditions={this.state.conditions}
																	tableTitle="Condition List"
																	tableRowSize="medium"
																	hideDevices={true}
																	hideCheckboxes={true}
																	hideRecordedDate={true}
																	hideEncounter={true}
																	hideVerificationStatus={true}
																	stickyHeader={true}
																	tableHeight={360}
																/>
																: "No conditions found"
																}
															</TabPanel>
															<TabPanel value={this.state.value} index={2}>
																{ this.state.observations && this.state.observations.length ? 
																<ObservationTable
																	observations={this.state.observations}
																	tableTitle="Observation List"
																	tableRowSize="medium"
																	hideDevices={true}
																	hideCheckboxes={true}
																	stickyHeader={true}
																	tableHeight={360}
																/>
																: "No observations found"
																}
															</TabPanel>
														</div>
													</TableCell>
												</TableRow> 
												: null
											}
										</React.Fragment>
    );
  }
}

export default MyPatientTable
