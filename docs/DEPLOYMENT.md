# Deployment & Operations Guide

This guide covers deployment procedures, operational tasks, and maintenance for the Sakneen Status Monitor.

## 🚀 Deployment Process

### Automatic Deployment

The system uses GitHub Actions for automatic deployment:

1. **Configuration Changes**: Edit `.upptimerc.yml`
2. **Commit & Push**: Changes trigger automatic workflows
3. **GitHub Actions**: Processes configuration and updates monitoring
4. **Status Page**: Automatically deployed to GitHub Pages

### Manual Deployment

For manual deployment or troubleshooting:

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YourUsername/uptime-status.git
cd uptime-status

# 3. Make configuration changes
vim .upptimerc.yml

# 4. Commit and push
git add .upptimerc.yml
git commit -m "Update monitoring configuration"
git push origin master

# 5. GitHub Actions will automatically deploy
```

## ⚙️ Configuration Management

### Environment Variables

Required environment variables (set in GitHub repository secrets):

```bash
# Service URLs (set in GitHub Secrets)
BACKEND_PRODUCTION_URL=https://api.sakneen.com
BACKEND_DEVELOPMENT_URL=https://dev-api.sakneen.com
SAAS_PRODUCTION_URL=https://app.sakneen.com
SAAS_DEVELOPMENT_URL=https://dev-app.sakneen.com
MANAGE_PRODUCTION_URL=https://manage.sakneen.com
MANAGE_DEVELOPMENT_URL=https://dev-manage.sakneen.com

# Optional: Notification webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Optional: Email notifications
SMTP_USERNAME=notifications@sakneen.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=status@sakneen.com
EMAIL_TO=ops-team@sakneen.com
```

### Adding New Services

To add a new service to monitoring:

1. **Edit Configuration**:
```yaml
sites:
  - name: New Service Name
    url: $NEW_SERVICE_URL
    icon: https://img.sakneen.com/logos-email/logo_rOc78V2s7.png
    method: GET
    maxResponseTime: 5000
    expectedStatusCodes:
      - 200
      - 201
```

2. **Add Environment Variable**: Add `NEW_SERVICE_URL` to GitHub secrets

3. **Commit Changes**: Push configuration update

4. **Verify Deployment**: Check status page updates

### Removing Services

To remove a service from monitoring:

1. **Remove from Configuration**: Delete service entry from `.upptimerc.yml`
2. **Clean Up Files**: Remove associated history and graph files
3. **Update Documentation**: Remove references from README

## 🔧 Operational Tasks

### Monitoring Health Checks

Daily operational checks:

1. **Status Page Accessibility**: Verify [status.sakneen.com](https://status.sakneen.com) loads
2. **GitHub Actions**: Check workflow runs in Actions tab
3. **Data Updates**: Confirm recent commits for data updates
4. **Service Status**: Review current status of all monitored services

### Weekly Reviews

1. **Performance Trends**: Review response time graphs
2. **Uptime Statistics**: Check uptime percentages
3. **Failed Checks**: Investigate any monitoring failures
4. **Configuration Updates**: Review and apply any pending changes

### Monthly Maintenance

1. **Dependency Updates**: Update Upptime version if needed
2. **Security Review**: Check for security advisories
3. **Capacity Planning**: Assess monitoring coverage gaps
4. **Documentation Updates**: Update guides and procedures

## 📊 Monitoring & Alerting

### GitHub Actions Workflows

Current workflows and their purposes:

- **uptime.yml**: Main monitoring (every 5 minutes)
- **response-time.yml**: Response time tracking (daily)
- **graphs.yml**: Generate performance graphs (daily)
- **site.yml**: Status website generation (on changes)
- **summary.yml**: Summary statistics (daily)
- **update-template.yml**: Template updates (weekly)

### Alert Configuration

Current alerting mechanisms:

1. **GitHub Issues**: Automatic incident creation
2. **Status Page**: Real-time status updates
3. **GitHub Notifications**: Workflow failure alerts

Future alerting options:

```yaml
# Add to .upptimerc.yml when ready
notifications:
  - type: slack
    webhook: $SLACK_WEBHOOK_URL
  - type: discord
    webhook: $DISCORD_WEBHOOK_URL
  - type: email
    smtpHost: smtp.gmail.com
    smtpPort: 587
    smtpUsername: $SMTP_USERNAME
    smtpPassword: $SMTP_PASSWORD
    emailFrom: $EMAIL_FROM
    emailTo: $EMAIL_TO
```

## 🐛 Troubleshooting

### Common Issues

#### Workflow Failures

**Problem**: GitHub Actions failing
**Solution**:
1. Check Actions tab for error details
2. Verify environment variables are set
3. Check service URL accessibility
4. Review configuration syntax

#### Status Page Not Updating

**Problem**: Status page shows outdated information
**Solution**:
1. Check if GitHub Pages is enabled
2. Verify CNAME file contains correct domain
3. Check DNS configuration for custom domain
4. Force workflow run if needed

#### Service False Positives

**Problem**: Service reported as down when it's actually up
**Solution**:
1. Check service URL accessibility
2. Review expected status codes
3. Adjust timeout settings if needed
4. Verify service health endpoint

#### Missing Data

**Problem**: Gaps in historical data
**Solution**:
1. Check workflow execution history
2. Verify repository permissions
3. Review commit history for data updates
4. Check for GitHub API rate limits

### Emergency Procedures

#### Complete System Failure

1. **Check GitHub Status**: Verify GitHub services are operational
2. **Repository Access**: Ensure repository is accessible
3. **Fallback Monitoring**: Use alternative monitoring tools
4. **Communication**: Update stakeholders via other channels

#### Data Corruption

1. **Stop Workflows**: Disable automatic updates temporarily
2. **Backup**: Create repository backup
3. **Restore**: Restore from known good state
4. **Verification**: Test monitoring functionality
5. **Resume**: Re-enable automatic workflows

## 🔒 Security Considerations

### Access Control

- **Repository Permissions**: Limited to authorized team members
- **Secret Management**: Use GitHub Secrets for sensitive data
- **Branch Protection**: Protect main branch from direct pushes
- **Review Requirements**: Require pull request reviews

### Data Privacy

- **Public Repository**: All monitoring data is public
- **URL Sanitization**: Ensure no sensitive data in URLs
- **Log Management**: Monitor for accidental exposure
- **Compliance**: Follow data protection requirements

### Monitoring Security

- **Service Authentication**: Monitor public endpoints only
- **Rate Limiting**: Respect service rate limits
- **User Agent**: Use identifiable user agent string
- **SSL/TLS**: Prefer HTTPS monitoring endpoints

## 🔄 Backup & Recovery

### Data Backup

The system automatically backs up data through Git:

- **Historical Data**: All data committed to repository
- **Configuration**: Version controlled in Git
- **Graphs**: Generated files committed regularly
- **Status Pages**: Deployed to GitHub Pages

### Recovery Procedures

#### Configuration Recovery

1. **Git History**: Use git log to find working configuration
2. **Revert Changes**: git revert to restore previous state
3. **Manual Restore**: Edit configuration files directly
4. **Verification**: Test restored configuration

#### Data Recovery

1. **Repository Clone**: Clone clean copy of repository
2. **Data Import**: Import historical data if needed
3. **Workflow Restart**: Re-enable monitoring workflows
4. **Validation**: Verify data integrity

## 📈 Performance Optimization

### Monitoring Efficiency

- **Optimal Frequency**: Balance monitoring coverage vs resource usage
- **Response Timeouts**: Set appropriate timeouts per service
- **Status Code Validation**: Specific expected codes vs generic success
- **Resource Usage**: Monitor GitHub Actions usage limits

### Status Page Performance

- **Image Optimization**: Optimize logos and graphs for web
- **Caching**: Leverage GitHub Pages caching
- **CDN Usage**: Use CDN for static assets when possible
- **Mobile Optimization**: Ensure mobile-friendly status page

## 📞 Support & Escalation

### Support Levels

**Level 1**: Basic operational issues
- Team member investigation
- Standard troubleshooting procedures
- Documentation consultation

**Level 2**: Complex technical issues
- Advanced troubleshooting
- Configuration problems
- Integration issues

**Level 3**: Critical system failures
- Emergency response procedures
- External vendor escalation
- Business impact mitigation

### Contact Information

- **Primary**: GitHub Issues for non-urgent matters
- **Secondary**: Direct team communication for urgent issues
- **Emergency**: Follow organizational escalation procedures

---

*This guide should be reviewed and updated regularly to reflect current operational procedures and lessons learned.*
