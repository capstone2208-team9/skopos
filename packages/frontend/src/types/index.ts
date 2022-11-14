export interface Assertion {
  __typename?: string
  id?: string;
  property: string,
  comparison: string;
  expected: string | number,
  requestId?: number,
}

export interface AssertionResult {
  id: number
  responseId?: number
  pass: boolean
  property: string
  comparison: string
  actual: string
  expected: string
  assertionId: number
  assertion: Assertion
}

export interface Header {
  id: string;
  value: [string, string]
}

export interface ICollection {
  id: number;
  title: string;
  requests: Request[];
  collectionRuns: CollectionRun[]
  monitors: Monitor[]
}

export interface Request {
  __typename?: string
  id?: number | any;
  collectionId?: number;
  stepNumber: number;
  title: string;
  method: string;
  url: string;
  body?: string;
  headers?: Record<string | any, string | number | any>
  response?: Response;
  createdAt?: Date;
  assertions: Assertion[]
}

export interface Response {
  id: number;
  status: number;
  headers?: Record<string, any>
  body?: Headers;
  latency: number;
  createdAt?: Date;
  collectionRunId?: number;
  url: string
  request: Request
  assertionResults: AssertionResult[]
}

export interface CollectionRun {
  id: number;
  collectionId?: number;
  createdAt?: string
  responses: Response[]
}

export interface Monitor {
  id: number
  schedule: string
  contactInfo: string
  collections: ICollection[]
}

export interface MonitorCreateInput {
  contactInfo?: string
  value: string
  units: string
  collections: number[]
}

export interface MonitorUpdateInput extends MonitorCreateInput {
  id: number
}



