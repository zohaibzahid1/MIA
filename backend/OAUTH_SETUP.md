# Microsoft OAuth Setup Guide

## Overview
This implementation provides Microsoft OAuth 2.0 authentication using Azure AD for your NestJS application with both REST API and GraphQL support.

## Setup Instructions

### 1. Azure AD App Registration
1. Go to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Your application name
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: `http://localhost:3000/authentication/microsoft/redirect`
5. After creation, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**
6. Go to **Certificates & secrets** and create a new client secret
7. Note down the **Client secret value**

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Microsoft Azure AD Configuration
MICROSOFT_TENANT_ID=your-tenant-id-from-azure
MICROSOFT_CLIENT_ID=your-client-id-from-azure
MICROSOFT_CLIENT_SECRET=your-client-secret-from-azure
MICROSOFT_CALLBACK_URL=http://localhost:3000/authentication/microsoft/redirect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
FRONTEND_URL_REDIRECT=http://localhost:3001/auth/callback

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 3. API Endpoints

#### REST API Endpoints
- **GET** `/authentication/microsoft` - Initiates Microsoft OAuth flow
- **GET** `/authentication/microsoft/redirect` - OAuth callback endpoint
- **GET** `/authentication/profile` - Get user profile (requires JWT token)
- **GET** `/authentication/verify` - Verify JWT token

#### GraphQL Endpoints
- **POST** `/graphql` - GraphQL endpoint
- **GET** `/graphql` - GraphQL Playground (development only)

Available GraphQL Queries:
```graphql
# Get current authenticated user
query Me {
  me {
    id
    name
    email
    role
    microsoftId
  }
}

# Check if user is authenticated
query IsAuthenticated {
  isAuthenticated
}

# Get all users (requires authentication)
query Users {
  users {
    id
    name
    email
    role
  }
}

# Get specific user by ID
query User($id: String!) {
  user(id: $id) {
    id
    name
    email
    role
  }
}
```

### 4. Frontend Integration

#### REST API Usage Flow
1. Frontend redirects user to `/authentication/microsoft`
2. User authenticates with Microsoft
3. Microsoft redirects back to `/authentication/microsoft/redirect`
4. Backend generates JWT token and redirects to frontend with token
5. Frontend can use the JWT token for subsequent API calls

#### GraphQL Usage
```javascript
// Making authenticated GraphQL requests
const token = localStorage.getItem('authToken');

const query = `
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ query })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 5. GraphQL Playground
Visit `http://localhost:3000/graphql` in your browser to access the GraphQL Playground where you can test queries.

To authenticate in GraphQL Playground:
1. Get a JWT token by completing the OAuth flow
2. In the HTTP Headers section of the playground, add:
```json
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

### 6. Authentication Flow

#### For REST Endpoints
```javascript
// Initiating Login
window.location.href = 'http://localhost:3000/authentication/microsoft';

// Handling Callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('authToken', token);
}

// Making authenticated requests
const token = localStorage.getItem('authToken');
fetch('http://localhost:3000/authentication/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### For GraphQL
The JWT guard supports both REST and GraphQL contexts automatically. Use the same JWT token for both REST and GraphQL requests.

### 7. Security Features

#### JWT Guard Implementation
The `JwtAuthGuard` has been enhanced to support both REST and GraphQL contexts:
- Automatically detects the request type (REST vs GraphQL)
- Extracts the request object appropriately for each context
- Gracefully handles authentication failures by returning null instead of throwing errors

#### Authentication in GraphQL
- Uses the same JWT tokens as REST endpoints
- Supports the `@UseGuards(JwtAuthGuard)` decorator on resolvers
- Context automatically includes the authenticated user

### 8. Development

#### Start the application
```bash
npm run start:dev
```

#### Access Points
- REST API: `http://localhost:3000`
- GraphQL Playground: `http://localhost:3000/graphql`
- OAuth Login: `http://localhost:3000/authentication/microsoft`

### 9. User Data Structure

The application stores the following user information:
```typescript
{
  id: string;
  name: string;
  email: string;
  microsoftId: string;
  role: string;
  createdAt: Date;
}
```

### 10. Customization

#### Modifying User Data
Edit `src/user/user.service.ts` to change how user data is stored and retrieved.

#### Adding Database Integration
Replace the in-memory user storage with your preferred database (TypeORM entities, Prisma, etc.).

#### Custom JWT Claims
Modify `src/authentication/authentication.service.ts` to include additional claims in the JWT token.

#### GraphQL Schema Extension
The GraphQL schema is automatically generated from TypeScript classes using decorators. Add new resolvers and types as needed.

## Troubleshooting

### Common Issues
1. **Invalid redirect URI**: Make sure the redirect URI in Azure matches exactly
2. **CORS errors**: CORS is configured for the frontend URL in environment variables
3. **Token verification fails**: Check JWT secret consistency between REST and GraphQL
4. **GraphQL authentication fails**: Ensure the Authorization header is properly set
5. **Schema generation issues**: Make sure all GraphQL decorators are properly imported

### Debug Mode
Set `NODE_ENV=development` to see more detailed error messages and access GraphQL Playground.
