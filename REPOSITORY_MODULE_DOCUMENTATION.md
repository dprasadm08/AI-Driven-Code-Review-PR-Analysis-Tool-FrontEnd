# Repository Module Documentation

## Overview
The Repository Module provides a comprehensive interface for managing GitHub repositories in the AI PR Review application. It includes functionality for adding, listing, filtering, syncing, and deleting repositories.

## Module Structure

### Files Created/Updated

#### 1. Models (`src/app/core/models/repository.model.ts`)

**Interfaces:**
- `Repository` - Main repository data structure
  - id, name, fullName, description, url, owner
  - isPrivate, defaultBranch, language
  - stats (stars, forks, openIssues)
  - timestamps (createdAt, updatedAt, lastAnalyzedAt)
  - status (RepositoryStatus enum)

- `RepositoryStatus` - Enum for repository states
  - ACTIVE - Repository is active and ready
  - INACTIVE - Repository is inactive
  - ANALYZING - Repository is being analyzed
  - ERROR - Repository has errors

- `AddRepositoryRequest` - Request payload for adding repository
  - url (required)
  - accessToken (optional, for private repos)
  - branch (optional, defaults to 'main')

- `AddRepositoryResponse` - Response from add repository API
  - message
  - repository

- `RepositoryFilters` - Filter options for repository list
  - status, language, searchTerm
  - sortBy, sortOrder

- `RepositoryStats` - Repository statistics
  - totalRepositories, activeRepositories
  - totalPullRequests, totalAnalyses
  - lastSyncDate

#### 2. Service (`src/app/core/services/repository.service.ts`)

**Key Methods:**

**Repository CRUD:**
- `getRepositories(filters?: RepositoryFilters)` - Get all repositories with optional filters
- `getRepositoryById(id: string)` - Get single repository by ID
- `addRepository(request: AddRepositoryRequest)` - Add new repository
- `updateRepository(id: string, updates: Partial<Repository>)` - Update repository
- `deleteRepository(id: string)` - Delete repository
- `syncRepository(id: string)` - Sync repository with GitHub

**Utility Methods:**
- `validateRepositoryUrl(url: string)` - Validates GitHub URL format
- `parseGithubUrl(url: string)` - Extracts owner and repo name from URL
- `getRepositoryStats()` - Get overall repository statistics

**URL Validation Patterns:**
- `https://github.com/owner/repo`
- `git@github.com:owner/repo.git`
- `owner/repo` (shorthand)

**State Management:**
- Uses `BehaviorSubject<Repository[]>` for reactive repository list
- Automatically updates local state after create/update/delete operations
- Provides `repositories$` observable for components to subscribe

#### 3. Add Repository Component

**File:** `src/app/repositories/add-repository/add-repository.component.ts`

**Features:**
- Real-time URL validation with visual feedback
- GitHub URL parsing to extract owner and repository name
- Optional access token for private repositories
- Branch name specification
- Form validation for all fields
- Loading states during API calls
- Success/error message display
- Auto-redirect to repository list after successful addition

**Form Fields:**
- Repository URL (required)
- Default Branch (required, default: 'main')
- Access Token (optional, for private repos)
- Private Repository Toggle

**Validation:**
- URL format validation
- Branch name validation
- Access token validation (when private repo is selected)
- Real-time feedback with error messages

**UI Features:**
- URL parsing preview (shows owner/repo when valid)
- Help text with supported URL formats
- Info box explaining what happens next
- Tips panel with quick guidance
- Loading spinner during submission
- Success message with auto-redirect

**File:** `src/app/repositories/add-repository/add-repository.component.html`

**Layout:**
- Two-column grid (form + tips panel)
- Responsive design (stacks on mobile)
- Professional styling with gradients and shadows
- Icon-enhanced labels
- Comprehensive help text

**File:** `src/app/repositories/add-repository/add-repository.component.css`

**Styling:**
- Modern card-based layout
- Color-coded validation states (error/success)
- Smooth transitions and hover effects
- Responsive breakpoints
- Accessibility-friendly color contrast

#### 4. Repository List Component

**File:** `src/app/repositories/repository-list/repository-list.component.ts`

**Features:**
- Repository grid display with cards
- Search functionality
- Status filtering
- Repository sync
- Delete with confirmation dialog
- Loading states
- Empty state handling
- Error message display
- Automatic data refresh after operations

**State Management:**
- Uses RxJS `Subject` for cleanup
- Subscribes to repository service
- Unsubscribes on component destroy

**UI Features:**
- Search bar with real-time filtering
- Status dropdown filter
- Clear filters button
- Add repository button
- Repository cards with:
  - Repository name and owner
  - Status badge
  - Description
  - Statistics (language, stars, forks, branch)
  - Metadata (added date, last analyzed)
  - Action buttons (sync, details, delete)
- Empty state with helpful message
- Repository count display

**File:** `src/app/repositories/repository-list/repository-list.component.html`

**Layout:**
- Header with title and add button
- Filters bar with search and status filter
- Repository grid (responsive, auto-fills)
- Delete confirmation dialog

**File:** `src/app/repositories/repository-list/repository-list.component.css`

**Styling:**
- Card-based grid layout
- Status badge color coding:
  - Active: Green
  - Inactive: Gray
  - Analyzing: Yellow
  - Error: Red
- Hover effects on cards
- Responsive grid (adapts to screen size)
- Clean, professional design

## API Integration

### Endpoints

**Base URL:** `${environment.apiUrl}/repositories`

1. **GET /repositories** - Get all repositories
   - Query params: status, language, search, sortBy, sortOrder
   - Response: `Repository[]`

2. **GET /repositories/:id** - Get repository by ID
   - Response: `Repository`

3. **POST /repositories** - Add new repository
   - Body: `AddRepositoryRequest`
   - Response: `AddRepositoryResponse`

4. **PUT /repositories/:id** - Update repository
   - Body: `Partial<Repository>`
   - Response: `Repository`

5. **DELETE /repositories/:id** - Delete repository
   - Response: `void`

6. **POST /repositories/:id/sync** - Sync repository
   - Response: `Repository`

7. **GET /repositories/stats** - Get repository statistics
   - Response: `RepositoryStats`

### Error Handling

The service includes comprehensive error handling:
- 404: Repository not found
- 409: Repository already exists
- 422: Invalid repository URL
- Custom error messages for user-friendly display
- Errors propagated to components for UI feedback

## Usage Examples

### Adding a Repository

```typescript
const request: AddRepositoryRequest = {
  url: 'https://github.com/owner/repo',
  branch: 'main',
  accessToken: 'ghp_xxxx' // optional for private repos
};

this.repositoryService.addRepository(request).subscribe({
  next: (response) => {
    console.log('Repository added:', response.repository);
  },
  error: (error) => {
    console.error('Error:', error.message);
  }
});
```

### Listing Repositories with Filters

```typescript
const filters: RepositoryFilters = {
  status: RepositoryStatus.ACTIVE,
  searchTerm: 'react',
  sortBy: 'stars',
  sortOrder: 'desc'
};

this.repositoryService.getRepositories(filters).subscribe({
  next: (repositories) => {
    console.log('Repositories:', repositories);
  }
});
```

### Subscribing to Repository Changes

```typescript
this.repositoryService.repositories$.subscribe({
  next: (repositories) => {
    this.repositories = repositories;
  }
});
```

## Component Navigation

### Routes

```typescript
/repositories/list - Repository list view
/repositories/add - Add repository view
```

### Navigation Flow

1. User clicks "Add Repository" button
2. Navigates to `/repositories/add`
3. Fills out form and submits
4. After successful addition, auto-redirects to `/repositories/list`
5. New repository appears in the list

## Shared Components Used

1. **app-error-message** - Display error/success messages
   - Used in both add and list components
   - Type: 'error' | 'info' | 'success'

2. **app-loading-spinner** - Loading indicator
   - Used during API calls
   - Centered with loading text

3. **app-confirmation-dialog** - Confirmation prompt
   - Used for delete confirmation
   - Customizable title, message, and button text

## Security Considerations

1. **Access Tokens**
   - Stored only during form submission
   - Not displayed after submission
   - Sent securely to backend via HTTPS
   - Password input type for token field

2. **URL Validation**
   - Strict GitHub URL pattern matching
   - Prevents invalid or malicious URLs
   - Client-side validation before API call

3. **Authentication**
   - All API calls go through AuthInterceptor
   - JWT token automatically attached
   - Protected by AuthGuard

## Responsive Design

### Breakpoints

- **Desktop (>1200px):** 3-column grid, side panel visible
- **Tablet (768px-1200px):** 2-column grid, side panel below
- **Mobile (<768px):** Single column, stacked layout

### Mobile Optimizations

- Touch-friendly button sizes
- Stacked form layout
- Full-width inputs
- Vertical button groups
- Simplified navigation

## Testing Checklist

### Add Repository
- [ ] URL validation works for all formats
- [ ] Branch name is required
- [ ] Private repo toggle shows/hides token field
- [ ] Token is required when private is checked
- [ ] Success message displays after addition
- [ ] Auto-redirect to list after 2 seconds
- [ ] Error messages display on API failure
- [ ] Form clears when Clear Form clicked
- [ ] Cancel navigates to list

### Repository List
- [ ] Repositories load on page load
- [ ] Search filters repositories
- [ ] Status filter works
- [ ] Clear filters resets to all repositories
- [ ] Sync button updates repository
- [ ] Delete shows confirmation dialog
- [ ] Delete removes repository from list
- [ ] Empty state shows when no repos
- [ ] Loading spinner shows during API calls
- [ ] Repository cards display all information
- [ ] External link opens in new tab

## Future Enhancements

1. **Pagination** - Handle large repository lists
2. **Bulk Operations** - Select multiple repositories for batch actions
3. **Repository Details Page** - Detailed view with PR list
4. **Edit Repository** - Update repository settings
5. **Import/Export** - Backup repository configurations
6. **Repository Health Score** - Visual indicators of code quality
7. **Webhook Management** - Configure GitHub webhooks
8. **Repository Groups** - Organize repositories by project/team
9. **Analytics Dashboard** - Repository metrics and trends
10. **Auto-sync Schedule** - Configure automatic sync intervals

## Troubleshooting

### Common Issues

**Issue:** Repository already exists error
**Solution:** Check if repository URL is already added

**Issue:** Invalid URL error
**Solution:** Ensure URL matches GitHub format: `https://github.com/owner/repo`

**Issue:** Private repository fails to add
**Solution:** Generate GitHub Personal Access Token with 'repo' scope

**Issue:** Sync fails
**Solution:** Check if access token is still valid (for private repos)

**Issue:** Repositories not loading
**Solution:** Check backend API is running, check browser console for errors

## Related Documentation

- [Authentication Documentation](AUTH_DOCUMENTATION.md)
- [Guards and Interceptors](GUARDS_INTERCEPTORS.md)
- [Main README](README.md)

---

**Last Updated:** May 20, 2024
**Module Version:** 1.0.0
**Angular Version:** 17.0.0
