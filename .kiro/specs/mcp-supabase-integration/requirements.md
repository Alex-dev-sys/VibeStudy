# Requirements Document

## Introduction

This specification defines the integration of Supabase MCP (Model Context Protocol) server into the VibeStudy platform. The MCP Supabase integration will enable AI assistants to interact directly with the Supabase database through standardized protocol tools, allowing for database queries, schema inspection, and data management operations without manual SQL writing.

## Glossary

- **MCP (Model Context Protocol)**: A standardized protocol for AI assistants to interact with external tools and services
- **Supabase MCP Server**: An MCP server implementation that provides tools for interacting with Supabase databases
- **VibeStudy Platform**: The 90-day programming education platform
- **Database Schema**: The structure of tables, columns, and relationships in the Supabase database
- **AI Assistant**: The Kiro AI assistant that will use MCP tools to interact with the database
- **MCP Configuration File**: The `.mcp.json` file that defines available MCP servers
- **Environment Variables**: Configuration values stored in `.env.local` for database connection

## Requirements

### Requirement 1

**User Story:** As a developer, I want to configure the Supabase MCP server in the project, so that AI assistants can interact with the database through MCP tools

#### Acceptance Criteria

1. WHEN the developer reviews the MCP configuration, THE MCP Configuration File SHALL include the Supabase MCP server definition with command "npx" and arguments "-y @modelcontextprotocol/server-supabase"
2. THE MCP Configuration File SHALL preserve existing MCP server configurations including the shadcn server
3. THE Environment Variables SHALL include SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for database connection
4. WHERE the Supabase MCP server is configured, THE AI Assistant SHALL have access to database interaction tools without requiring manual SQL queries

### Requirement 2

**User Story:** As an AI assistant, I want to query the database schema through MCP tools, so that I can understand the database structure without reading SQL files

#### Acceptance Criteria

1. WHEN the AI Assistant requests schema information, THE Supabase MCP Server SHALL provide table definitions including columns, types, and constraints
2. THE Supabase MCP Server SHALL expose relationship information between tables through foreign key definitions
3. THE Supabase MCP Server SHALL provide index information for query optimization understanding
4. THE Supabase MCP Server SHALL return Row Level Security (RLS) policy information for security context

### Requirement 3

**User Story:** As an AI assistant, I want to execute database queries through MCP tools, so that I can retrieve and analyze user data to provide better assistance

#### Acceptance Criteria

1. WHEN the AI Assistant needs to query user progress data, THE Supabase MCP Server SHALL execute SELECT queries and return results in structured format
2. WHEN the AI Assistant needs to analyze learning patterns, THE Supabase MCP Server SHALL support JOIN operations across related tables
3. WHEN the AI Assistant needs to aggregate statistics, THE Supabase MCP Server SHALL execute queries with GROUP BY and aggregate functions
4. IF a query violates RLS policies, THEN THE Supabase MCP Server SHALL return an error message with policy violation details

### Requirement 4

**User Story:** As a developer, I want the MCP Supabase integration to follow security best practices, so that database access is controlled and auditable

#### Acceptance Criteria

1. THE Environment Variables SHALL use SUPABASE_SERVICE_ROLE_KEY only in development environment
2. THE MCP Configuration File SHALL NOT contain hardcoded credentials or connection strings
3. WHEN the Supabase MCP Server executes queries, THE Database SHALL enforce Row Level Security policies
4. THE Supabase MCP Server SHALL log all database operations for audit purposes

### Requirement 5

**User Story:** As a developer, I want documentation on available MCP Supabase tools, so that I understand what operations the AI assistant can perform

#### Acceptance Criteria

1. THE Requirements Document SHALL list all available MCP tools provided by the Supabase server
2. THE Requirements Document SHALL describe the purpose and parameters of each MCP tool
3. THE Requirements Document SHALL provide examples of common use cases for MCP Supabase tools
4. WHERE the developer needs to test MCP tools, THE Documentation SHALL include testing instructions

## Available MCP Supabase Tools

The Supabase MCP server provides the following tools:

1. **supabase_query**: Execute SQL queries against the database
   - Parameters: `query` (SQL string), `params` (optional query parameters)
   - Use case: Retrieve user progress, analyze learning patterns, generate reports

2. **supabase_get_schema**: Retrieve database schema information
   - Parameters: `table_name` (optional, returns all tables if omitted)
   - Use case: Understand database structure, validate queries, explore relationships

3. **supabase_list_tables**: List all tables in the database
   - Parameters: None
   - Use case: Discover available data sources, validate table names

4. **supabase_get_table_info**: Get detailed information about a specific table
   - Parameters: `table_name` (required)
   - Use case: Understand column types, constraints, and indexes for a specific table

## Testing Instructions

1. Configure the MCP server in `.mcp.json`
2. Set environment variables in `.env.local`
3. Restart the Kiro AI assistant to load the new MCP server
4. Test schema retrieval: Ask AI to "list all tables in the database"
5. Test query execution: Ask AI to "show me the latest user achievements"
6. Verify RLS policies: Attempt to query data without proper authentication context
