# AnyTrace Design Document

## Core Concepts

### Samplers
A sampler is a configured script that:
- Takes a fixed set of typed input variables (strings and flags for now) as environment variables
- Executes an arbitrary command (e.g., grep, network requests)
- Outputs matching log entries or line-based content
- Has a configurable timeout
- Can indicate errors by writing to stderr

### Flows
A flow represents an end-to-end system trace and consists of:
- An ordered list of samplers
- A unique name and identifier
- The combined set of required variables from all its samplers (implicit)

## Configuration

All configuration is stored in a central YAML file that defines:
1. Sampler definitions:
   - Name and ID
   - Required variables and their types
   - Command to execute
   - Timeout settings
   
2. Flow definitions:
   - Name and ID
   - Ordered list of sampler references
   
## Execution Model

1. UI Flow List:
   - Shows all configured flows
   - Provides filtering capabilities
   - Allows flow selection

2. Variable Collection:
   - On flow selection, scans all referenced samplers
   - Aggregates unique required variables
   - Presents a dynamic form with typed input fields

3. Execution:
   - Runs all samplers in parallel when variables are provided
   - Shows execution progress with spinners
   - Timeout monitoring for each sampler

4. Results Display:
   - Green check: Sampler found matching lines (success)
   - Grey dash: No matches found (neutral)
   - Red X: Error output or timeout (failure)
   - Collapsible output display for each sampler

## Example Configuration

```yaml
samplers:
  - id: nginx_access
    name: "Nginx Access Logs"
    variables:
      - name: request_id
        type: string
    command: "grep ${request_id} /var/log/nginx/access.log"
    timeout: 30s
  - id: ...

flows:
  - id: http_request_trace
    name: "HTTP Request Flow"
    samplers:
      - nginx_access
      - app_logs
      - db_queries
```

## Security Considerations

- Samplers execute arbitrary commands
- Input validation is critical
- Environment variable sanitization
  - Though the UI cannot write arbitrary variables at least. Beware injection!
- Timeout enforcement
- Resource usage limits
