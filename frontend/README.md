# PayPro - Payroll Management System

A modern, QuickBooks-integrated payroll processing system designed for restaurants and small businesses. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Authentication
- ✅ Modern login page with form validation
- ✅ Mock authentication (any credentials work in demo)
- ✅ Session management with redirect logic

### Dashboard
- ✅ Key metrics cards (Next Payroll, Employees, Gross Amount, Hours/Week)
- ✅ Payroll summary with detailed breakdown
- ✅ Recent activity timeline
- ✅ Employee hours visualization (top 10)
- ✅ QuickBooks connection status

### Employee Management
- ✅ Employee list with search and filters
- ✅ Add new employee dialog with full form validation
- ✅ Employee cards with detailed information
- ✅ Individual employee detail pages with tabs:
  - Overview (personal, tax, and payment info)
  - Time entries history
  - Payroll history
- ✅ Sync from QuickBooks button
- ✅ Edit and deactivate employee actions

### Payroll Processing
- ✅ Current pay period summary card
- ✅ Time entries table with sorting
- ✅ Import time entries from QuickBooks
- ✅ **4-Step Process Payroll Wizard:**
  1. Review Time Entries
  2. Preview Calculations (with detailed breakdown)
  3. Confirm & Process (with employer taxes)
  4. Success screen with actions
- ✅ Payroll history with expandable details
- ✅ Professional pay stub preview with:
  - Company header
  - Employee information
  - Earnings breakdown
  - Deductions details
  - Year-to-date summary
  - Download, Email, and Print options

### Settings
- ✅ **QuickBooks Connection** tab:
  - Connection status
  - Company information
  - Last sync timestamp
  - Sync and disconnect actions
- ✅ **Account Mapping** tab:
  - Map PayPro accounts to QuickBooks Chart of Accounts
  - Payroll expense, tax, and liability accounts
- ✅ **Tax Settings** tab:
  - State selection
  - Federal tax year
  - FICA rates display
  - Update tax tables
- ✅ **Pay Period Settings** tab:
  - Pay frequency configuration
  - First pay period date
  - Process day selection
- ✅ **Company Info** tab:
  - Company details
  - Contact information
  - Logo upload

## 🎨 Design System

### Colors
- **Primary**: Emerald green (`emerald-600`)
- **Secondary**: Slate gray
- **Accent**: Blue
- **Status Colors**: 
  - Success: Green
  - Warning: Yellow
  - Error: Red
  - Info: Blue

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Consistent scale from 12px to 32px
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- **Cards**: White background, subtle shadows, rounded corners
- **Buttons**: Rounded, clear hover states, loading states
- **Forms**: Proper validation, error messages, placeholders
- **Tables**: Zebra striping, hover highlights, sortable columns
- **Badges**: Color-coded status indicators

## 📊 Mock Data

The application includes comprehensive mock data:
- **28 Employees** with realistic information
- **Time Entries** for 2-week pay period (Dec 1-14, 2024)
- **3 Payroll Runs** with complete calculations
- **Pay Stubs** for all employees
- **Activity Log** with recent actions
- **QuickBooks Connection** status
- **Chart of Accounts** for account mapping

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Forms**: react-hook-form + zod (ready to use)
- **Date Handling**: date-fns
- **State Management**: React hooks (useState, useEffect)

## 📁 Project Structure

```
PayPro/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── payroll/
│   │   │   ├── page.tsx
│   │   │   ├── process/
│   │   │   │   └── page.tsx
│   │   │   └── history/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   ├── employees/
│   ├── payroll/
│   ├── settings/
│   └── layout/
├── lib/
│   ├── utils.ts
│   └── mock-data.ts
├── types/
│   └── index.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

4. **Login:**
Use any email and password to login (authentication is mocked)

## 🎯 Key Features Demo Flow

### 1. Dashboard Overview
- View key metrics and current payroll status
- See recent activity and employee hours
- Quick access to process payroll

### 2. Employee Management
- Browse all employees with search/filter
- Add new employees with complete tax information
- View individual employee details and history

### 3. Process Payroll
Navigate through the 4-step wizard:
1. **Review**: Verify all time entries
2. **Preview**: See calculations for each employee
3. **Confirm**: Review totals and employer taxes
4. **Complete**: Success confirmation with next actions

### 4. Settings Configuration
- Connect to QuickBooks
- Map accounts for journal entries
- Configure tax settings
- Set pay period schedule

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: Single column, collapsible sidebar
- **Tablet**: 2-column layouts
- **Desktop**: 3-4 column layouts, full sidebar

## 🔒 Security Notes

This is a **frontend POC** with mock authentication:
- All data is client-side mock data
- No backend API calls
- Passwords are not validated
- QuickBooks integration is simulated

For production, implement:
- Real authentication with JWT/OAuth
- Backend API with proper validation
- Secure QuickBooks OAuth flow
- Database for persistent data
- Role-based access control

## 🎨 Design Philosophy

- **Clean & Modern**: Minimalist design with focus on usability
- **Professional**: Suitable for business environments
- **Intuitive**: Clear navigation and workflows
- **Fast**: Optimized performance with Next.js 14
- **Accessible**: ARIA labels, keyboard navigation, focus indicators

## 📝 Mock Credentials

Since this is a demo, you can use any credentials to login:
- Email: `admin@paypro.com` (or any email)
- Password: `password` (or any password)

## 🔮 Future Enhancements

Backend integration would add:
- Real QuickBooks OAuth integration
- Database persistence
- Email notifications
- PDF generation
- Advanced reporting
- Multi-company support
- Employee self-service portal
- Mobile app
- Automated tax calculations
- Direct deposit integration

## 📄 License

This is a proof-of-concept project for demonstration purposes.

## 🤝 Contributing

This is a demo project. For production use, ensure proper security measures and backend integration.

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS

