/**
 * Standalone AI Monitoring Agent
 * Ready-to-run JavaScript version
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);
const STATUS_FILE_PATH = path.join(__dirname, 'agent-status.json');

class Logger {
  constructor(name) {
    this.name = name;
  }

  info(message, data) {
    console.log(`[INFO] [${this.name}] ${message}`, data ? JSON.stringify(data) : '');
  }

  warn(message, data) {
    console.warn(`[WARN] [${this.name}] ${message}`, data ? JSON.stringify(data) : '');
  }

  error(message, error) {
    console.error(`[ERROR] [${this.name}] ${message}`, error ? error.message : '');
  }

  debug(message, data) {
    console.log(`[DEBUG] [${this.name}] ${message}`, data ? JSON.stringify(data) : '');
  }
}

class ProcessDetection {
  constructor() {
    this.logger = new Logger('ProcessDetection');
    this.isRunning = false;
    this.aiSignatures = [
      { name: 'ChatGPT (Chrome)', processNames: ['chrome'], windowTitlePatterns: ['ChatGPT', 'OpenAI'] },
      { name: 'Claude AI', processNames: ['chrome', 'firefox'], windowTitlePatterns: ['Claude', 'Anthropic'] },
      { name: 'GitHub Copilot', processNames: ['code'], windowTitlePatterns: ['Copilot', 'Visual Studio Code'] }
    ];
  }

  async start() {
    this.isRunning = true;
    this.logger.info('Process detection started');
  }

  async stop() {
    this.isRunning = false;
    this.logger.info('Process detection stopped');
  }

  async getRunningProcesses() {
    try {
      const command = `
        Get-Process | Select-Object Id, ProcessName, MainWindowTitle | 
        Where-Object { $_.MainWindowTitle -ne "" } |
        ConvertTo-Json -Depth 2
      `;

      const { stdout } = await execAsync(`powershell -Command "${command}"`);
      
      if (!stdout.trim()) return [];

      const processData = JSON.parse(stdout);
      const processes = Array.isArray(processData) ? processData : [processData];
      
      return processes.map(p => ({
        id: p.Id,
        name: p.ProcessName,
        windowTitle: p.MainWindowTitle
      }));
    } catch (error) {
      this.logger.error('Failed to get processes', error);
      return [];
    }
  }

  async matchAITool(process) {
    for (const signature of this.aiSignatures) {
      // Check process name
      const processMatch = signature.processNames.some(name => 
        process.name.toLowerCase().includes(name.toLowerCase())
      );

      // Check window title
      const titleMatch = process.windowTitle && signature.windowTitlePatterns.some(pattern =>
        process.windowTitle.toLowerCase().includes(pattern.toLowerCase())
      );

      if (processMatch && titleMatch) {
        return {
          signature,
          confidence: 0.9,
          matchType: 'process',
          matchDetails: { processMatch, titleMatch }
        };
      }
    }
    return null;
  }
}

class PolicyEngine {
  constructor() {
    this.logger = new Logger('PolicyEngine');
    this.isRunning = false;
    this.defaultAction = 'prompt';
  }

  async start() {
    this.isRunning = true;
    this.logger.info('Policy engine started');
  }

  async stop() {
    this.isRunning = false;
    this.logger.info('Policy engine stopped');
  }

  async evaluatePolicy(event, context) {
    // Simple policy: prompt for all AI tools
    return {
      decision: this.defaultAction,
      matchedRules: [],
      confidence: 0.8,
      reasoning: ['Default policy applied'],
      metadata: { evaluationTime: new Date() }
    };
  }

  isEngineRunning() {
    return this.isRunning;
  }
}

class ResponseExecutor {
  constructor() {
    this.logger = new Logger('ResponseExecutor');
  }

  async executeResponse(decision, event, context) {
    this.logger.info('Executing response', { decision, eventId: event.id });

    switch (decision) {
      case 'allow':
        return await this.executeAllow(event);
      case 'block':
        return await this.executeBlock(event);
      case 'prompt':
        return await this.executePrompt(event);
      default:
        return { success: false, action: 'unknown', message: 'Unknown decision' };
    }
  }

  async executeAllow(event) {
    this.logger.info('Allowing AI tool usage', { aiTool: event.aiTool });
    
    // Show toast notification
    await this.showToast('AI Tool Access Allowed', `Access to ${event.aiTool} has been allowed.`);
    
    return {
      success: true,
      action: 'allow',
      message: `AI tool usage allowed for ${event.aiTool}`
    };
  }

  async executeBlock(event) {
    this.logger.info('Blocking AI tool usage', { aiTool: event.aiTool });
    
    // Show toast notification
    await this.showToast('AI Tool Access Blocked', `Access to ${event.aiTool} has been blocked by policy.`);
    
    // Optionally terminate process
    if (event.processId) {
      try {
        await execAsync(`taskkill /PID ${event.processId} /F`);
        this.logger.info('Process terminated', { processId: event.processId });
      } catch (error) {
        this.logger.error('Failed to terminate process', error);
      }
    }
    
    return {
      success: true,
      action: 'block',
      message: `AI tool usage blocked for ${event.aiTool}`
    };
  }

  async executePrompt(event) {
    this.logger.info('Prompting user for decision', { aiTool: event.aiTool });
    
    try {
      const userChoice = await this.showUserPrompt(event);
      
      if (userChoice === 'allow') {
        return await this.executeAllow(event);
      } else {
        return await this.executeBlock(event);
      }
    } catch (error) {
      this.logger.error('Prompt failed, defaulting to block', error);
      return await this.executeBlock(event);
    }
  }

  async showUserPrompt(event) {
    const powershellScript = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing

      $form = New-Object System.Windows.Forms.Form
      $form.Text = "AI Monitoring Alert"
      $form.Size = New-Object System.Drawing.Size(500, 250)
      $form.StartPosition = "CenterScreen"
      $form.TopMost = $true

      $label = New-Object System.Windows.Forms.Label
      $label.Location = New-Object System.Drawing.Point(20, 20)
      $label.Size = New-Object System.Drawing.Size(450, 80)
      $label.Text = "AI tool usage detected:\\n\\nTool: ${event.aiTool}\\nApplication: ${event.processName}\\n\\nDo you want to allow this activity?"
      $form.Controls.Add($label)

      $allowButton = New-Object System.Windows.Forms.Button
      $allowButton.Location = New-Object System.Drawing.Point(150, 120)
      $allowButton.Size = New-Object System.Drawing.Size(80, 30)
      $allowButton.Text = "Allow"
      $allowButton.DialogResult = [System.Windows.Forms.DialogResult]::Yes
      $form.Controls.Add($allowButton)

      $blockButton = New-Object System.Windows.Forms.Button
      $blockButton.Location = New-Object System.Drawing.Point(250, 120)
      $blockButton.Size = New-Object System.Drawing.Size(80, 30)
      $blockButton.Text = "Block"
      $blockButton.DialogResult = [System.Windows.Forms.DialogResult]::No
      $form.Controls.Add($blockButton)

      $result = $form.ShowDialog()

      switch ($result) {
        "Yes" { Write-Output "allow" }
        "No" { Write-Output "block" }
        default { Write-Output "block" }
      }
    `;

    try {
      const { stdout } = await execAsync(`powershell -Command "${powershellScript.replace(/"/g, '`"')}"`);
      return stdout.trim();
    } catch (error) {
      this.logger.error('Failed to show prompt', error);
      return 'block';
    }
  }

  async showToast(title, message) {
    try {
      const toastScript = `
        Add-Type -AssemblyName System.Windows.Forms
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipIcon = "Info"
        $notification.BalloonTipText = "${message}"
        $notification.BalloonTipTitle = "${title}"
        $notification.Visible = $true
        $notification.ShowBalloonTip(5000)
        Start-Sleep -Seconds 1
        $notification.Dispose()
      `;

      await execAsync(`powershell -Command "${toastScript.replace(/"/g, '`"')}"`);
    } catch (error) {
      this.logger.error('Failed to show toast', error);
    }
  }
}

class AIMonitoringAgent {
  constructor() {
    this.logger = new Logger('AIMonitoringAgent');
    this.processDetection = new ProcessDetection();
    this.policyEngine = new PolicyEngine();
    this.responseExecutor = new ResponseExecutor();
    this.isRunning = false;
    this.eventCounter = 0;
    this.statusFilePath = STATUS_FILE_PATH;
    this.startedAt = null;
  }

  async persistStatus() {
    if (!this.isRunning) {
      return;
    }

    const status = this.getStatus();

    try {
      await fs.promises.writeFile(
        this.statusFilePath,
        JSON.stringify(status, null, 2),
        'utf8'
      );
    } catch (error) {
      this.logger.error('Failed to write status file', error);
    }
  }

  async clearStatus() {
    try {
      await fs.promises.unlink(this.statusFilePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error('Failed to clear status file', error);
      }
    }
  }

  async start() {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    try {
      this.logger.info('Starting AI Monitoring Agent');

      await this.processDetection.start();
      await this.policyEngine.start();

      this.setupMonitoring();

      this.isRunning = true;
      this.startedAt = new Date().toISOString();
      await this.persistStatus();
      this.logger.info('AI Monitoring Agent started successfully');
    } catch (error) {
      this.logger.error('Failed to start agent', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) {
      this.logger.warn('Agent is not running');
      return;
    }

    try {
      this.logger.info('Stopping AI Monitoring Agent');

      await this.processDetection.stop();
      await this.policyEngine.stop();

      this.isRunning = false;
      this.startedAt = null;
      await this.clearStatus();
      this.logger.info('AI Monitoring Agent stopped successfully');
    } catch (error) {
      this.logger.error('Failed to stop agent', error);
      throw error;
    }
  }

  getStatus() {
    return {
      pid: process.pid,
      isRunning: this.isRunning,
      startedAt: this.startedAt,
      updatedAt: new Date().toISOString(),
      eventsProcessed: this.eventCounter,
      components: {
        processDetection: this.processDetection.isRunning,
        policyEngine: this.policyEngine.isEngineRunning()
      }
    };
  }

  setupMonitoring() {
    // Monitor processes every 5 seconds
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const processes = await this.processDetection.getRunningProcesses();
        for (const process of processes) {
          const aiMatch = await this.processDetection.matchAITool(process);
          if (aiMatch) {
            await this.handleDetection('process', process, aiMatch);
          }
        }
      } catch (error) {
        this.logger.error('Error in process monitoring', error);
      } finally {
        await this.persistStatus();
      }
    }, 5000);
  }

  async handleDetection(source, detectionData, aiMatch) {
    try {
      this.eventCounter++;
      
      const event = {
        id: `event_${this.eventCounter}_${Date.now()}`,
        timestamp: new Date(),
        eventType: 'ai_tool_detected',
        source,
        aiTool: aiMatch.signature.name,
        confidence: aiMatch.confidence,
        processId: detectionData.id,
        processName: detectionData.name,
        username: process.env.USERNAME || 'Unknown',
        windowTitle: detectionData.windowTitle,
        metadata: {
          detectionSource: source,
          matchDetails: aiMatch.matchDetails
        }
      };

      this.logger.info('AI usage detected', { 
        eventId: event.id, 
        aiTool: event.aiTool, 
        source: event.source,
        confidence: event.confidence 
      });

      // Create policy context
      const context = {
        user: {
          username: event.username,
          groups: [],
          permissions: []
        },
        device: {
          id: process.env.COMPUTERNAME || 'Unknown',
          name: process.env.COMPUTERNAME || 'Unknown',
          type: 'Windows'
        }
      };

      // Evaluate policy
      const policyResult = await this.policyEngine.evaluatePolicy(event, context);
      
      this.logger.info('Policy evaluation completed', {
        eventId: event.id,
        decision: policyResult.decision,
        confidence: policyResult.confidence
      });

      // Execute response
      const responseResult = await this.responseExecutor.executeResponse(
        policyResult.decision,
        event,
        { policyResult, context }
      );

      this.logger.info('Response executed', {
        eventId: event.id,
        action: responseResult.action,
        success: responseResult.success
      });

      await this.persistStatus();

    } catch (error) {
      this.logger.error('Error handling AI detection', error);
    }
  }

  async triggerTest() {
    this.logger.info('Triggering test detection');
    
    await this.handleDetection('test', { 
      id: process.pid, 
      name: 'node',
      windowTitle: 'Test AI Tool'
    }, {
      signature: { name: 'Test AI Tool' },
      confidence: 1.0,
      matchDetails: { test: true }
    });
  }
}

async function readSharedStatus() {
  try {
    const data = await fs.promises.readFile(STATUS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

// CLI
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start': {
      const agent = new AIMonitoringAgent();
      await agent.start();
      console.log('\n=== AI Monitoring Agent Started ===');
      console.log('The agent is now monitoring for AI tool usage.');
      console.log('Press Ctrl+C to stop.\n');

      // Keep alive
      process.on('SIGINT', async () => {
        console.log('\nStopping agent...');
        await agent.stop();
        console.log('Agent stopped successfully.');
        process.exit(0);
      });

      // Show status every 30 seconds
      setInterval(() => {
        const status = agent.getStatus();
        console.log(`[STATUS] Running: ${status.isRunning}, Events Processed: ${status.eventsProcessed}`);
        agent.persistStatus();
      }, 30000);

      break;
    }

    case 'test': {
      const agent = new AIMonitoringAgent();
      console.log('Starting test mode...');
      await agent.start();
      await agent.triggerTest();
      console.log('Test completed. Stopping agent...');
      setTimeout(async () => {
        await agent.stop();
        process.exit(0);
      }, 3000);
      break;
    }

    case 'status':
      console.log('\n=== Agent Status ===');
      try {
        const status = await readSharedStatus();

        if (!status) {
          console.log('Agent is not running or status file is missing.');
        } else {
          console.log(JSON.stringify(status, null, 2));
        }
      } catch (error) {
        console.error('Failed to read agent status:', error.message);
        process.exitCode = 1;
      }
      break;

    default:
      console.log(`
=== AI Monitoring Agent ===

Usage: node standalone-agent.js [command]

Commands:
  start   - Start the monitoring agent
  test    - Run a test detection
  status  - Show agent status

Examples:
  node standalone-agent.js start
  node standalone-agent.js test
  node standalone-agent.js status

The agent monitors for AI tool usage and provides policy-based responses.
      `);
      break;
  }
}
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AIMonitoringAgent };
