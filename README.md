# AnyTrace

Every time you want to know what happened in response to a web request,
you have to check logs in ten microservices before the response is sent.

The various log locations take time to memorize.

Instead, tell AnyTrace how to do it, and just enter your request ID.

You'll see at a glance where the request flow stopped.

## AI Disclaimer

This repository has been created almost entirely by Claude 3.5 Sonnet.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create a config.yaml file:
```yaml
samplers:
  - id: example_logs
    name: "Example Logs"
    variables:
      - name: request_id
        type: string
        description: "Request ID to trace"
        required: true
    command: "grep ${request_id} /var/log/example.log"
    timeout: 30

flows:
  - id: example_flow
    name: "Example Flow"
    samplers:
      - example_logs
```

3. Start the development server:
```bash
npm run dev
```

## Configuration

AnyTrace uses a YAML configuration file to define samplers and flows:

### Samplers
- Unique ID
- Required variables with types and descriptions
- Shell command with variable interpolation
- Timeout setting

### Flows
- Unique ID
- Ordered list of sampler references
- Variables automatically aggregated from samplers

### Custom Configuration Path
```bash
CONFIG_PATH=/path/to/config.yaml npm start
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

## Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Security Considerations

This tool executes shell commands with arbitrary parameters.
Please either limit access to trusted personnel only, or ensure that every sampler script correctly quotes every variable it uses.
