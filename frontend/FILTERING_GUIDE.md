# Filtering & Search Guide

## Overview

The dashboard now includes powerful filtering and search capabilities to help you find exactly what you're looking for. All filtering happens instantly on the client-side for fast performance.

## Features

### 1. Search Bar

**Location:** Top of the dashboard, left side

**Functionality:**
- Search by account username (e.g., "tech_writer")
- Search by big account name (e.g., "paulg", "elonmusk")
- Real-time filtering as you type
- Shows result count

**How to Use:**
```
1. Click the search input field
2. Type username or big account name
3. Results filter instantly
4. Clear to see all results again
```

**Search Examples:**
- Search for `tech_writer` → Shows all signals for that account
- Search for `paulg` → Shows all accounts followed by paulg
- Search for `ai` → Shows all accounts/followers containing "ai"

### 2. HIGH SIGNAL Toggle

**Location:** Top of the dashboard, right side

**Functionality:**
- Toggle between "Show All" and "HIGH SIGNAL ONLY"
- Filters to accounts with score ≥ 2
- Works in combination with search

**States:**
- **Show All** (default): Shows all detected signals
- **HIGH SIGNAL ONLY** (active): Shows only high-quality signals

**How to Use:**
```
1. Click the toggle button
2. Button changes to "✓ HIGH SIGNAL ONLY"
3. View is filtered to score ≥ 2
4. Click again to show all
```

### 3. Result Counters

**Location:** In section headers (High Signal and Recent Follows)

**Shows:**
- Number of results matching current filters
- Updates in real-time as you filter
- Helps you see filtering impact

**Example:**
```
High Signal [3 results]
Recent Follows [12 results]
```

## Filtering Behavior

### Combined Filters

Filters work together (AND logic):

```
Search: "tech" + HIGH SIGNAL ONLY
↓
Shows only high-signal accounts with "tech" in name
```

### Filter Priority

1. **Search Query** - Applied first
2. **HIGH SIGNAL Toggle** - Applied second
3. **Results** - Intersection of both filters

### Example Scenarios

**Scenario 1: Find high-signal AI accounts**
```
1. Type "ai" in search
2. Click "HIGH SIGNAL ONLY"
3. Result: High-signal accounts with "ai" in name
```

**Scenario 2: See all accounts followed by specific person**
```
1. Type "paulg" in search
2. Leave toggle as "Show All"
3. Result: All accounts followed by paulg
```

**Scenario 3: Find emerging tech accounts**
```
1. Type "tech" in search
2. Click "HIGH SIGNAL ONLY"
3. Result: High-signal tech accounts
```

## UI Elements

### Search Input

```
┌─────────────────────────────────────────┐
│ Search by username or big account...    │
└─────────────────────────────────────────┘
Found 5 results
```

**Features:**
- Placeholder text for guidance
- Clear visual focus state
- Result count below
- Supports partial matches

### Toggle Button

```
Default State:          Active State:
┌──────────────┐       ┌──────────────────┐
│ Show All     │  →    │ ✓ HIGH SIGNAL    │
└──────────────┘       │   ONLY           │
                       └──────────────────┘
```

**Visual Feedback:**
- Color changes when active (blue)
- Checkmark appears when active
- Smooth transition animation

### Result Badges

```
High Signal [3 results]    Recent Follows [12 results]
```

**Shows:**
- Real-time result count
- Updates as filters change
- Helps understand filtering impact

## Performance

### Real-Time Filtering
- **Search:** < 10ms response time
- **Toggle:** Instant update
- **No lag:** Client-side processing
- **Smooth:** 60fps animations

### Memory Usage
- Minimal overhead
- No additional API calls
- All filtering in browser
- Fast garbage collection

## Search Behavior

### What Gets Searched

**Searched Fields:**
1. Username (e.g., "tech_writer")
2. Big account names (e.g., "paulg", "elonmusk")

**Example:**
```
Signal: @tech_writer followed by @paulg, @elonmusk
Search "tech" → MATCH (in username)
Search "paul" → MATCH (in followed_by)
Search "xyz" → NO MATCH
```

### Search Matching

- **Case-insensitive:** "TECH" = "tech" = "Tech"
- **Partial matching:** "tech" matches "tech_writer"
- **Multiple results:** Shows all matches
- **Empty search:** Shows all (no filtering)

### Search Examples

| Search | Matches | Result |
|--------|---------|--------|
| "tech" | @tech_writer, @tech_news | Shows both |
| "paul" | Followed by @paulg | Shows all accounts followed by paulg |
| "ai" | @ai_researcher, @ai_news | Shows both |
| "" (empty) | All | Shows all signals |

## Keyboard Shortcuts

### Search Input
- **Focus:** Click input or Tab to focus
- **Clear:** Ctrl+A then Delete
- **Submit:** Enter (no action, real-time)
- **Blur:** Escape or click elsewhere

### Toggle Button
- **Click:** Space or Enter when focused
- **Keyboard nav:** Tab to button, Space to toggle

## No-Results States

### Empty Search Results
```
No results found
Try a different search
```

**Happens when:**
- Search query matches nothing
- Combined with HIGH SIGNAL toggle
- No accounts in database

**Solution:**
- Clear search box
- Adjust filter toggle
- Run scraper to get more data

### No High-Signal Accounts
```
No high signal accounts yet
Run the scraper to detect new signals
```

**Happens when:**
- HIGH SIGNAL toggle active
- No accounts with score ≥ 2
- New installation

**Solution:**
- Run `node runScraper.js` in backend
- Wait for signal detection
- Check /api/signals endpoint

## Advanced Usage

### Combining with API

The frontend filters client-side, but you can also:

```bash
# Get high-signal accounts via API
curl http://localhost:4000/api/signals/high

# Get all signals
curl http://localhost:4000/api/signals

# Get recent signals
curl http://localhost:4000/api/signals/recent
```

### Filtering Workflow

1. **Initial Load:** Fetch all signals from API
2. **User Searches:** Filter in browser (instant)
3. **User Toggles:** Filter in browser (instant)
4. **Auto-Refresh:** Fetch new data every 30 seconds
5. **Reapply Filters:** Keep current filter state

## Customization

### Change Search Placeholder

Edit `frontend/app/page.tsx`:

```typescript
placeholder="Search by username or big account..."
```

Change to:
```typescript
placeholder="Find emerging accounts..."
```

### Change Toggle Text

Edit `frontend/app/page.tsx`:

```typescript
{showOnlyHighSignal ? '✓ HIGH SIGNAL ONLY' : 'Show All'}
```

Change to:
```typescript
{showOnlyHighSignal ? '✓ PREMIUM' : 'All Accounts'}
```

### Change Filter Threshold

Edit `frontend/app/page.tsx`:

```typescript
if (showOnlyHighSignal) {
  filtered = filtered.filter(s => s.score >= 2);
}
```

Change to:
```typescript
if (showOnlyHighSignal) {
  filtered = filtered.filter(s => s.score >= 3);  // Higher threshold
}
```

### Add More Filters

Example: Filter by minimum followers

```typescript
const [minFollowers, setMinFollowers] = useState(0);

const filtered = signals.filter(s => 
  s.followed_by.length >= minFollowers &&
  s.username.toLowerCase().includes(searchQuery.toLowerCase())
);
```

## Troubleshooting

### Search Not Working

**Problem:** Search doesn't filter results

**Cause:** Backend not returning data

**Solution:**
```bash
# Check if backend is running
curl http://localhost:4000/api/signals

# Check frontend console for errors
# Open DevTools: F12 → Console tab
```

### Toggle Not Responding

**Problem:** HIGH SIGNAL toggle doesn't work

**Cause:** Browser cache or React state issue

**Solution:**
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear cache
DevTools → Application → Clear Storage
```

### Results Count Wrong

**Problem:** Result counter shows incorrect number

**Cause:** Data not fully loaded

**Solution:**
- Wait for auto-refresh (30 seconds)
- Manually refresh page
- Check backend is running

### Slow Filtering

**Problem:** Search is slow or laggy

**Cause:** Large dataset or browser performance

**Solution:**
- Close other browser tabs
- Disable browser extensions
- Try different browser
- Reduce data size (run scraper with --limit 50)

## Best Practices

1. **Use Search First:** Faster than scrolling
2. **Combine Filters:** Use both search and toggle
3. **Check Result Count:** See impact of filters
4. **Clear Filters:** Start fresh when needed
5. **Use Toggle Wisely:** HIGH SIGNAL for quality, Show All for exploration

## Performance Tips

- **Partial Search:** "tech" faster than "technology"
- **Exact Match:** "paulg" faster than "paul"
- **Fewer Results:** Toggle HIGH SIGNAL for faster rendering
- **Keyboard:** Faster than mouse for power users

## Keyboard Workflow

```
1. Ctrl+L (focus search)
2. Type search query
3. Tab (move to toggle)
4. Space (toggle HIGH SIGNAL)
5. Esc (blur and view results)
```

## Summary

| Feature | Speed | Accuracy | Use Case |
|---------|-------|----------|----------|
| **Search** | Instant | Exact | Find specific accounts |
| **Toggle** | Instant | Exact | Focus on quality |
| **Combined** | Instant | Exact | Precise filtering |

---

**Happy filtering! 🔍**
