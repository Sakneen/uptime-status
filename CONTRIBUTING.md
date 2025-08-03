# Contributing to Sakneen Status Monitor

Thank you for your interest in contributing to Sakneen's uptime monitoring system! This document provides guidelines for contributing to our status monitoring infrastructure.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Configuration Changes](#configuration-changes)
- [Development Setup](#development-setup)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Respect privacy and security considerations
- Follow professional communication standards

## 🚀 How to Contribute

### Reporting Service Issues

If you notice a service outage or performance issue:

1. **Check Current Status**: Visit [status.sakneen.com](https://status.sakneen.com) first
2. **Review Existing Issues**: Check [GitHub Issues](https://github.com/Sakneen/uptime-status/issues)
3. **Create New Issue**: Use our issue templates for consistent reporting

### Suggesting New Monitoring

To request monitoring for new services:

1. **Open an Issue**: Use the "Service Request" template
2. **Provide Details**:
   - Service URL
   - Expected response codes
   - Service description
   - Business criticality
   - Monitoring frequency preference

### Configuration Improvements

For configuration enhancements:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/monitoring-enhancement`
3. **Edit Configuration**: Modify `.upptimerc.yml`
4. **Test Changes**: Ensure configuration is valid
5. **Submit Pull Request**: Include clear description of changes

## 🐛 Reporting Issues

### Service Outages

Use the **🚨 Service Incident Report** template with:

- **Affected Services**: Which services are impacted
- **Symptoms**: What you're experiencing
- **Time Noticed**: When the issue was first observed
- **Impact**: How this affects users/operations

### Performance Issues

Use the **📊 Performance Issue** template with:

- **Service Name**: Which service has performance issues
- **Metrics**: Current vs expected performance
- **Time Period**: When the degradation started
- **Impact Assessment**: User experience impact

### Bug Reports

For monitoring system bugs:

- **Clear Description**: What's wrong with the monitoring
- **Steps to Reproduce**: How to replicate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What's actually happening
- **Screenshots**: If applicable

## 💡 Suggesting Enhancements

We welcome suggestions for improving our monitoring system:

### Enhancement Requests

- **Use Case**: Why is this enhancement needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Any alternative approaches considered?
- **Impact**: Who benefits from this change?

### Common Enhancement Types

- **New Monitoring Endpoints**: Additional services to monitor
- **Alert Improvements**: Better notification systems
- **Dashboard Enhancements**: Status page improvements
- **Integration Requests**: Third-party service integrations
- **Performance Optimizations**: Monitoring efficiency improvements

## ⚙️ Configuration Changes

### .upptimerc.yml Structure

```yaml
# Main configuration sections:
sites:           # Services to monitor
status-website:  # Status page configuration  
workflowSchedule: # Monitoring frequency
notifications:   # Alert configurations
```

### Best Practices

1. **Validate URLs**: Ensure all monitored URLs are accessible
2. **Set Appropriate Timeouts**: Consider service response characteristics
3. **Use Descriptive Names**: Clear service identification
4. **Group Related Services**: Logical organization of services
5. **Document Changes**: Clear commit messages and PR descriptions

### Testing Changes

Before submitting configuration changes:

1. **Syntax Validation**: Ensure YAML is properly formatted
2. **URL Accessibility**: Verify all URLs are reachable
3. **Configuration Logic**: Check for conflicts or issues
4. **Impact Assessment**: Consider effects on existing monitoring

## 🛠️ Development Setup

### Prerequisites

- GitHub account with repository access
- Basic understanding of YAML configuration
- Familiarity with Upptime configuration options

### Local Testing

1. **Fork Repository**: Create your own copy
2. **Clone Locally**: `git clone https://github.com/YourUsername/uptime-status.git`
3. **Create Branch**: `git checkout -b your-feature-branch`
4. **Edit Configuration**: Modify `.upptimerc.yml`
5. **Validate YAML**: Use online YAML validators
6. **Commit Changes**: Clear, descriptive commit messages
7. **Push Branch**: `git push origin your-feature-branch`
8. **Create Pull Request**: Include detailed description

### Configuration Validation

Use these tools to validate configuration:

- **YAML Lint**: [yamllint.com](http://www.yamllint.com/)
- **Upptime Docs**: [upptime.js.org/docs](https://upptime.js.org/docs)
- **GitHub Actions**: Automatic validation on push

## 📝 Pull Request Guidelines

### PR Requirements

- **Clear Title**: Descriptive summary of changes
- **Detailed Description**: Explain what and why
- **Testing**: Confirmation that changes work
- **Documentation**: Update docs if needed
- **No Breaking Changes**: Maintain existing functionality

### Review Process

1. **Automated Checks**: GitHub Actions validation
2. **Peer Review**: Team member review
3. **Testing**: Verify changes don't break monitoring
4. **Approval**: Required before merging
5. **Merge**: Squash and merge preferred

## 🎯 Priority Levels

### Critical (P0)
- Production service outages
- Security vulnerabilities
- Complete monitoring system failures

### High (P1)
- Performance degradation in production
- Development environment issues
- Monitoring accuracy problems

### Medium (P2)
- Feature enhancements
- Configuration improvements
- Documentation updates

### Low (P3)
- Nice-to-have features
- Minor optimizations
- Cosmetic improvements

## 📞 Getting Help

Need assistance? Here are your options:

- **GitHub Issues**: For public discussion
- **Documentation**: Check [Upptime docs](https://upptime.js.org/docs)
- **Status Page**: [status.sakneen.com](https://status.sakneen.com)

Thank you for contributing to Sakneen's monitoring infrastructure! 🚀
