// Domain Types for Multi-Channel Marketing Automation Platform

export type NavModule =
  | 'overview'
  | 'console'
  | 'audience'
  | 'templates'
  | 'media'
  | 'offers'
  | 'scheduler'
  | 'automations'
  | 'meta'
  | 'google'
  | 'integrations'
  | 'settings';

export interface Customer {
  id: number | string;
  phone: string;
  name: string;
  gender: string;
  age?: number | string;
  category?: string;
  language?: string;
  history?: string[];
  lastContacted?: number | string;
}

export interface Offer {
  id: number | string;
  code: string;
  discount: string;
  description?: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'SCHEDULED' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  total: number;
  sent: number;
  createdAt: string;
  scheduledFor?: string;
  validUntil?: string;
  targetAudience?: string;
  platform?: 'both' | 'whatsapp' | 'sms';
  template?: string;
  mediaId?: string | null;
  mediaAsset?: MediaAsset | null;
  mediaEnabled?: boolean;
  mediaType?: MediaType | null;
  customerCareNumber?: string;
  sendToCustomerCare?: boolean;
}

export interface SavedTemplate {
  id: string;
  name: string;
  body: string;
  channel: 'both' | 'whatsapp' | 'sms';
  mediaId?: string | null;
  mediaAsset?: MediaAsset | null;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateConfig {
  template: string;
  mediaId?: string | null;
  mediaAsset?: MediaAsset | null;
  channel: 'both' | 'whatsapp' | 'sms';
}

export interface CategoryTemplates {
  [category: string]: string[];
}

export interface Settings {
  customerCareNumber: string;
  sendToCustomerCare: boolean;
  sendToCarePerCustomer: boolean;
  platform: 'both' | 'whatsapp' | 'sms';
  whatsappNumber?: string;
  smsNumber?: string;
  fromNumber?: string;
  accountSid?: string;
  isConfigured?: boolean;
}

// Media Library
export type MediaType = 'image' | 'video' | 'document';

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  mediaType: MediaType;
  size: number;
  checksum?: string;
  storageDriver?: string;
  magicBytesVerified?: boolean;
  assetStreamUrl?: string;
  url: string;
  uploadedAt: string;
  caption?: string;
  tags: string[];
  references: string[];
}

// Scheduler
export type ScheduleType = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ScheduleStatus = 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'RETRYING' | 'DEAD_LETTER';

export interface ScheduleItem {
  id: string;
  name: string;
  type: ScheduleType;
  scheduledAt: string;
  timezone: string;
  channel: 'both' | 'whatsapp' | 'sms';
  targetAudience: string;
  templateContent: string;
  offerCode?: string;
  mediaId?: string | null;
  idempotencyKey: string;
  status: ScheduleStatus;
  createdAt: string;
  lastRunAt?: string | null;
  executionCount?: number;
  retryCount?: number;
  lockedBy?: string | null;
  lockedAt?: string | null;
  lockExpiresAt?: string | null;
  deadLetterReason?: string;
  logs: Array<{ timestamp: string; event: string; details: string }>;
}

// Follow-Up Automations
export interface AutomationTrigger {
  type: 'CAMPAIGN_DISPATCHED' | 'DAYS_INACTIVE' | 'OFFER_VIEWED' | 'NO_RESPONSE';
  delayValue: number;
  delayUnit: 'MINUTES' | 'HOURS' | 'DAYS';
}

export interface AutomationCondition {
  field: 'gender' | 'age' | 'lastCampaignId';
  operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN';
  value: string;
}

export interface AutomationAction {
  type: 'SEND_SMS' | 'SEND_WHATSAPP' | 'NOTIFY_CARE' | 'TAG_CUSTOMER';
  channel?: 'both' | 'whatsapp' | 'sms';
  template?: string;
  offerCode?: string;
  note?: string;
  tag?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  active: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  stats: {
    triggeredCount: number;
    completedCount: number;
    convertedCount: number;
  };
  createdAt: string;
  logs: Array<{ timestamp: string; event: string; details: string }>;
}

// Meta Campaigns
export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  balance: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED';
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  roas: number;
  adSetCount: number;
  creative: {
    headline: string;
    body: string;
    callToAction: string;
    mediaUrl?: string;
  };
  createdAt: string;
}

export interface MetaSummary {
  totalSpend: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: string;
  avgCpc: string;
}

export interface MetaDataResponse {
  isConnected: boolean;
  isLive?: boolean;
  dataSource?: string;
  dataSourceNotice?: string;
  adAccounts: MetaAdAccount[];
  selectedAccountId: string;
  summary: MetaSummary;
  campaigns: MetaCampaign[];
}

// Google Ads Campaigns
export interface GoogleCampaign {
  id: string;
  name: string;
  type: 'SEARCH' | 'DISPLAY' | 'PERFORMANCE_MAX' | 'VIDEO';
  biddingStrategy: string;
  status: 'ENABLED' | 'PAUSED' | 'ENDED';
  dailyBudget: number;
  cost: number;
  impressions: number;
  clicks: number;
  avgCpc: number;
  conversions: number;
  costPerConversion: number;
  keywordsCount: number;
  createdAt: string;
  dataSource?: string;
  isLive?: boolean;
}

export interface GoogleSummary {
  totalCost: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCpc: string;
  avgCostPerConv: string;
}

export interface GoogleDataResponse {
  isConnected: boolean;
  isLive?: boolean;
  dataSource?: string;
  dataSourceNotice?: string;
  customerId: string;
  customerName: string;
  summary: GoogleSummary;
  campaigns: GoogleCampaign[];
}

// Integrations
export interface ProviderStatus {
  accountSid?: string;
  hasAuthToken?: boolean;
  messagingServiceSid?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  appId?: string;
  hasAppSecret?: boolean;
  hasAccessToken?: boolean;
  adAccountId?: string;
  hasDeveloperToken?: boolean;
  clientId?: string;
  hasClientSecret?: boolean;
  hasRefreshToken?: boolean;
  customerId?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'VERIFICATION_FAILED';
  lastVerified: string | null;
  accountName: string;
  verifiedPermissions: string[];
  credentialsConfigured?: boolean;
  authVerified?: boolean;
  apiConnectivity?: boolean;
  permissionsVerified?: boolean;
  liveOperations?: boolean;
  mode?: string;
}

export interface IntegrationStatusResponse {
  twilio: ProviderStatus;
  meta: ProviderStatus;
  google: ProviderStatus;
  auditLogs: Array<{ id: number; timestamp: string; action: string; provider: string; details: string }>;
}

// Governance & Suppression
export interface SuppressionRecord {
  phone: string;
  reason: string;
  source: string;
  addedAt: string;
  updatedAt?: string;
}

export interface GovernanceRules {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  frequencyCapEnabled: boolean;
  maxMessagesPerWeek: number;
  optOutKeywords: string[];
}

// In-App Notifications (Phase 15 Addendum)
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'CAMPAIGN' | 'SYSTEM' | 'SECURITY' | 'AUTOMATION' | 'GOVERNANCE' | 'INTEGRATION';

export interface InAppNotification {
  id: string;
  userId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  idempotencyKey?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, any>;
}

// Phase 17: AI Multilingual Templates & Follow-up
export type RegionalLanguage =
  | 'english'
  | 'tamil'
  | 'hindi'
  | 'telugu'
  | 'malayalam'
  | 'kannada'
  | 'bengali'
  | 'marathi'
  | 'gujarati'
  | 'punjabi'
  | 'odia'
  | 'urdu';

export type TemplateTone =
  | 'professional'
  | 'friendly'
  | 'promotional'
  | 'festive'
  | 'urgent'
  | 'premium';

export interface ExtractedOfferData {
  businessName: string;
  productName: string;
  offerTitle: string;
  discount: string;
  couponCode: string;
  validUntil: string;
  terms: string;
  contactNumber: string;
  websiteUrl: string;
  callToAction: string;
  campaignContext: string;
  confidenceScores?: Record<string, number>;
  needsConfirmation?: string[];
}

export interface GeneratedTemplateVariant {
  id: string;
  generationId: string;
  language: string;
  channel: 'both' | 'whatsapp' | 'sms';
  tone: string;
  variantType: 'primary' | 'short' | 'friendly' | 'urgency' | 'whatsapp';
  label?: string;
  messageBody: string;
  content?: string;
  characterCount: number;
  encoding: 'GSM-7' | 'Unicode';
  estimatedSmsSegments: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved?: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

export interface CampaignFollowUpContent {
  id: string;
  campaignId?: string | null;
  generationId?: string | null;
  sequenceNumber: number;
  stage: 'INITIAL' | 'REMINDER' | 'REINFORCEMENT' | 'EXPIRY';
  scheduledInterval: string;
  language: string;
  channel: 'both' | 'whatsapp' | 'sms';
  messageBody: string;
  content?: string;
  eligibilityRule: 'ALL_ELIGIBLE' | 'NOT_REPLIED' | 'NOT_CONVERTED' | 'DELIVERED_ONLY';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AIContentGeneration {
  id: string;
  userId?: string;
  sourceMediaId?: string | null;
  sourceMediaAsset?: MediaAsset | null;
  mediaAsset?: MediaAsset | null;
  extractedOfferData: ExtractedOfferData;
  extractedData?: ExtractedOfferData;
  languages: string[];
  tone: TemplateTone;
  channel: 'both' | 'whatsapp' | 'sms';
  generationStatus: 'DRAFT' | 'ANALYZED' | 'GENERATED' | 'APPROVED';
  approvalStatus?: 'DRAFT' | 'ANALYZED' | 'GENERATED' | 'APPROVED';
  variants: GeneratedTemplateVariant[];
  createdAt: string;
  updatedAt: string;
}


