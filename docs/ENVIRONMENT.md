# Environment Variables Configuration

This document outlines the required environment variables for the Sakneen Status Monitor.

## Required Variables

These environment variables must be set in your GitHub repository secrets:

### Service URLs
```bash
# Production Services
BACKEND_PRODUCTION_URL=https://api.sakneen.com/health
SAAS_PRODUCTION_URL=https://app.sakneen.com
MANAGE_PRODUCTION_URL=https://manage.sakneen.com

# Development Services  
BACKEND_DEVELOPMENT_URL=https://dev-api.sakneen.com/health
SAAS_DEVELOPMENT_URL=https://dev-app.sakneen.com
MANAGE_DEVELOPMENT_URL=https://dev-manage.sakneen.com
```

### Email Notifications
```bash
# SMTP Configuration
SMTP_USERNAME=notifications@sakneen.com
SMTP_PASSWORD=your-app-specific-password

# Email addresses (can be comma-separated for multiple recipients)
EMAIL_FROM=noreply@sakneen.com
EMAIL_TO=milad@sakneen.com,ops@sakneen.com
```

### Optional Integrations
```bash
# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Discord Integration (Optional) 
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK

# GitHub Personal Access Token (Optional - for enhanced GitHub API access)
GH_PAT=ghp_your-personal-access-token-here
```

## Setting Up Environment Variables

### 1. In GitHub Repository

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Select **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each variable name and value
6. Click **Add secret**

### 2. Gmail App Password Setup

For Gmail SMTP:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings
3. Security → 2-Step Verification → App passwords
4. Generate an app password for "Mail"
5. Use this password as `SMTP_PASSWORD`

### 3. Security Best Practices

- ✅ **Never commit secrets to your repository**
- ✅ **Use app-specific passwords for email**
- ✅ **Regularly rotate passwords and tokens**
- ✅ **Limit GitHub Personal Access Token permissions**
- ✅ **Monitor secret usage in Actions logs**

## Validation

You can validate your environment variables are set correctly by:

1. Checking GitHub Actions logs
2. Running a test workflow
3. Verifying email notifications work
4. Confirming service URLs are accessible

## Troubleshooting

### Common Issues

**Email notifications not working:**
- Check SMTP credentials
- Verify app password is correct
- Ensure 2FA is enabled for Gmail
- Check spam folder

**Service monitoring failing:**
- Verify service URLs are accessible
- Check expected status codes
- Validate SSL certificates
- Review network connectivity

**GitHub Actions errors:**
- Confirm all required secrets are set
- Check secret names match exactly
- Verify repository permissions
- Review Actions workflow logs

## Example Configuration

Here's a complete example of the environment variables needed:

```bash
# Service Monitoring
BACKEND_PRODUCTION_URL=https://api.sakneen.com/health
BACKEND_DEVELOPMENT_URL=https://dev-api.sakneen.com/health
SAAS_PRODUCTION_URL=https://app.sakneen.com
SAAS_DEVELOPMENT_URL=https://dev-app.sakneen.com
MANAGE_PRODUCTION_URL=https://manage.sakneen.com
MANAGE_DEVELOPMENT_URL=https://dev-manage.sakneen.com

# Email Notifications
SMTP_USERNAME=status@sakneen.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop
EMAIL_FROM=noreply@sakneen.com
EMAIL_TO=milad@sakneen.com

# Optional: Enhanced GitHub API access
GH_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Contact

For help with environment variable configuration:

- **GitHub Issues**: [Create an issue](https://github.com/Sakneen/uptime-status/issues)
- **Documentation**: [Upptime Docs](https://upptime.js.org/docs/configuration)
- **Email**: technical-support@sakneen.com
