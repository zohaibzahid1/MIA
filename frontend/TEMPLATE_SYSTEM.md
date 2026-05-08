# Template Management System

This implementation provides a complete template management system with GraphQL queries, mutations, and a React frontend.

## Features Implemented

### GraphQL Schema (Backend)
The system supports the following GraphQL schema:

```graphql
type Template { 
  id: Int!
  name: String!
  createdAt: DateTime!
  deletedAt: DateTime
  questions: [Question!]
}

input CreateQuestionInput {
  description: String!
  weightage: Float!
  isQuantitative: Boolean!
}

input CreateTemplateInput {
  name: String!
  questions: [CreateQuestionInput!]!
}

input UpdateTemplateInput {
  id: Int!
  name: String!
  questions: [CreateQuestionInput!]!
}

type Query {
  getAllTemplates: [Template]
  getTemplateById(id: Int!): Template
}

type Mutation {
  createTemplate(name: String!): Template 
  createTemplateWithQuestions(input: CreateTemplateInput!): Template
  softDeleteTemplate(id: Int!): Template
  updateTemplate(input: UpdateTemplateInput!): Template
  recoverTemplate(id: Int!): Template
}
```

### Frontend Implementation

#### 1. Types (`src/types/template.types.ts`)
- Complete TypeScript interfaces for all template-related types
- Response types for GraphQL operations

#### 2. Template API (`src/services/templateApi.ts`)
- **Queries:**
  - `getAllTemplates()` - Fetch all templates
  - `getTemplateById(id)` - Fetch template by ID

- **Mutations:**
  - `createTemplate(name)` - Create template with name only
  - `createTemplateWithQuestions(input)` - Create template with questions
  - `softDeleteTemplate(id)` - Soft delete template
  - `updateTemplate(input)` - Update template (creates new version)
  - `recoverTemplate(id)` - Recover soft-deleted template

#### 3. Template Store (`src/stores/templateStore.ts`)
MobX store with:
- State management for templates, loading, and errors
- All API operations wrapped with loading/error handling
- Computed values for active/deleted templates
- Automatic UI updates through MobX reactivity

#### 4. Template Page (`src/components/pages/Template.tsx`)
Complete UI with:
- **List View:** Active and deleted templates with actions
- **Create Form:** Add new templates with questions
- **Edit Form:** Update existing templates
- **Question Management:** Add/remove/edit questions with weightage and type
- **Soft Delete/Recovery:** Delete and restore templates
- **Real-time Updates:** Using MobX observer pattern

### Usage

#### Navigation
Access templates through the sidebar: Dashboard → Templates → Templates

#### Creating Templates
1. Click "Create New Template"
2. Enter template name
3. Add questions with description, weightage, and type (quantitative/qualitative)
4. Submit to create

#### Managing Templates
- **Edit:** Modify existing templates (creates new version)
- **Delete:** Soft delete (moves to deleted section)
- **Recover:** Restore deleted templates

### File Structure
```
frontend/src/
├── types/
│   └── template.types.ts           # TypeScript interfaces
├── services/
│   ├── graphQlBaseApi.ts          # Base GraphQL client
│   └── templateApi.ts             # Template API methods
├── stores/
│   ├── templateStore.ts           # MobX store
│   └── rootStore.ts               # Updated with template store
├── components/
│   ├── pages/
│   │   └── Template.tsx           # Main template page
│   └── ui/                        # UI components (card, label, textarea)
└── app/dashboard/templates/
    └── page.tsx                   # Next.js route
```

### Testing the Implementation

1. **Start the application:** Navigate to `/dashboard/templates`
2. **Test Create:** Create templates with and without questions
3. **Test Read:** View all templates and individual template details
4. **Test Update:** Edit existing templates
5. **Test Delete:** Soft delete templates (they appear in deleted section)
6. **Test Recovery:** Recover deleted templates

### Error Handling
- Network errors are caught and displayed
- Loading states prevent multiple simultaneous operations
- Form validation ensures required fields
- MobX reactive updates keep UI in sync

### Integration Notes
- The system integrates with the existing authentication system
- Uses the established GraphQL base API for consistent error handling
- Follows the existing UI patterns and styling
- Leverages MobX for state management consistency

This implementation provides a production-ready template management system that can be easily extended with additional features like template sharing, versioning, or advanced question types.
