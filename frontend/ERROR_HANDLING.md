# Error Handling System

This document explains the updated error handling system for the Employee Evaluation System frontend.

## Overview

The error handling system has been refactored to follow these principles:

1. **Base API Is Transparent**: The GraphQL base API does not handle any business logic errors. It only manages authentication state and passes all other errors through to the calling stores.

2. **Auth-Only Base Handling**: The base API only catches and handles unauthorized errors (401, token expired, etc.) by redirecting to login. All other errors pass through unchanged.

3. **Store-Level Error Handling**: Each store has its own error handling with try-catch blocks that set error state for proper UX feedback.

4. **Consistent Error Display**: A reusable `ErrorAlert` component built with shadcn provides consistent error messaging across the application.

## Changes Made

### 1. GraphQL Base API Changes (`graphQlBaseApi.ts`)

The base API now only handles authentication-related errors and lets all other errors pass through:

```typescript
// Only handle auth errors - redirect to login
if (isAuthError) {
  this.handleAuthFailure("Authentication failed - redirecting to login");
}

// All other errors are thrown for stores to handle
if (result.errors?.length) {
  const firstError = result.errors[0];
  const errorMessage = firstError?.message || 'Unknown GraphQL error';
  throw new Error(errorMessage);
}
```

**Key Changes:**
- ✅ Only auth errors (401, unauthorized, invalid token, expired, JWT) trigger automatic redirects
- ✅ All other errors (validation, server errors, etc.) are thrown for individual store handling
- ✅ Network errors are properly caught and re-thrown with descriptive messages
- ✅ No custom error handling in base API - everything passes through to stores
- ✅ **Null-safe error handling**: Proper null checking for error objects and messages
- ✅ **Defensive programming**: All error properties are optional and safely accessed

**Null Safety Improvements:**
- Safe access to `result.errors[0]?.message` with fallback
- Optional message property in GraphQL error interface
- Proper error type checking for network and parsing errors

### 2. Store Error Handling

All stores now have proper try-catch blocks that set their error state:

```typescript
async handleCreateTemplate() {
  this.setError(null); // Clear previous errors
  try {
    const result = await this.createTemplateWithQuestions(input);
    // ... success logic
    return true;
  } catch (error) {
    runInAction(() => {
      this.setError(error instanceof Error ? error.message : 'Failed to create template');
    });
    return false;
  }
}
```

### 3. ErrorAlert Component

A new reusable component for displaying errors:

```tsx
import { ErrorAlert } from '@/components/shared/ErrorAlert';

<ErrorAlert 
  error={store.error} 
  onDismiss={() => store.clearError()}
  title="Operation Failed"
/>
```

## Component Props

### ErrorAlert Props

```typescript
interface ErrorAlertProps {
  error: string | null;           // Error message to display
  onDismiss?: () => void;         // Function to clear the error
  title?: string;                 // Alert title (default: "Error")
  className?: string;             // Additional CSS classes
}
```

## Usage Examples

### In Forms

```tsx
// TemplateForm.tsx
const TemplateForm: React.FC<TemplateFormProps> = ({
  error,
  onClearError,
  // ... other props
}) => {
  return (
    <form onSubmit={onSubmit}>
      <ErrorAlert 
        error={error} 
        onDismiss={onClearError}
        title="Operation Failed"
      />
      {/* ... rest of form */}
    </form>
  );
};
```

### In Pages

```tsx
// templates/page.tsx
const TemplatesPage = observer(() => {
  const { templateStore } = useStore();
  
  return (
    <div>
      <ErrorAlert 
        error={templateStore.error} 
        onDismiss={() => templateStore.clearError()}
        title="Template Operation Failed"
        className="mb-6"
      />
      {/* ... rest of page */}
    </div>
  );
});
```

### Passing to Child Components

```tsx
// When using forms
<TemplateForm
  error={templateStore.error}
  onClearError={() => templateStore.clearError()}
  // ... other props
/>
```

## Store Methods

Each store should implement these error-related methods:

```typescript
export class SomeStore {
  error: string | null = null;

  setError(error: string | null) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  get hasError(): boolean {
    return !!this.error;
  }
}
```

## Best Practices

### 1. Always Clear Errors Before Operations

```typescript
async someOperation() {
  this.setError(null); // Clear previous errors
  try {
    // ... operation
  } catch (error) {
    this.setError(error.message);
  }
}
```

### 2. Handle Errors in Individual Operations

Each store method should handle its own errors instead of relying on the base API:

```typescript
// ❌ Don't do this - just log errors
async deleteUser(id: number) {
  try {
    await api.deleteUser(id);
  } catch (error) {
    console.error('Delete failed:', error); // Only logging
  }
}

// ✅ Do this - set error state
async deleteUser(id: number) {
  this.setError(null);
  try {
    await api.deleteUser(id);
    return true;
  } catch (error) {
    runInAction(() => {
      this.setError(error instanceof Error ? error.message : 'Failed to delete user');
    });
    return false;
  }
}
```

### 3. Use ErrorAlert Consistently

Always use the `ErrorAlert` component instead of custom error displays:

```tsx
// ❌ Don't create custom error displays
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}

// ✅ Use ErrorAlert component
<ErrorAlert 
  error={error} 
  onDismiss={clearError}
  title="Operation Failed"
/>
```

### 4. Provide Clear Error Messages

Make error messages user-friendly and actionable:

```typescript
// ❌ Generic error messages
this.setError('Something went wrong');

// ✅ Specific, actionable error messages
this.setError(error instanceof Error ? error.message : 'Failed to create template. Please check your input and try again.');
```

## Store Updates Made

The following stores have been updated with proper error handling:

1. **TemplateStore**: ✅ Updated handler methods
2. **AllUserStore**: ✅ Updated soft delete and restore methods
3. **DepartmentStore**: ✅ Already had proper error handling
4. **AuthStore**: ✅ Already had proper error handling
5. **UserEvaluationStore**: ✅ Already had proper error handling
6. **ConductEvaluationStore**: ✅ Already had proper error handling
7. **DepartmentEvaluationHistoryStore**: ✅ Added clearError method

## Components Updated

1. **TemplateForm**: ✅ Added ErrorAlert support
2. **Templates Page**: ✅ Updated to use ErrorAlert
3. **Create Evaluation Page**: ✅ Updated to use ErrorAlert
4. **Department Evaluations Page**: ✅ Updated to use ErrorAlert
5. **Submit Evaluations Page**: ✅ Updated to use ErrorAlert
6. **Department Components**: ✅ Already using error props properly

## Testing Error Handling

To test the error handling:

1. **Network Errors**: Disconnect internet and try operations
2. **Server Errors**: Mock API to return 500 errors
3. **Validation Errors**: Submit invalid data
4. **Auth Errors**: Use expired tokens (should redirect to login)

The system should now provide consistent, user-friendly error messages without breaking the application flow.
