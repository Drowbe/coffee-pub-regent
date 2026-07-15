# API: Regent AI Integration

**Audience:** Developers integrating with the Coffee Pub Regent module and leveraging its exposed AI API.

This document describes the AI integration API provided by **Coffee Pub Regent** for AI-powered functionality. Regent is an optional module that requires Coffee Pub Blacksmith; the AI API is exposed on Regent’s `module.api` for other modules to use.

## **Accessing the AI API**

```javascript
// Get the Regent module API (requires coffee-pub-regent to be enabled)
const regent = game.modules.get('coffee-pub-regent')?.api;

// Access the provider-neutral AI API (available after game is ready)
const ai = regent?.ai;
```

**Note:** `api.ai` is set when Regent’s `ready` hook runs. `api.openai` remains as a backward-compatible alias. Ensure Regent is an active module and the game has reached the `ready` phase before calling these methods.

## **Available Functions**

| Function | Type | Description | Parameters |
|----------|------|-------------|------------|
| `getOpenAIReplyAsHtml` | Async Function | Get AI response as HTML formatted | `(query)` |
| `getOpenAIReplyAsHtmlWithMemory` | Async Function | Get AI response with session memory | `(query, sessionId, projectId?)` |
| `getAIReplyAsHtml` | Async Function | Get AI response as HTML formatted | `(query, options?)` |
| `getAIReplyAsHtmlWithMemory` | Async Function | Get AI response with session memory | `(query, sessionId, projectId?)` |
| `callGptApiText` | Async Function | Call the selected provider text API | `(query, customHistory, projectId?, options?)` |
| `callGptApiTextWithMemory` | Async Function | Call the selected provider API with session memory | `(query, sessionId, projectId?)` |
| `getSessionHistory` | Function | Get session conversation history | `(sessionId)` |
| `clearSessionHistory` | Function | Clear specific session history | `(sessionId)` |
| `clearAllSessionHistories` | Function | Clear all session histories | `()` |
| `getMemoryStats` | Function | Get memory usage statistics | `()` |
| `getStorageSize` | Function | Get storage size information | `()` |
| `cleanupOldSessions` | Function | Clean up old sessions by age/size | `(maxAgeDays?, maxSessions?)` |
| `optimizeStorage` | Function | Compress old messages to save space | `(sessionId?)` |
| `exportSessionHistory` | Function | Export session data for backup | `(sessionId?)` |
| `loadSessionHistories` | Function | Load memories from storage | `()` |
| `saveSessionHistories` | Function | Save memories to storage | `()` |

## **Function Details**

### **getOpenAIReplyAsHtml(query)**

Get an AI response formatted as HTML. This is the main function for AI interactions.

**Parameters:**
- `query` (string) - The question or prompt to send to the AI

**Returns:**
- `Promise<Object>` - Response object with formatted content

**Example:**
```javascript
const response = await ai.getAIReplyAsHtml("Create a fantasy tavern description");
console.log(response.content); // HTML formatted response
```

### **callGptApiText(query)**

Direct access to the selected provider's text API with full response data.

**Parameters:**
- `query` (string) - The query to send to the selected provider

**Returns:**
- `Promise<Object>` - Full normalized response object including usage data

**Example:**
```javascript
const response = await ai.callGptApiText("Explain the rules of D&D");
console.log(response.usage); // Token usage information
console.log(response.cost); // Estimated cost
```

## **Configuration Requirements**

The AI API requires proper configuration in **Regent’s** module settings (Configure Settings → Module Settings → Coffee Pub Regent → Regent (AI)):

- **AI Provider**: OpenAI or Anthropic
- **API Key**: Valid key for the selected provider
- **Model**: Supported model for the selected provider
- **Project ID**: Optional OpenAI Project ID for cost tracking and team management when using OpenAI
- **Prompt**: System prompt for AI behavior
- **Temperature**: Response creativity (0-2)

## **Supported Models**

Regent exposes separate model settings for OpenAI and Anthropic. Use the models listed in module settings for the selected provider rather than relying on a hard-coded model list in this document.

## **OpenAI Projects Support**

The API supports OpenAI Projects for better cost tracking and team management:

### **Benefits of OpenAI Projects**

- **Cost Tracking**: Separate billing and usage tracking per project
- **Team Management**: Share projects with team members
- **Usage Analytics**: Detailed usage reports and insights
- **Rate Limits**: Project-specific rate limiting
- **Security**: Isolated API keys and access controls

### **Using Projects**

```javascript
// Check if projects are enabled
const isEnabled = ai.isProjectEnabled();
console.log(`Projects enabled: ${isEnabled}`);

// Get current project ID
const projectId = ai.getProjectId();
console.log(`Current project: ${projectId}`);

// Use with specific project (overrides setting)
const response = await ai.getAIReplyAsHtmlWithMemory(
    "Create a character", 
    "user123", 
    "proj_abc123"
);

// Use with default project (from settings)
const response2 = await ai.getAIReplyAsHtmlWithMemory(
    "Create a character", 
    "user123"
);
```

### **Project Configuration**

1. **Create Project**: Go to https://platform.openai.com/projects
2. **Get Project ID**: Copy the project ID (starts with `proj_`)
3. **Configure Setting**: Enter the project ID in module settings
4. **Optional Override**: Pass project ID directly in API calls

## **Error Handling**

The API includes comprehensive error handling:

- **Invalid API Key**: Returns descriptive error message
- **Rate Limiting**: Automatic retry with exponential backoff
- **Invalid Parameters**: Validation with helpful error messages
- **Network Issues**: Timeout handling and retry logic

## **Usage Examples**

### **Basic AI Query**
```javascript
const regent = game.modules.get('coffee-pub-regent')?.api;
const ai = regent?.ai;
if (ai) {
    const response = await ai.getAIReplyAsHtml("What is a good adventure hook?");
    console.log(response.content);
}
```

### **Advanced Usage with Full Response**
```javascript
const ai = game.modules.get('coffee-pub-regent')?.api?.ai;
if (ai) {
    const response = await ai.callGptApiText("Create a dungeon room");
    console.log(`Tokens used: ${response.usage.total_tokens}`);
    if (response.cost != null) console.log(`Cost: $${response.cost}`);
    console.log(`Content: ${response.content}`);
}
```

## **Memory and Context Features**

### **Session-Based Memory**

The API now supports persistent conversation memory through session IDs:

```javascript
// Create a conversation with memory
const response1 = await ai.getAIReplyAsHtmlWithMemory("My character is a wizard named Gandalf", "user123");
const response2 = await ai.getAIReplyAsHtmlWithMemory("What spells should I prepare?", "user123");
// The AI will remember Gandalf is a wizard from the previous message
```

### **Memory Management**

```javascript
// Get conversation history for a session
const history = ai.getSessionHistory("user123");

// Clear specific session memory
ai.clearSessionHistory("user123");

// Clear all session memories
ai.clearAllSessionHistories();
```

### **Memory Benefits**

- **Persistent Context**: AI remembers previous conversations within a session
- **Character Continuity**: Perfect for ongoing character development
- **Campaign Memory**: Remember NPCs, locations, and plot points
- **Session Isolation**: Each user/session has separate memory
- **Survives Page Refresh**: Memories are saved to browser storage and persist between sessions

### **Persistent Storage**

Memories are automatically saved to browser localStorage and survive:
- Page refreshes
- Browser restarts
- FoundryVTT restarts

```javascript
// Check memory statistics
const stats = ai.getMemoryStats();
console.log(`Total sessions: ${stats.totalSessions}`);
console.log(`Total messages: ${stats.totalMessages}`);

// Export memories for backup
const backup = ai.exportSessionHistory();
// Save this data somewhere safe!

// Export specific session
const sessionBackup = ai.exportSessionHistory("user123");
```

### **Size Management**

As memories grow, you can monitor and manage storage:

```javascript
// Check storage size
const size = openai.getStorageSize();
console.log(`Storage: ${size.sizeInMB}MB (${size.estimatedTokens} tokens)`);
console.log(`Near limit: ${size.isNearLimit}`);

// Clean up old sessions (older than 30 days, max 50 sessions)
const cleaned = openai.cleanupOldSessions(30, 50);
console.log(`Cleaned up ${cleaned} old sessions`);

// Optimize storage by compressing old messages
const optimized = openai.optimizeStorage();
console.log(`Optimized ${optimized} sessions`);
```

### **Size Limits & Recommendations**

| Limit | Value | Impact |
|-------|-------|--------|
| **localStorage** | ~5-10MB | Browser storage limit |
| **GPT-4o Context** | ~128k tokens | API context window |
| **GPT-3.5 Context** | ~16k tokens | API context window |
| **Recommended Sessions** | 50-100 | Balance of history vs performance |
| **Recommended Messages** | 20-50 per session | Context length setting |

### **Automatic Protections**

- ✅ **Context Trimming**: Only recent messages sent to API
- ✅ **Configurable Limits**: Set your preferred context length
- ✅ **Session Isolation**: Each session is independent
- ✅ **Auto-Save**: Efficient storage management

## **Integration Notes**

- The API automatically handles message history and context management
- Session memory is maintained per unique session ID
- Responses are optimized for FoundryVTT integration
- JSON responses are automatically cleaned and validated
- HTML formatting is applied for better display in FoundryVTT

## **Troubleshooting**

### **Common Issues**

1. **"Invalid API key"** - Check your OpenAI API key in **Regent** module settings (Coffee Pub Regent → Regent (AI))
2. **"Invalid prompt"** - Ensure the system prompt is properly configured
3. **"Rate limit exceeded"** - The API will automatically retry; wait a moment
4. **"Request timed out"** - Try breaking your query into smaller parts

### **Debug Information**

Enable debug logging in **Blacksmith** (global Coffee Pub debug) to see detailed request/response information for troubleshooting.
