# AI Monitoring Agent

Enterprise-grade AI tool usage monitoring and control system for Windows environments.

## Overview

The AI Monitoring Agent is a comprehensive solution for monitoring, controlling, and auditing AI tool usage across corporate and educational environments. It provides real-time detection, policy-based responses, and detailed logging of AI tool interactions.

## Features

### 🔍 **Multi-Layer Detection**
- **Process Monitoring**: Detects AI tools through process enumeration and signature matching
- **Window Monitoring**: Identifies AI usage through window titles and content analysis
- **Network Monitoring**: Tracks connections to known AI service endpoints
- **Content Analysis**: Monitors clipboard and screen content for AI interactions

### 🛡️ **Policy Engine**
- **Rule-Based Control**: Flexible policy rules based on users, groups, time, and content
- **Active Directory Integration**: Seamless integration with existing user management
- **Time-Based Access**: Configure allowed hours and days for AI tool usage
- **Risk-Based Decisions**: Content analysis with automatic risk scoring

### ⚡ **Response System**
- **Interactive Prompts**: User-friendly dialogs for allow/block decisions
- **Automatic Actions**: Policy-driven automatic responses
- **Process Termination**: Immediate blocking of unauthorized AI tools
- **Notifications**: Toast notifications and email alerts

### 📊 **Comprehensive Logging**
- **Detailed Audit Trails**: Complete logging of all AI interactions
- **Multiple Formats**: CSV, JSON, and structured logging support
- **Centralized Logging**: Push logs to SMB, FTP, HTTP API, or syslog servers
- **Privacy-Aware**: Configurable content capture with privacy controls

### 🔧 **Enterprise Features**
- **Windows Service**: Runs as a background service with automatic startup
- **Remote Management**: Centralized policy distribution and monitoring
- **Tamper Protection**: Service watchdog and integrity checking
- **Scalable Architecture**: Supports large enterprise deployments

## Quick Start

### Prerequisites
- Windows 10/11 or Windows Server 2016+
- Node.js 18+ (download from https://nodejs.org/)
- Administrator privileges (for service installation)
- PowerShell execution policy set to RemoteSigned or less restrictive

### Installation

1. **Download and Extract**
   - Download the complete package
   - Extract to a folder (e.g., `C:\AIMonitoring\`)

2. **Quick Deployment**
   ```cmd
   # Run the deployment script
   deploy.bat
   ```

3. **Manual Installation**
   ```cmd
   # Test the agent
   node standalone-agent.js test
   
   # Start the agent interactively
   node standalone-agent.js start
   ```

4. **Service Installation** (Recommended for production)
   ```cmd
   # Run as Administrator
   install-service.bat
   ```

### Service Installation

1. **Install as Windows Service** (Run as Administrator)
   ```cmd
   install-service.bat
   ```

2. **Verify Service Status**
   ```cmd
   node standalone-agent.js status
   ```

3. **Uninstall Service** (if needed)
   ```cmd
   uninstall-service.bat
   ```

## Configuration

### Basic Configuration

Create a configuration file based on the template:

```bash
cp config/default.json config/production.json
```

Edit `config/production.json` to customize settings:

```json
{
  "agent": {
    "enableProcessMonitoring": true,
    "enableWindowMonitoring": true,
    "enableNetworkMonitoring": true,
    "scanInterval": 5000,
    "logLevel": "info"
  },
  "policy": {
    "defaultAction": "prompt",
    "enableTimeBasedRules": true,
    "enableUserGroupRules": true
  },
  "response": {
    "enablePopupAlerts": true,
    "enableProcessTermination": true,
    "popupTimeoutSeconds": 30
  }
}
```

### Policy Configuration

The system supports flexible policy rules:

```json
{
  "policies": [
    {
      "name": "Allow Administrators",
      "action": "allow",
      "conditions": [
        {
          "type": "userGroup",
          "groups": ["administrators"]
        }
      ]
    },
    {
      "name": "Business Hours Only",
      "action": "allow",
      "conditions": [
        {
          "type": "time",
          "allowedHours": { "start": 9, "end": 17 },
          "allowedDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
        }
      ]
    }
  ]
}
```

## Usage

### Command Line Interface

```cmd
# Start the agent interactively
node standalone-agent.js start

# Run test detection
node standalone-agent.js test

# Check status
node standalone-agent.js status

# Show help
node standalone-agent.js
```

### Advanced Usage

```cmd
# Install the Windows service without using batch scripts
npm run service:install

# Check the Windows service status
npm run service:status
```

## Monitoring and Detection

### Supported AI Tools

The system detects the following AI tools out of the box:

- **ChatGPT** (OpenAI)
- **Claude** (Anthropic)
- **Bard/Gemini** (Google)
- **GitHub Copilot**
- **Perplexity AI**
- **Character.AI**
- **Jasper AI**
- **Copy.ai**
- **Notion AI**
- **Grammarly**
- **QuillBot**
- And many more...

### Detection Methods

1. **Process Signature Matching**
   - Monitors running processes for known AI tool executables
   - Analyzes command-line arguments for AI-related indicators
   - Supports custom signature definitions

2. **Window Title Analysis**
   - Scans active window titles for AI-related keywords
   - Uses pattern matching and heuristic analysis
   - Extracts URLs from browser windows

3. **Network Connection Monitoring**
   - Tracks connections to known AI service domains
   - Monitors DNS queries for AI-related domains
   - Optional SSL certificate inspection

## Policy Management

### Policy Rules

Policies are evaluated in priority order and support multiple condition types:

- **User Conditions**: Specific users or user groups
- **Time Conditions**: Allowed hours and days
- **Device Conditions**: Specific devices or device types
- **Application Conditions**: Allowed applications
- **Content Conditions**: Risk-based content analysis

### Response Actions

- **Allow**: Permit the AI tool usage
- **Block**: Deny access and optionally terminate the process
- **Prompt**: Ask the user for permission

## Logging and Auditing

### Log Formats

The system supports multiple log formats:

- **Structured JSON**: Machine-readable format for analysis
- **CSV**: Spreadsheet-compatible format
- **Plain Text**: Human-readable format

### Log Destinations

- **Local Files**: Stored in configurable directory
- **SMB Shares**: Network file shares
- **FTP Servers**: Remote FTP/SFTP servers
- **HTTP APIs**: REST endpoints
- **Syslog**: Standard syslog protocol

### Sample Log Entry

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "eventId": "event_123_1705312200000",
  "eventType": "ai_tool_detected",
  "source": "process",
  "aiTool": "ChatGPT (Chrome)",
  "confidence": 0.95,
  "username": "john.doe",
  "processName": "chrome.exe",
  "windowTitle": "ChatGPT - OpenAI",
  "decision": "allow",
  "userResponse": "allow",
  "metadata": {
    "detectionMethod": "window_title",
    "policyRulesMatched": ["business-hours-allow"]
  }
}
```

## Security Features

### Tamper Protection

- **Service Watchdog**: Automatically restarts the service if terminated
- **Integrity Checking**: Validates script hashes to detect modifications
- **Hidden Operation**: Can run via scheduled tasks for stealth deployment

### Privacy Controls

- **Configurable Content Capture**: Control what content is logged
- **Data Anonymization**: Option to hash or anonymize sensitive data
- **Retention Policies**: Automatic log cleanup and archival

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check Windows Event Logs
   - Verify Node.js installation
   - Ensure administrator privileges

2. **Detection Not Working**
   - Check scan intervals in configuration
   - Verify AI tool signatures are up to date
   - Review log files for errors

3. **Policy Not Applied**
   - Verify policy syntax in configuration
   - Check user group memberships
   - Review policy evaluation logs

### Debug Mode

Enable verbose output for detailed troubleshooting by running the agent interactively:

```bash
node standalone-agent.js start
```

### Log Locations

- **Application Logs**: `./logs/ai-monitoring.log`
- **Windows Event Logs**: Application and Services Logs > AI Monitoring Agent
- **Service Logs**: Windows Services management console

## Development

### Working with the Standalone Runtime

The distributed package runs directly from `standalone-agent.js`, so no TypeScript build step is required. Edit the file to experiment with new detections or policies and restart the agent to observe the changes.

```bash
# Install dependencies (optional, for testing or linting tools)
npm install

# Run the agent in test mode
npm test
```

### Project Structure

```
standalone-agent.js      # Main AI monitoring agent runtime
service-manager.js       # Windows service helper CLI
deploy.bat               # Guided deployment script
install-service.bat      # Service installation helper
service-start.bat        # Service start helper
service-stop.bat         # Service stop helper
service-status.bat       # Service status helper
uninstall-service.bat    # Service removal helper
README.md                # Product documentation
DEPLOYMENT.md            # Deployment guide
package.json             # npm metadata and scripts
```

### Testing

The standalone distribution does not require a build step, and automated tests are optional:

```bash
# Run the agent in test mode
npm test
```

## Enterprise Deployment

### Group Policy Deployment

1. Create MSI installer using tools like WiX
2. Deploy via Group Policy Software Installation
3. Configure policies through registry or configuration files

### Centralized Management

1. Set up central configuration server
2. Configure agents to pull policies from central location
3. Implement log aggregation and monitoring

### Scaling Considerations

- **Resource Usage**: Monitor CPU and memory usage
- **Network Impact**: Configure appropriate scan intervals
- **Storage Requirements**: Plan for log storage and retention

## Support and Contributing

### Getting Help

- Check the troubleshooting section
- Review log files for error messages
- Open an issue on the project repository

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- Multi-layer AI detection
- Policy-based response system
- Windows service support
- Comprehensive logging and auditing

---

**Note**: This software is designed for legitimate monitoring and compliance purposes. Ensure you comply with all applicable laws and regulations regarding employee monitoring and privacy in your jurisdiction.