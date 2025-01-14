# AnyTrace Design Document

## Core Concepts

### Samplers
A sampler is a configured script that:
- Takes a fixed set of typed input variables (strings and flags) as environment variables
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
   - Command to execute with variable interpolation
   - Timeout settings
   - Variable descriptions (optional)
   
2. Flow definitions:
   - Name and ID
   - Ordered list of sampler references

## Execution Model

1. UI Flow List:
   - Shows all configured flows
   - Real-time search filtering
   - Click to trace execution

2. Variable Collection:
   - On flow selection, scans all listed samplers
   - Queries deduplicated required variables

3. Execution:
   - Runs all samplers in parallel
   - Shows execution progress with spinners
   - Timeout monitoring

4. Results Display:
   - Green check: Sampler found match (success)
   - Grey dash: No match found (neutral)
   - Red X: Error or timeout (failure)
   - Collapsible output view
   - Real-time updates as samplers complete

## Example Configuration

```yaml
samplers:
  - id: nginx_access
    name: "Nginx Access Logs"
    variables:
      - name: request_id
        type: string
        description: "Request ID to trace"
    command: "grep ${request_id} /var/log/nginx/access.log"
    timeout: 30
  - id: app_logs
    name: "Application Logs" 
    variables:
      - name: request_id
        type: string
    command: "grep ${request_id} /var/log/app.log"
    timeout: 30

flows:
  - id: http_request_trace
    name: "HTTP Request Flow"
    samplers:
      - nginx_access
      - app_logs
```

## Security Considerations

- Samplers execute arbitrary commands
- Input validation is critical
- Prevent command injection!
- Timeout enforcement
- Resource usage limits
