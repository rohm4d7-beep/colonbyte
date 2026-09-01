import { NavLink, Feature, AIFeature, PricingPlan, ProductFact, FAQ } from '@/types'

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export const FEATURES: Feature[] = [
  {
    icon: 'Users',
    title: 'Student Management',
    description: 'Manage student profiles, documents, and records with powerful search and filtering.',
  },
  {
    icon: 'BedDouble',
    title: 'Room Allocation',
    description: 'Smart bed and room assignment with visual floor plans and occupancy tracking.',
  },
  {
    icon: 'CreditCard',
    title: 'Finance & Payments',
    description: 'Automated fee collection, invoicing, and financial reporting in one place.',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Mess Management',
    description: 'Plan menus, track attendance, and manage meal schedules efficiently.',
  },
  {
    icon: 'Wrench',
    title: 'Maintenance',
    description: 'Log, assign, and resolve maintenance requests with real-time status updates.',
  },
  {
    icon: 'UserCheck',
    title: 'Visitors',
    description: 'Digital visitor log with approval workflows and access control.',
  },
  {
    icon: 'BarChart3',
    title: 'Reports',
    description: 'Comprehensive reports on occupancy, revenue, and operations at a glance.',
  },
  {
    icon: 'TrendingUp',
    title: 'Analytics',
    description: 'Data-driven insights to optimize hostel performance and profitability.',
  },
  {
    icon: 'Package',
    title: 'Inventory',
    description: 'Track assets, supplies, and equipment with automated reorder alerts.',
  },
  {
    icon: 'Bell',
    title: 'Notifications',
    description: 'Automated alerts via SMS, email, and in-app for critical events.',
  },
  {
    icon: 'Shield',
    title: 'Role Management',
    description: 'Granular permissions for staff, managers, and administrators.',
  },
  {
    icon: 'Bot',
    title: 'AI Assistant',
    description: 'Ask questions, get insights, and automate tasks with your AI copilot.',
  },
]

export const AI_FEATURES: AIFeature[] = [
  {
    icon: 'MessageSquare',
    title: 'AI Complaint Categorizer',
    description: 'Automatically classify and route student complaints to the right department.',
    color: 'blue',
  },
  {
    icon: 'TrendingUp',
    title: 'AI Revenue Insights',
    description: 'Predictive revenue analysis with actionable recommendations.',
    color: 'emerald',
  },
  {
    icon: 'FileText',
    title: 'AI Monthly Reports',
    description: 'Generate detailed operational reports with one click.',
    color: 'violet',
  },
  {
    icon: 'BrainCircuit',
    title: 'AI Occupancy Prediction',
    description: 'Predict future bed demand to optimize pricing and availability.',
    color: 'amber',
  },
  {
    icon: 'Search',
    title: 'AI Smart Search',
    description: 'Natural language search across all student records and history.',
    color: 'rose',
  },
  {
    icon: 'ScanText',
    title: 'AI Invoice OCR',
    description: 'Extract and process invoice data from scanned documents automatically.',
    color: 'cyan',
  },
  {
    icon: 'Bot',
    title: 'AI Chat Assistant',
    description: 'Ask your dashboard anything. Get instant answers 24/7.',
    color: 'indigo',
  },
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: 'Rs 2,999',
    annualPrice: 'Rs 2,399',
    period: '/month',
    description: 'Perfect for small hostels just getting started.',
    features: [
      'Up to 50 beds',
      'Student management',
      'Room allocation',
      'Basic finance',
      'Email support',
      '5 staff accounts',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: 'Rs 7,999',
    annualPrice: 'Rs 6,399',
    period: '/month',
    description: 'The complete platform for growing hostels.',
    features: [
      'Up to 500 beds',
      'All Starter features',
      'AI Assistant',
      'Mess management',
      'Maintenance module',
      'Visitor management',
      'Advanced analytics',
      'Priority support',
      'Unlimited staff accounts',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large hostel chains and institutions.',
    features: [
      'Unlimited beds',
      'All Professional features',
      'Custom AI training',
      'API access',
      'SSO & SAML',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
]

export const FAQS: FAQ[] = [
  {
    question: 'How long does setup take?',
    answer: 'Most hostels are fully set up within a day. Our onboarding team guides you through importing existing student data, configuring rooms, and training your staff.',
  },
  {
    question: 'Can I import my existing student data?',
    answer: 'Yes. DormOS supports CSV and Excel imports for student records, room configurations, and historical financial data. Our import wizard makes it straightforward.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. The Professional plan comes with a 14-day free trial. No credit card required to get started.',
  },
  {
    question: 'How does the AI Assistant work?',
    answer: "The AI Assistant is trained on your hostel's data. Ask it questions like \"How many beds are vacant in Block B?\" or \"Show revenue trend for last quarter\" in plain English.",
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is encrypted at rest and in transit with AES-256. We perform regular third-party security audits and maintain strict access controls.',
  },
  {
    question: 'Can I manage multiple hostels?',
    answer: 'Yes. The Enterprise plan supports unlimited hostels under one account with consolidated reporting and management across all properties.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept JazzCash, Easypaisa, all major credit and debit cards, and bank transfers. Enterprise customers can also pay by invoice.',
  },
]

export const PRODUCT_FACTS: ProductFact[] = [
  { value: '12', label: 'Modules — students, rooms, finance, mess & more' },
  { value: 'AI', label: 'Built into reporting, insights & search' },
  { value: '14-Day', label: 'Free trial, no credit card required' },
  { value: 'PKR', label: 'Transparent local pricing, no hidden fees' },
]
