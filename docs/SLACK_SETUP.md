# 📢 Slack Integration Setup Guide

This guide explains how to set up Slack notifications for your Sakneen Status Monitor.

## 🔧 Prerequisites

- Slack workspace with admin access
- GitHub repository secrets access
- Upptime monitoring already configured

## 📋 Setup Steps

### 1. Create Slack Webhook

1. **Go to Slack API**: Visit [api.slack.com/apps](https://api.slack.com/apps)
2. **Create New App**: Click "Create New App" → "From scratch"
3. **App Details**:
   - App Name: `Sakneen Status Monitor`
   - Workspace: Select your Sakneen workspace
4. **Enable Incoming Webhooks**:
   - Go to "Incoming Webhooks" in the sidebar
   - Toggle "Activate Incoming Webhooks" to **On**
5. **Add Webhook to Workspace**:
   - Click "Add New Webhook to Workspace"
   - Select the channel (e.g., `#alerts`, `#ops`, `#monitoring`)
   - Click "Allow"
6. **Copy Webhook URL**: Save the webhook URL (starts with `https://hooks.slack.com/services/...`)

### 2. Configure GitHub Secrets

Add the webhook URL to your GitHub repository secrets:

1. Go to your repository: `https://github.com/Sakneen/uptime-status`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add secret:
   - **Name**: `SLACK_WEBHOOK_URL`
   - **Value**: Your Slack webhook URL from step 1

### 3. Verify Configuration

Your `.upptimerc.yml` has been updated with Slack notifications that include:

- **Downtime Alerts**: 🚨 Immediate notifications when services go down
- **Recovery Notifications**: ✅ Alerts when services come back online
- **Professional Formatting**: Clean, informative messages with emojis
- **Direct Links**: Quick access to status dashboard and service details

## 📱 Notification Examples

### Downtime Alert
```
🚨 SERVICE ALERT 🚨

Service: Backend Production
Status: Down
Time: 2025-09-24T10:30:00Z
Response: 500 in 5000 ms
URL: https://api.sakneen.com

---
📊 View Details: https://status.sakneen.com/history/backend-production
🔍 Status Dashboard: https://status.sakneen.com

Sakneen Status Monitor
```

### Recovery Alert
```
✅ SERVICE RECOVERED ✅

Service: Backend Production
Status: Up
Recovery Time: 2025-09-24T10:35:00Z
Response: 200 in 450 ms
URL: https://api.sakneen.com

---
📊 View Details: https://status.sakneen.com/history/backend-production
🎉 All systems operational!

Sakneen Status Monitor
```

## 🔧 Customization Options

### Channel Configuration
You can customize the Slack channel in `.upptimerc.yml`:
```yaml
notifications:
  - type: slack
    channel: "#your-channel"  # Change this to your preferred channel
```

### Custom Emojis
Modify the notification icons:
```yaml
notifications:
  - type: slack
    icon_emoji: ":rotating_light:"  # For alerts
    icon_emoji: ":white_check_mark:"  # For recovery
```

### Bot Name
Change the notification bot name:
```yaml
notifications:
  - type: slack
    username: "Your Custom Bot Name"
```

## 🧪 Testing Setup

### Manual Test
1. **Trigger Workflow**: Go to Actions → "Uptime CI" → "Run workflow"
2. **Simulate Downtime**: Temporarily change a service URL to trigger a failure
3. **Check Slack**: Verify notifications appear in your configured channel

### GitHub Actions Test
```bash
# Trigger uptime check manually
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Sakneen/uptime-status/dispatches \
  -d '{"event_type":"uptime"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **No Notifications Received**:
   - Verify `SLACK_WEBHOOK_URL` secret is set correctly
   - Check webhook URL format (should start with `https://hooks.slack.com/services/`)
   - Ensure the Slack app has permission to post to the channel

2. **Formatting Issues**:
   - Slack uses Markdown-style formatting
   - Verify template syntax in `.upptimerc.yml`
   - Test with simple messages first

3. **Rate Limiting**:
   - Slack has rate limits for webhooks
   - `onlyOnChange: true` prevents spam (only notifies on status changes)

### Verification Steps

1. **Check GitHub Actions**: Look for successful "Uptime CI" runs
2. **Review Logs**: Check workflow logs for Slack notification attempts
3. **Test Webhook**: Use curl to test webhook directly:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message from Sakneen Status Monitor"}' \
     YOUR_SLACK_WEBHOOK_URL
   ```

## 📊 Monitoring Best Practices

### Channel Strategy
- **#alerts**: Critical downtime notifications
- **#ops**: Operational updates and recovery notifications  
- **#monitoring**: Detailed monitoring data and trends

### Escalation Path
1. **Immediate**: Slack notifications to #alerts
2. **Email**: Professional notifications to operations team
3. **GitHub Issues**: Detailed incident tracking and resolution

### Response Workflow
1. **Receive Slack Alert**: Team gets immediate notification
2. **Acknowledge**: React to message or respond in thread
3. **Investigate**: Use provided links to check status dashboard
4. **Resolve**: Fix issue and confirm recovery notification
5. **Post-mortem**: Review GitHub issue for incident details

## 🔐 Security Considerations

- **Webhook URL**: Keep webhook URL secure (GitHub secrets)
- **Channel Access**: Limit alert channels to operations team
- **Message Content**: Avoid sensitive data in notification templates
- **App Permissions**: Grant minimal required Slack app permissions

## 📞 Support

For issues with Slack integration:
- **GitHub Issues**: [Report technical issues](https://github.com/Sakneen/uptime-status/issues)
- **Slack Support**: [Slack API Documentation](https://api.slack.com/messaging/webhooks)
- **Upptime Docs**: [Notification Configuration](https://upptime.js.org/docs/configuration#notifications)

---

*Last updated: September 2025*  
*Part of Sakneen Status Monitor documentation suite*
