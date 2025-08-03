# Status API Documentation

The Sakneen Status Monitor provides a comprehensive API for accessing status data, performance metrics, and historical information.

## 📊 Base URLs

- **Production**: `https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/`
- **Repository**: `https://github.com/Sakneen/uptime-status/tree/HEAD/api/`

## 🔗 Endpoints

### Service Status

#### Individual Service Status
```
GET /api/{service-slug}/uptime.json
GET /api/{service-slug}/response-time.json
```

**Available Services:**
- `backend-production`
- `backend-development`
- `saas-production`
- `saas-development`
- `manage-production`
- `manage-development`

#### Time-based Metrics
```
GET /api/{service-slug}/uptime-day.json        # Last 24 hours
GET /api/{service-slug}/uptime-week.json       # Last 7 days
GET /api/{service-slug}/uptime-month.json      # Last 30 days
GET /api/{service-slug}/uptime-year.json       # Last 365 days

GET /api/{service-slug}/response-time-day.json    # Last 24 hours
GET /api/{service-slug}/response-time-week.json   # Last 7 days
GET /api/{service-slug}/response-time-month.json  # Last 30 days
GET /api/{service-slug}/response-time-year.json   # Last 365 days
```

## 📄 Response Formats

### Uptime Response
```json
{
  "schemaVersion": 1,
  "label": "uptime",
  "message": "100.00%",
  "color": "brightgreen"
}
```

### Response Time Response
```json
{
  "schemaVersion": 1,
  "label": "response time",
  "message": "372ms",
  "color": "brightgreen"
}
```

## 🌐 Example API Calls

### Get Backend Production Uptime
```bash
curl https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/backend-production/uptime.json
```

### Get SaaS Production Response Time (Last 7 days)
```bash
curl https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/saas-production/response-time-week.json
```

### Get All Services Summary
```bash
curl https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/history/summary.json
```

## 📊 Badges & Shields

### Uptime Badges
```markdown
![Backend Production Uptime](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FSakneen%2Fuptime-status%2FHEAD%2Fapi%2Fbackend-production%2Fuptime.json)
```

### Response Time Badges
```markdown
![Backend Production Response Time](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FSakneen%2Fuptime-status%2FHEAD%2Fapi%2Fbackend-production%2Fresponse-time.json)
```

### Custom Badge Examples
```html
<!-- All-time uptime -->
<img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FSakneen%2Fuptime-status%2FHEAD%2Fapi%2Fbackend-production%2Fuptime.json" alt="Uptime">

<!-- 30-day response time -->
<img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FSakneen%2Fuptime-status%2FHEAD%2Fapi%2Fbackend-production%2Fresponse-time-month.json" alt="Response Time">
```

## 📈 Historical Data

### Summary Data
```bash
# Complete summary of all services
curl https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/history/summary.json
```

**Response Format:**
```json
[
  {
    "name": "Backend Production",
    "url": "$BACKEND_PRODUCTION_URL",
    "icon": "https://img.sakneen.com/logos-email/logo_rOc78V2s7.png",
    "slug": "backend-production",
    "status": "up",
    "uptime": "100.00%",
    "uptimeDay": "100.00%",
    "uptimeWeek": "100.00%",
    "uptimeMonth": "100.00%",
    "uptimeYear": "100.00%",
    "time": 372,
    "timeDay": 367,
    "timeWeek": 378,
    "timeMonth": 404,
    "timeYear": 372,
    "dailyMinutesDown": {}
  }
]
```

### Individual Service History
```bash
# Service-specific historical data
curl https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/history/backend-production.yml
```

## 🔄 Update Frequency

| Data Type | Update Frequency | Source |
|-----------|------------------|---------|
| **Status Checks** | Every 5 minutes | GitHub Actions |
| **Response Time** | Every 5 minutes | GitHub Actions |
| **Daily Summaries** | Daily at 1 AM UTC | GitHub Actions |
| **Graphs** | Daily at 3 AM UTC | GitHub Actions |
| **API Data** | Real-time | Git commits |

## 🛠️ Integration Examples

### JavaScript/Node.js
```javascript
// Fetch service status
async function getServiceStatus(service) {
  const response = await fetch(
    `https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/${service}/uptime.json`
  );
  return await response.json();
}

// Usage
getServiceStatus('backend-production').then(status => {
  console.log(`Backend Production Uptime: ${status.message}`);
});
```

### Python
```python
import requests

def get_service_status(service):
    url = f"https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/{service}/uptime.json"
    response = requests.get(url)
    return response.json()

# Usage
status = get_service_status('backend-production')
print(f"Backend Production Uptime: {status['message']}")
```

### PHP
```php
<?php
function getServiceStatus($service) {
    $url = "https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/{$service}/uptime.json";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

// Usage
$status = getServiceStatus('backend-production');
echo "Backend Production Uptime: " . $status['message'];
?>
```

### cURL/Bash
```bash
#!/bin/bash

# Function to get service status
get_service_status() {
    service=$1
    curl -s "https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/${service}/uptime.json" | \
    python3 -c "import sys, json; print('Uptime:', json.load(sys.stdin)['message'])"
}

# Usage
get_service_status "backend-production"
```

## 📱 Mobile App Integration

### iOS (Swift)
```swift
import Foundation

func getServiceStatus(service: String, completion: @escaping (String?) -> Void) {
    let url = URL(string: "https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/\(service)/uptime.json")!
    
    URLSession.shared.dataTask(with: url) { data, response, error in
        guard let data = data else { return }
        
        do {
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
            completion(json?["message"] as? String)
        } catch {
            completion(nil)
        }
    }.resume()
}
```

### Android (Kotlin)
```kotlin
import okhttp3.*
import org.json.JSONObject
import java.io.IOException

fun getServiceStatus(service: String, callback: (String?) -> Unit) {
    val client = OkHttpClient()
    val url = "https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/$service/uptime.json"
    val request = Request.Builder().url(url).build()
    
    client.newCall(request).enqueue(object : Callback {
        override fun onResponse(call: Call, response: Response) {
            val json = JSONObject(response.body?.string() ?: "")
            callback(json.optString("message"))
        }
        
        override fun onFailure(call: Call, e: IOException) {
            callback(null)
        }
    })
}
```

## 🎨 Custom Widgets

### HTML Status Widget
```html
<div id="status-widget">
  <h3>Sakneen Service Status</h3>
  <div id="services"></div>
</div>

<script>
async function loadStatusWidget() {
  const services = ['backend-production', 'saas-production', 'manage-production'];
  const container = document.getElementById('services');
  
  for (const service of services) {
    const response = await fetch(
      `https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/${service}/uptime.json`
    );
    const data = await response.json();
    
    const serviceDiv = document.createElement('div');
    serviceDiv.innerHTML = `
      <span class="service-name">${service.replace('-', ' ').toUpperCase()}</span>
      <span class="service-status" style="color: ${data.color === 'brightgreen' ? 'green' : 'red'}">${data.message}</span>
    `;
    container.appendChild(serviceDiv);
  }
}

loadStatusWidget();
</script>
```

## 🔒 Rate Limits & Best Practices

### Rate Limits
- **GitHub Raw Content**: No specific limits, but use responsibly
- **Recommended Frequency**: No more than once per minute per endpoint
- **Bulk Requests**: Use summary endpoint for multiple services

### Best Practices
1. **Cache responses** for at least 1 minute
2. **Handle errors gracefully** with fallback values
3. **Use summary endpoint** for dashboard views
4. **Implement retry logic** with exponential backoff
5. **Respect GitHub's infrastructure** - don't abuse the API

### Error Handling
```javascript
async function getServiceStatusWithRetry(service, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/Sakneen/uptime-status/HEAD/api/${service}/uptime.json`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

## 📧 Support

For API support and questions:

- **Documentation Issues**: [GitHub Issues](https://github.com/Sakneen/uptime-status/issues)
- **Integration Help**: technical-support@sakneen.com
- **Feature Requests**: [Feature Request Template](https://github.com/Sakneen/uptime-status/issues/new)

---

*API Documentation last updated: August 2025*
