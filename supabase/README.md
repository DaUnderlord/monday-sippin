# Supabase Database Setup

This directory contains the database schema, migrations, and configuration for the Monday Sippin' website.

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Supabase (if not already done)

```bash
supabase init
```

### 3. Start Local Development

```bash
supabase start
```

This will start the local Supabase stack including:
- PostgreSQL database
- Auth server
- Realtime server
- Storage server
- Edge Functions runtime

### 4. Apply Migrations

```bash
supabase db reset
```

This will apply all migrations in order:
1. `001_initial_schema.sql` - Creates tables and basic structure
2. `002_rls_policies.sql` - Sets up Row Level Security policies
3. `003_indexes.sql` - Creates performance indexes
4. `004_functions.sql` - Creates utility functions

### 5. Environment Variables

Update your `.env.local` file with the local Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

You can find these keys by running:
```bash
supabase status
```

### 6. Social Login Setup

To enable social login providers:

1. **GitHub OAuth App:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `http://127.0.0.1:54321/auth/v1/callback`
   - Add client ID and secret to environment variables

2. **Google OAuth App:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Set authorized redirect URI to: `http://127.0.0.1:54321/auth/v1/callback`
   - Add client ID and secret to environment variables

### 7. Production Deployment

When deploying to production:

1. Create a new Supabase project at https://supabase.com
2. Link your local project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Push migrations to production:
   ```bash
   supabase db push
   ```
4. Update environment variables with production URLs and keys

## Database Schema Overview

### Core Tables

- **profiles** - User profiles with role-based access
- **categories** - Article categories with hierarchical support
- **articles** - Main content with rich text and metadata
- **tags** - Flexible tagging system
- **filters** - Hierarchical filtering system (3 levels)
- **newsletter_subscribers** - Email subscription management

### Junction Tables

- **article_tags** - Many-to-many relationship between articles and tags
- **article_filters** - Many-to-many relationship between articles and filters

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Allow public read access to published content
- Restrict write access based on user roles
- Protect user data and admin functions

### Performance

Indexes are created for:
- Common query patterns (status, published_at, author_id)
- Full-text search capabilities
- Foreign key relationships
- Composite queries for filtering

## Useful Commands

```bash
# Reset database and apply all migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# View database in browser
supabase studio

# Check migration status
supabase migration list

# Create new migration
supabase migration new migration_name

# Stop local services
supabase stop
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `config.toml` if needed
2. **Migration errors**: Check SQL syntax and dependencies
3. **RLS policies**: Ensure policies allow necessary operations
4. **Social login**: Verify callback URLs and credentials

### Logs

View logs for debugging:
```bash
supabase logs
```

### Database Access

Connect directly to the database:
```bash
supabase db shell
```