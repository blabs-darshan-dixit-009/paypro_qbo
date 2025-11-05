import { Employee, TimeEntry, PayrollRun, PayStub, Activity, ChartOfAccount, QuickBooksConnection } from "@/types";

export const mockEmployees: Employee[] = [
  {
    id: "1",
    qbEmployeeId: "55",
    firstName: "John",
    lastName: "Doe",
    displayName: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    hourlyRate: 18.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-01-15",
    releasedDate: null
  },
  {
    id: "2",
    qbEmployeeId: "56",
    firstName: "Jane",
    lastName: "Smith",
    displayName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 234-5678",
    hourlyRate: 19.00,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-02-20",
    releasedDate: null
  },
  {
    id: "3",
    qbEmployeeId: "57",
    firstName: "Michael",
    lastName: "Johnson",
    displayName: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 345-6789",
    hourlyRate: 17.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-03-10",
    releasedDate: null
  },
  {
    id: "4",
    qbEmployeeId: "58",
    firstName: "Sarah",
    lastName: "Williams",
    displayName: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "(555) 456-7890",
    hourlyRate: 20.00,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 50,
    isActive: true,
    hiredDate: "2023-01-25",
    releasedDate: null
  },
  {
    id: "5",
    qbEmployeeId: "59",
    firstName: "David",
    lastName: "Brown",
    displayName: "David Brown",
    email: "david.brown@example.com",
    phone: "(555) 567-8901",
    hourlyRate: 16.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-04-15",
    releasedDate: null
  },
  {
    id: "6",
    qbEmployeeId: "60",
    firstName: "Emily",
    lastName: "Davis",
    displayName: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "(555) 678-9012",
    hourlyRate: 18.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-05-20",
    releasedDate: null
  },
  {
    id: "7",
    qbEmployeeId: "61",
    firstName: "Robert",
    lastName: "Miller",
    displayName: "Robert Miller",
    email: "robert.miller@example.com",
    phone: "(555) 789-0123",
    hourlyRate: 21.00,
    filingStatus: "married",
    allowances: 3,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2022-11-10",
    releasedDate: null
  },
  {
    id: "8",
    qbEmployeeId: "62",
    firstName: "Jennifer",
    lastName: "Wilson",
    displayName: "Jennifer Wilson",
    email: "jennifer.wilson@example.com",
    phone: "(555) 890-1234",
    hourlyRate: 17.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-06-01",
    releasedDate: null
  },
  {
    id: "9",
    qbEmployeeId: "63",
    firstName: "William",
    lastName: "Moore",
    displayName: "William Moore",
    email: "william.moore@example.com",
    phone: "(555) 901-2345",
    hourlyRate: 19.50,
    filingStatus: "head_of_household",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-02-15",
    releasedDate: null
  },
  {
    id: "10",
    qbEmployeeId: "64",
    firstName: "Lisa",
    lastName: "Taylor",
    displayName: "Lisa Taylor",
    email: "lisa.taylor@example.com",
    phone: "(555) 012-3456",
    hourlyRate: 18.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-03-20",
    releasedDate: null
  },
  {
    id: "11",
    qbEmployeeId: "65",
    firstName: "James",
    lastName: "Anderson",
    displayName: "James Anderson",
    email: "james.anderson@example.com",
    phone: "(555) 123-4568",
    hourlyRate: 22.00,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2022-10-05",
    releasedDate: null
  },
  {
    id: "12",
    qbEmployeeId: "66",
    firstName: "Mary",
    lastName: "Thomas",
    displayName: "Mary Thomas",
    email: "mary.thomas@example.com",
    phone: "(555) 234-5679",
    hourlyRate: 17.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-04-10",
    releasedDate: null
  },
  {
    id: "13",
    qbEmployeeId: "67",
    firstName: "Charles",
    lastName: "Jackson",
    displayName: "Charles Jackson",
    email: "charles.jackson@example.com",
    phone: "(555) 345-6780",
    hourlyRate: 20.50,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-01-08",
    releasedDate: null
  },
  {
    id: "14",
    qbEmployeeId: "68",
    firstName: "Patricia",
    lastName: "White",
    displayName: "Patricia White",
    email: "patricia.white@example.com",
    phone: "(555) 456-7891",
    hourlyRate: 16.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-05-15",
    releasedDate: null
  },
  {
    id: "15",
    qbEmployeeId: "69",
    firstName: "Christopher",
    lastName: "Harris",
    displayName: "Christopher Harris",
    email: "christopher.harris@example.com",
    phone: "(555) 567-8902",
    hourlyRate: 19.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-02-28",
    releasedDate: null
  },
  {
    id: "16",
    qbEmployeeId: "70",
    firstName: "Nancy",
    lastName: "Martin",
    displayName: "Nancy Martin",
    email: "nancy.martin@example.com",
    phone: "(555) 678-9013",
    hourlyRate: 18.00,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-03-12",
    releasedDate: null
  },
  {
    id: "17",
    qbEmployeeId: "71",
    firstName: "Daniel",
    lastName: "Thompson",
    displayName: "Daniel Thompson",
    email: "daniel.thompson@example.com",
    phone: "(555) 789-0124",
    hourlyRate: 21.50,
    filingStatus: "married",
    allowances: 3,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2022-12-01",
    releasedDate: null
  },
  {
    id: "18",
    qbEmployeeId: "72",
    firstName: "Betty",
    lastName: "Garcia",
    displayName: "Betty Garcia",
    email: "betty.garcia@example.com",
    phone: "(555) 890-1235",
    hourlyRate: 17.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-06-20",
    releasedDate: null
  },
  {
    id: "19",
    qbEmployeeId: "73",
    firstName: "Matthew",
    lastName: "Martinez",
    displayName: "Matthew Martinez",
    email: "matthew.martinez@example.com",
    phone: "(555) 901-2346",
    hourlyRate: 20.00,
    filingStatus: "head_of_household",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-01-30",
    releasedDate: null
  },
  {
    id: "20",
    qbEmployeeId: "74",
    firstName: "Sandra",
    lastName: "Robinson",
    displayName: "Sandra Robinson",
    email: "sandra.robinson@example.com",
    phone: "(555) 012-3457",
    hourlyRate: 18.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-04-05",
    releasedDate: null
  },
  {
    id: "21",
    qbEmployeeId: "75",
    firstName: "Anthony",
    lastName: "Clark",
    displayName: "Anthony Clark",
    email: "anthony.clark@example.com",
    phone: "(555) 123-4569",
    hourlyRate: 19.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-02-10",
    releasedDate: null
  },
  {
    id: "22",
    qbEmployeeId: "76",
    firstName: "Donna",
    lastName: "Rodriguez",
    displayName: "Donna Rodriguez",
    email: "donna.rodriguez@example.com",
    phone: "(555) 234-5680",
    hourlyRate: 17.50,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-05-01",
    releasedDate: null
  },
  {
    id: "23",
    qbEmployeeId: "77",
    firstName: "Mark",
    lastName: "Lewis",
    displayName: "Mark Lewis",
    email: "mark.lewis@example.com",
    phone: "(555) 345-6781",
    hourlyRate: 22.50,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2022-09-15",
    releasedDate: null
  },
  {
    id: "24",
    qbEmployeeId: "78",
    firstName: "Carol",
    lastName: "Lee",
    displayName: "Carol Lee",
    email: "carol.lee@example.com",
    phone: "(555) 456-7892",
    hourlyRate: 16.50,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-06-10",
    releasedDate: null
  },
  {
    id: "25",
    qbEmployeeId: "79",
    firstName: "Steven",
    lastName: "Walker",
    displayName: "Steven Walker",
    email: "steven.walker@example.com",
    phone: "(555) 567-8903",
    hourlyRate: 19.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-03-05",
    releasedDate: null
  },
  {
    id: "26",
    qbEmployeeId: "80",
    firstName: "Michelle",
    lastName: "Hall",
    displayName: "Michelle Hall",
    email: "michelle.hall@example.com",
    phone: "(555) 678-9014",
    hourlyRate: 18.00,
    filingStatus: "married",
    allowances: 2,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-04-20",
    releasedDate: null
  },
  {
    id: "27",
    qbEmployeeId: "81",
    firstName: "Kevin",
    lastName: "Allen",
    displayName: "Kevin Allen",
    email: "kevin.allen@example.com",
    phone: "(555) 789-0125",
    hourlyRate: 20.50,
    filingStatus: "married",
    allowances: 3,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2022-11-20",
    releasedDate: null
  },
  {
    id: "28",
    qbEmployeeId: "82",
    firstName: "Laura",
    lastName: "Young",
    displayName: "Laura Young",
    email: "laura.young@example.com",
    phone: "(555) 890-1236",
    hourlyRate: 17.00,
    filingStatus: "single",
    allowances: 1,
    additionalWithholding: 0,
    isActive: true,
    hiredDate: "2023-07-01",
    releasedDate: null
  }
];

// Generate time entries for the current pay period (Dec 1-14, 2024)
export const mockTimeEntries: TimeEntry[] = mockEmployees.flatMap(employee => {
  const entries: TimeEntry[] = [];
  // Generate 10 workdays (2 weeks, Mon-Fri)
  for (let day = 1; day <= 14; day++) {
    if (day % 7 !== 0 && day % 7 !== 6) { // Skip weekends
      const regularHours = 7.5 + Math.random() * 2; // 7.5-9.5 hours
      const overtimeHours = Math.random() > 0.8 ? Math.random() * 2 : 0; // Occasional overtime
      
      entries.push({
        id: `${employee.id}-${day}-regular`,
        employeeId: employee.id,
        date: `2024-12-${String(day).padStart(2, '0')}`,
        hours: Math.round(regularHours * 10) / 10,
        type: 'regular'
      });

      if (overtimeHours > 0) {
        entries.push({
          id: `${employee.id}-${day}-overtime`,
          employeeId: employee.id,
          date: `2024-12-${String(day).padStart(2, '0')}`,
          hours: Math.round(overtimeHours * 10) / 10,
          type: 'overtime'
        });
      }
    }
  }
  return entries;
});

// Calculate totals for the current payroll run
const calculatePayrollTotals = () => {
  let totalGross = 0;
  let totalFederal = 0;
  let totalState = 0;
  let totalSS = 0;
  let totalMedicare = 0;

  mockEmployees.forEach(employee => {
    const employeeTimeEntries = mockTimeEntries.filter(te => te.employeeId === employee.id);
    const regularHours = employeeTimeEntries
      .filter(te => te.type === 'regular')
      .reduce((sum, te) => sum + te.hours, 0);
    const overtimeHours = employeeTimeEntries
      .filter(te => te.type === 'overtime')
      .reduce((sum, te) => sum + te.hours, 0);

    const regularPay = regularHours * employee.hourlyRate;
    const overtimePay = overtimeHours * employee.hourlyRate * 1.5;
    const grossPay = regularPay + overtimePay;

    // Calculate deductions (simplified)
    const federalTax = grossPay * 0.15;
    const stateTax = grossPay * 0.05;
    const socialSecurity = grossPay * 0.062;
    const medicare = grossPay * 0.0145;

    totalGross += grossPay;
    totalFederal += federalTax;
    totalState += stateTax;
    totalSS += socialSecurity;
    totalMedicare += medicare;
  });

  return {
    totalGrossPay: Math.round(totalGross * 100) / 100,
    totalNetPay: Math.round((totalGross - totalFederal - totalState - totalSS - totalMedicare) * 100) / 100,
    totalFederalTax: Math.round(totalFederal * 100) / 100,
    totalStateTax: Math.round(totalState * 100) / 100,
    totalSocialSecurity: Math.round(totalSS * 100) / 100,
    totalMedicare: Math.round(totalMedicare * 100) / 100
  };
};

const totals = calculatePayrollTotals();

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: "1",
    startDate: "2024-12-01",
    endDate: "2024-12-14",
    processDate: "2024-12-15",
    status: "ready",
    employeeCount: 28,
    ...totals
  },
  {
    id: "2",
    startDate: "2024-11-16",
    endDate: "2024-11-30",
    processDate: "2024-12-01",
    status: "synced",
    employeeCount: 28,
    totalGrossPay: 23890.00,
    totalNetPay: 18012.00,
    totalFederalTax: 3583.50,
    totalStateTax: 1194.50,
    totalSocialSecurity: 1481.18,
    totalMedicare: 346.41
  },
  {
    id: "3",
    startDate: "2024-11-01",
    endDate: "2024-11-15",
    processDate: "2024-11-16",
    status: "synced",
    employeeCount: 27,
    totalGrossPay: 22450.00,
    totalNetPay: 16930.00,
    totalFederalTax: 3367.50,
    totalStateTax: 1122.50,
    totalSocialSecurity: 1391.90,
    totalMedicare: 325.53
  }
];

// Generate pay stubs for current payroll run
export const mockPayStubs: PayStub[] = mockEmployees.map((employee, index) => {
  const employeeTimeEntries = mockTimeEntries.filter(te => te.employeeId === employee.id);
  const regularHours = employeeTimeEntries
    .filter(te => te.type === 'regular')
    .reduce((sum, te) => sum + te.hours, 0);
  const overtimeHours = employeeTimeEntries
    .filter(te => te.type === 'overtime')
    .reduce((sum, te) => sum + te.hours, 0);

  const regularPay = regularHours * employee.hourlyRate;
  const overtimePay = overtimeHours * employee.hourlyRate * 1.5;
  const grossPay = regularPay + overtimePay;

  // Calculate deductions (simplified)
  const federalTax = grossPay * 0.15;
  const stateTax = grossPay * 0.05;
  const socialSecurity = grossPay * 0.062;
  const medicare = grossPay * 0.0145;
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare;
  const netPay = grossPay - totalDeductions;

  return {
    id: `stub-${employee.id}`,
    employeeId: employee.id,
    payrollRunId: "1",
    regularHours: Math.round(regularHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
    hourlyRate: employee.hourlyRate,
    regularPay: Math.round(regularPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    grossPay: Math.round(grossPay * 100) / 100,
    federalTax: Math.round(federalTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100
  };
});

export const mockActivities: Activity[] = [
  {
    id: "1",
    type: "payroll_processed",
    description: "Payroll processed for Nov 16-30, 2024",
    timestamp: "2024-12-01T10:30:00",
    user: "Admin User"
  },
  {
    id: "2",
    type: "sync_completed",
    description: "QuickBooks sync completed successfully",
    timestamp: "2024-12-01T10:32:00",
    user: "System"
  },
  {
    id: "3",
    type: "employee_added",
    description: "New employee added: Laura Young",
    timestamp: "2024-12-01T09:15:00",
    user: "Admin User"
  },
  {
    id: "4",
    type: "settings_updated",
    description: "Tax settings updated for 2024",
    timestamp: "2024-11-30T14:20:00",
    user: "Admin User"
  },
  {
    id: "5",
    type: "payroll_processed",
    description: "Payroll processed for Nov 1-15, 2024",
    timestamp: "2024-11-16T10:30:00",
    user: "Admin User"
  }
];

export const mockChartOfAccounts: ChartOfAccount[] = [
  { id: "1", name: "Checking Account", type: "Bank", number: "1000" },
  { id: "2", name: "Payroll Expenses", type: "Expense", number: "6000" },
  { id: "3", name: "Payroll Tax Expense", type: "Expense", number: "6100" },
  { id: "4", name: "Federal Tax Payable", type: "Liability", number: "2100" },
  { id: "5", name: "State Tax Payable", type: "Liability", number: "2110" },
  { id: "6", name: "FICA Payable", type: "Liability", number: "2120" },
  { id: "7", name: "Medicare Payable", type: "Liability", number: "2130" },
  { id: "8", name: "Wages Payable", type: "Liability", number: "2000" }
];

export const mockQuickBooksConnection: QuickBooksConnection = {
  isConnected: true,
  companyName: "ABC Restaurant Inc.",
  connectedSince: "2024-11-01",
  lastSync: "2024-12-05T08:30:00",
  realmId: "123456789"
};

