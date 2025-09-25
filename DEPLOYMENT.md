# AI Monitoring Agent - Deployment Guide

## Package Contents

This package contains a complete, ready-to-deploy AI monitoring solution for Windows environments.

### Files Included

- `standalone-agent.js` - Main application (no dependencies required)
- `deploy.bat` - Automated deployment script
- `install-service.bat` - Windows service installation
- `uninstall-service.bat` - Windows service removal
- `README.md` - Complete documentation
- `config/default.json` - Configuration template
- `package.json` - Node.js package configuration

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Extract the package** to your desired location (e.g., `C:\AIMonitoring\`)

2. **Run the deployment script**:
   ```cmd
   deploy.bat
   ```

3. **Follow the on-screen instructions**

### Option 2: Manual Deployment

1. **Check Prerequisites**:
   - Windows 10/11 or Windows Server 2016+
   - Node.js 18+ installed
   - PowerShell execution policy allows script execution

2. **Test the Agent**:
   ```cmd
   node standalone-agent.js test
   ```

3. **Start the Agent**:
   ```cmd
   node standalone-agent.js start
   ```

## Production Deployment

### Install as Windows Service

For production environments, install the agent as a Windows service:

1. **Open Command Prompt as Administrator**

2. **Navigate to the installation directory**:
   ```cmd
   cd C:\AIMonitoring
   ```

3. **Install the service**:
   ```cmd
   install-service.bat
   ```

4. **Verify installation**:
   - Open Services (services.msc)
   - Look for "AI Monitoring Agent"
   - Verify it's running and set to "Automatic" startup

### Service Management

- **Start Service**: `net start "AI Monitoring Agent"`
- **Stop Service**: `net stop "AI Monitoring Agent"`
- **Restart Service**: `net stop "AI Monitoring Agent" && net start "AI Monitoring Agent"`
- **Uninstall Service**: Run `uninstall-service.bat` as Administrator

## Configuration

### Default Behavior

The agent comes pre-configured with:
- **Process Monitoring**: Detects AI tools in running processes
- **Window Monitoring**: Monitors window titles for AI-related content
- **Policy Engine**: Prompts users for AI tool usage decisions
- **Response System**: Shows notifications and can block processes

### Supported AI Tools (Out of the Box)

- ChatGPT (OpenAI)
- Claude AI (Anthropic)
- GitHub Copilot
- Google Bard/Gemini
- And many more...

### Customization

To customize the agent behavior, modify the configuration in `standalone-agent.js`:

```javascript
// AI tool signatures
this.aiSignatures = [
  { name: 'Custom AI Tool', processNames: ['customai'], windowTitlePatterns: ['Custom AI'] }
];

// Default policy action
this.defaultAction = 'prompt'; // 'allow', 'block', or 'prompt'
```

## Monitoring and Logs

### Real-time Monitoring

When running interactively, the agent displays:
- Detection events
- Policy decisions
- User responses
- System status

### Log Files

When running as a service, logs are available in:
- Windows Event Viewer (Application and Services Logs)
- Console output (when running interactively)

### Status Checking

```cmd
# Check agent status
node standalone-agent.js status

# Check Windows service status
sc query "AI Monitoring Agent"
```

## Troubleshooting

### Common Issues

1. **"Node.js not found"**
   - Install Node.js from https://nodejs.org/
   - Ensure it's added to system PATH

2. **"PowerShell execution policy error"**
   - Run as Administrator: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

3. **"Service won't start"**
   - Check Windows Event Logs
   - Verify Node.js installation
   - Ensure proper file permissions

4. **"No AI tools detected"**
   - Verify AI tools are running
   - Check window titles match expected patterns
   - Review detection signatures

### Debug Mode

For detailed troubleshooting, modify the Logger class in `standalone-agent.js` to show debug messages:

```javascript
debug(message, data) {
  console.log(`[DEBUG] [${this.name}] ${message}`, data ? JSON.stringify(data) : '');
}
```

## Security Considerations

### Permissions

The agent requires:
- **Process enumeration**: To detect running AI tools
- **Window access**: To read window titles
- **Network monitoring**: To detect AI service connections
- **User interface**: To show prompts and notifications

### Data Privacy

The agent:
- Does NOT capture or store user content
- Only logs metadata about AI tool usage
- Respects user privacy settings
- Can be configured for minimal data collection

### Network Security

- No external network connections required
- All processing happens locally
- Optional centralized logging can be configured

## Enterprise Deployment

### Group Policy Deployment

1. Create MSI package using WiX or similar tools
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

## Support

### Getting Help

1. Check the troubleshooting section above
2. Review log files for error messages
3. Test with `node standalone-agent.js test`
4. Verify system requirements

### Reporting Issues

When reporting issues, include:
- Windows version
- Node.js version
- Error messages from logs
- Steps to reproduce the issue

## License

This software is provided under the MIT License. See LICENSE file for details.

---

**Note**: This software is designed for legitimate monitoring and compliance purposes. Ensure you comply with all applicable laws and regulations regarding employee monitoring and privacy in your jurisdiction.