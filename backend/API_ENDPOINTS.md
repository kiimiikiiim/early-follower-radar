# Backend API Endpoints

Complete documentation of all available API endpoints in the Early Follower Radar backend.

## Base URL

```
http://localhost:4000
```

## Endpoints

### 1. Health Check

**GET** `/ping`

Test if the backend is running.

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2026-04-26T01:26:18.806Z"
}
```

**Example:**
```bash
curl http://localhost:4000/ping
```

---

### 2. Get All Big Accounts

**GET** `/api/big-accounts`

Retrieve all monitored big accounts.

**Response:**
```json
[
  {
    "id": 1,
    "username": "paulg",
    "twitter_id": "16334",
    "created_at": "2026-04-26 01:11:17"
  },
  {
    "id": 2,
    "username": "elonmusk",
    "twitter_id": "44196397",
    "created_at": "2026-04-26 01:11:35"
  }
]
```

**Example:**
```bash
curl http://localhost:4000/api/big-accounts
```

---

### 3. Add Big Account

**POST** `/api/big-accounts`

Add a new big account to monitor.

**Request Body:**
```json
{
  "username": "paulg",
  "twitter_id": "16334"
}
```

**Parameters:**
- `username` (required): Twitter/X username
- `twitter_id` (optional): Twitter/X user ID

**Response:**
```json
{
  "id": 1,
  "username": "paulg",
  "twitter_id": "16334"
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "paulg", "twitter_id": "16334"}'
```

---

### 4. Get Tracked Follows

**GET** `/api/tracked-follows`

Get all tracked follows, sorted by signal score.

**Response:**
```json
[
  {
    "id": 1,
    "big_account_id": 1,
    "small_account_username": "emerging_dev",
    "small_account_twitter_id": "123456789",
    "followed_at": "2026-04-26T10:00:00Z",
    "signal_score": 85,
    "created_at": "2026-04-26 01:11:28",
    "big_account_username": "paulg"
  }
]
```

**Example:**
```bash
curl http://localhost:4000/api/tracked-follows
```

---

### 5. Add Tracked Follow

**POST** `/api/tracked-follows`

Add a new tracked follow to the database.

**Request Body:**
```json
{
  "big_account_id": 1,
  "small_account_username": "emerging_dev",
  "small_account_twitter_id": "123456789",
  "followed_at": "2026-04-26T10:00:00Z",
  "signal_score": 85
}
```

**Parameters:**
- `big_account_id` (required): ID of the big account
- `small_account_username` (required): Username of the followed account
- `small_account_twitter_id` (optional): Twitter/X ID of the followed account
- `followed_at` (required): ISO timestamp when the follow occurred
- `signal_score` (optional): Ranking score 0-100 (default: 0)

**Response:**
```json
{
  "id": 1
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/tracked-follows \
  -H "Content-Type: application/json" \
  -d '{
    "big_account_id": 1,
    "small_account_username": "emerging_dev",
    "followed_at": "2026-04-26T10:00:00Z",
    "signal_score": 85
  }'
```

---

### 6. Scrape Following List

**POST** `/api/scrape-following`

Scrape the following list of a Twitter/X user and return the data.

**Request Body:**
```json
{
  "username": "elonmusk",
  "limit": 100
}
```

**Parameters:**
- `username` (required): Twitter/X username to scrape
- `limit` (optional): Maximum accounts to scrape (default: 100, max: 200)

**Response:**
```json
{
  "success": true,
  "username": "elonmusk",
  "count": 87,
  "accounts": [
    {
      "username": "handle1",
      "displayName": "Display Name 1",
      "followed_by": "elonmusk"
    },
    {
      "username": "handle2",
      "displayName": "Display Name 2",
      "followed_by": "elonmusk"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/scrape-following \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "limit": 100}'
```

**Notes:**
- This endpoint only returns the scraped data
- Does not save to database
- Scraping typically takes 30-60 seconds for 100 accounts
- Requires Playwright and browsers to be installed

---

### 7. Scrape and Save Following List

**POST** `/api/scrape-and-save`

Scrape the following list of a Twitter/X user and automatically save to database.

**Request Body:**
```json
{
  "username": "elonmusk",
  "big_account_id": 2,
  "signal_score": 75
}
```

**Parameters:**
- `username` (required): Twitter/X username to scrape
- `big_account_id` (required): ID of the big account (must exist)
- `signal_score` (optional): Default signal score for all scraped accounts (default: 50)

**Response:**
```json
{
  "success": true,
  "username": "elonmusk",
  "scrapedCount": 87,
  "savedCount": 85,
  "message": "Scraped 87 accounts, saved 85 to database"
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/scrape-and-save \
  -H "Content-Type: application/json" \
  -d '{
    "username": "elonmusk",
    "big_account_id": 2,
    "signal_score": 75
  }'
```

**Notes:**
- Scrapes up to 200 accounts
- Automatically saves all scraped accounts to `tracked_follows` table
- `scrapedCount` = total accounts found
- `savedCount` = accounts successfully saved (may differ due to duplicates)
- Duplicates are skipped automatically

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages.

### 400 Bad Request

Missing required parameters.

```json
{
  "error": "Username is required"
}
```

### 404 Not Found

Resource not found.

```json
{
  "error": "Big account not found"
}
```

### 500 Internal Server Error

Server error during processing.

```json
{
  "error": "Failed to scrape following list",
  "details": "Error message details"
}
```

---

## Usage Examples

### Example 1: Add a Big Account and Scrape

```bash
# Step 1: Add a big account
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "twitter_id": "44196397"}'

# Response: {"id": 2, "username": "elonmusk", "twitter_id": "44196397"}

# Step 2: Scrape and save their following list
curl -X POST http://localhost:4000/api/scrape-and-save \
  -H "Content-Type: application/json" \
  -d '{
    "username": "elonmusk",
    "big_account_id": 2,
    "signal_score": 80
  }'

# Response: {"success": true, "scrapedCount": 87, "savedCount": 85, ...}

# Step 3: View all tracked follows
curl http://localhost:4000/api/tracked-follows
```

### Example 2: Scrape Without Saving

```bash
# Just scrape and get the data
curl -X POST http://localhost:4000/api/scrape-following \
  -H "Content-Type: application/json" \
  -d '{"username": "paulg", "limit": 50}'

# Process the response in your application
# Then manually save selected accounts using /api/tracked-follows
```

### Example 3: Bulk Add Tracked Follows

```bash
# Add multiple follows manually
for i in {1..5}; do
  curl -X POST http://localhost:4000/api/tracked-follows \
    -H "Content-Type: application/json" \
    -d "{
      \"big_account_id\": 1,
      \"small_account_username\": \"account_$i\",
      \"followed_at\": \"2026-04-26T10:00:00Z\",
      \"signal_score\": $((50 + i * 10))
    }"
done
```

---

## Rate Limiting & Best Practices

1. **Scraping**: Space out scrape requests by 5-10 seconds to avoid rate limiting
2. **Batch Operations**: Use `/api/scrape-and-save` for efficiency
3. **Error Handling**: Always check response status codes
4. **Timeouts**: Scraping can take 1-2 minutes for 200 accounts

---

## Testing

### Test All Endpoints

```bash
# 1. Health check
curl http://localhost:4000/ping

# 2. Get big accounts
curl http://localhost:4000/api/big-accounts

# 3. Get tracked follows
curl http://localhost:4000/api/tracked-follows

# 4. Check scraper endpoints are available
curl -X POST http://localhost:4000/api/scrape-following \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}' 2>&1 | head -c 100
```

---

## Integration with Frontend

The frontend automatically calls these endpoints:

- **GET** `/api/tracked-follows` - Fetches data for dashboard display
- Auto-refresh every 30 seconds

To add scraping functionality to the frontend, create a button that calls:

```javascript
const response = await fetch('http://localhost:4000/api/scrape-and-save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'elonmusk',
    big_account_id: 2,
    signal_score: 75
  })
});
```

---

**For more information, see SCRAPER_GUIDE.md**
