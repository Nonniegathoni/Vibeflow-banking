// Transaction interface for the main application
export interface Transaction {
  id: number
  user_id: number
  recipient_id?: number
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'mpesa_deposit' | 'mpesa_withdrawal'
  amount: string
  description: string
  reference: string
  status: 'completed' | 'pending' | 'failed' | 'flagged'
  reported: boolean
  risk_score: number
  created_at: string
  updated_at?: string
}

// Transaction interface for the API service (different structure)
export interface ApiTransaction {
  id: string
  userId: string
  type: string
  amount: string
  description: string
  timestamp: number
  status: string
  riskScore: number
  createdAt: string
  isSuspicious: boolean
}

export interface User {
  id: number
  name: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'agent' | 'user'
  balance: number
  account_number: string
  phone_number: string
  verification_code?: string
  verification_code_expires_at?: string
  created_at: string
  updated_at?: string
}

export interface FraudAlert {
  id: number
  user_id: number
  transaction_id: number
  description: string
  status: 'new' | 'reviewing' | 'resolved'
  risk_score: number
  resolution?: string
  created_at: string
  updated_at?: string
}

export interface FraudRule {
  id: number
  name: string
  description: string
  rule_type: 'amount' | 'frequency' | 'location' | 'new_account' | 'unusual_location'
  threshold?: number
  is_active: boolean
  created_by?: number
  created_at: string
  updated_at?: string
}

export interface CustomerSupport {
  id: number
  user_id: number
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved'
  assigned_to?: number
  created_at: string
  updated_at?: string
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'transaction' | 'security' | 'account' | 'support'
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number
  action: string
  entity_type?: string
  entity_id?: number
  details?: string
  created_at: string
}
