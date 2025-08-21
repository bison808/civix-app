# CIVIX API Integration Layer

## Overview
This document describes the API integration layer for the CIVIX frontend application. The integration provides a robust connection to all backend services with TypeScript support, error handling, and React Query integration.

## Architecture

### Service URLs
- **Auth Service**: `http://localhost:3003`
- **AI Engine**: `http://localhost:3002`
- **Data Pipeline**: `http://localhost:3001`
- **Communications**: `http://localhost:3005`

### Directory Structure
```
/services
├── api/
│   └── client.ts          # Axios configuration and interceptors
├── auth.service.ts        # Authentication service
├── representatives.service.ts  # Representatives data service
├── bills.service.ts       # Bills and legislation service
├── feedback.service.ts    # User feedback service
└── index.ts              # Service exports

/types
├── auth.types.ts         # Authentication types
├── representatives.types.ts  # Representative types
├── bills.types.ts        # Bill and legislation types
├── feedback.types.ts     # Feedback types
└── index.ts             # Type exports

/hooks
├── useAuth.ts           # Authentication hooks
├── useRepresentatives.ts # Representative data hooks
├── useBills.ts          # Bill data hooks
├── useFeedback.ts       # Feedback hooks
└── index.ts            # Hook exports

/providers
└── query-provider.tsx   # React Query configuration
```

## Features

### 1. API Client (`services/api/client.ts`)
- **Axios instances** for each backend service
- **Request interceptors** for automatic token attachment
- **Response interceptors** for global error handling
- **Token management** with localStorage
- **Network error detection** and user-friendly messages

### 2. Service Modules

#### Auth Service (`services/auth.service.ts`)
- `register()` - User registration
- `login()` - User authentication
- `logout()` - Session termination
- `verifyZipCode()` - ZIP code validation
- `getCurrentUser()` - Fetch current user data
- `updateUser()` - Update user profile
- `requestPasswordReset()` - Initiate password reset
- `confirmPasswordReset()` - Complete password reset
- `refreshToken()` - Refresh authentication token

#### Representatives Service (`services/representatives.service.ts`)
- `getRepresentativesByZipCode()` - Find reps by ZIP
- `getRepresentativeById()` - Get specific rep details
- `getRepresentatives()` - List with filters
- `getRepresentativeScorecard()` - Performance metrics
- `getRepresentativeVotes()` - Voting history
- `searchRepresentatives()` - Text search
- `compareRepresentatives()` - Side-by-side comparison

#### Bills Service (`services/bills.service.ts`)
- `getBills()` - List bills with filters
- `getBillById()` - Get specific bill
- `getSimplifiedBill()` - AI-simplified version
- `getBillImpact()` - Personal impact analysis
- `getTrendingBills()` - Popular bills
- `getPersonalizedBills()` - ZIP-based recommendations
- `searchBills()` - Text search

#### Feedback Service (`services/feedback.service.ts`)
- `submitFeedback()` - Submit user feedback
- `getFeedback()` - List feedback with filters
- `voteFeedback()` - Upvote/downvote feedback
- `getFeedbackAggregation()` - Aggregated insights
- `analyzeSentiment()` - AI sentiment analysis
- `suggestTags()` - AI tag suggestions

### 3. React Hooks

All hooks integrate with React Query for:
- **Automatic caching** with configurable stale times
- **Background refetching** for fresh data
- **Optimistic updates** for better UX
- **Infinite scrolling** support
- **Mutation handling** with success/error callbacks

Example usage:
```typescript
import { useAuth, useBills, useSubmitFeedback } from '@/hooks';

function MyComponent() {
  const { user, login, isAuthenticated } = useAuth();
  const { data: bills, isLoading } = useBills({ limit: 10 });
  const { mutate: submitFeedback } = useSubmitFeedback();
  
  // Use the data and methods...
}
```

### 4. TypeScript Support

Complete type definitions for:
- All API requests and responses
- User, Representative, Bill, and Feedback entities
- Filter and pagination parameters
- Error responses
- WebSocket events

## Configuration

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:3002
NEXT_PUBLIC_DATA_PIPELINE_URL=http://localhost:3001
NEXT_PUBLIC_COMMUNICATIONS_URL=http://localhost:3005
```

### React Query Setup
The QueryProvider is configured in `app/layout.tsx`:
- 1-minute stale time by default
- 5-minute garbage collection time
- Automatic retry with exponential backoff
- Development tools in dev mode

## Error Handling

The API client handles errors globally:
- **401 Unauthorized** - Redirects to login
- **403 Forbidden** - Shows permission error
- **404 Not Found** - Resource not found message
- **429 Too Many Requests** - Rate limit message
- **500+ Server Errors** - Generic server error
- **Network Errors** - Connection problem message

## Testing

Run the API integration tests:
```bash
npx ts-node test-api-integration.ts
```

This will test:
- Authentication flow
- Representative data fetching
- Bill retrieval and search
- Feedback submission
- AI features (sentiment, simplification)

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/hooks';

function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  
  const handleSubmit = async (data) => {
    login({
      email: data.email,
      password: data.password
    });
  };
  
  return (
    // Form JSX
  );
}
```

### Fetching Bills
```typescript
import { useBills, useSimplifiedBill } from '@/hooks';

function BillList() {
  const { data, isLoading, fetchNextPage } = useInfiniteBills({
    chamber: 'House',
    sortBy: 'date'
  });
  
  const bills = data?.pages.flatMap(page => page.bills) ?? [];
  
  return (
    // List JSX with infinite scroll
  );
}
```

### Submitting Feedback
```typescript
import { useSubmitFeedback } from '@/hooks';

function FeedbackForm({ billId }) {
  const { mutate: submit, isPending } = useSubmitFeedback();
  
  const handleSubmit = (content) => {
    submit({
      type: 'bill',
      category: 'support',
      content,
      billId
    });
  };
  
  return (
    // Form JSX
  );
}
```

## Coordination with Other Agents

This API layer is designed to work seamlessly with:
- **Agent 2**: UI components that consume these hooks
- **Agent 3**: State management that may cache API responses
- **Backend Services**: All four backend services running on their designated ports

The API layer is service-agnostic and will work with any backend that follows the defined interfaces.