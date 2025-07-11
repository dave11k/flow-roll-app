# API Versioning Strategy

## Overview

This document outlines the API versioning strategy implemented in the Flow Roll BJJ app to prevent "API versioning nightmare" scenarios when transitioning from local storage to remote backend.

## Current Implementation

### Phase 1: Local Storage (Current)
- **Status**: ✅ Implemented
- **Description**: API layer acts as a thin wrapper around SQLite storage
- **Benefits**: 
  - Zero performance impact
  - Same functionality as before
  - Future-proof architecture in place

### API Layer Features

#### 1. **Transparent Interface**
```typescript
// Before (direct storage)
import { getTechniques } from '@/services/storage';

// After (API layer)
import { getTechniques } from '@/services/api';
// Same function signature, same behavior
```

#### 2. **Environment-Based Switching**
```typescript
// Development: Local SQLite
EXPO_PUBLIC_API_URL=""

// Production: Remote API with fallback
EXPO_PUBLIC_API_URL="https://api.bjjtracker.com"
```

#### 3. **Version Management**
```typescript
// API calls include version headers
X-API-Version: v1
X-Client-Version: 1.0.0
```

#### 4. **Enhanced Logging**
```typescript
// Development logging for debugging
[API] 2024-01-15T10:30:00.000Z → GET /techniques
[API] 2024-01-15T10:30:00.123Z ← GET /techniques ✓ (123ms) { count: 25 }
```

## Future Migration Path

### Phase 2: Hybrid Mode (Future)
- **When**: When you decide to add backend features
- **Changes Required**: 
  - Set `EXPO_PUBLIC_API_URL` environment variable
  - Deploy backend with v1 API endpoints
  - **Zero app code changes needed**

### Phase 3: Enhanced Features (Future)
- **Multi-device sync**: Data syncs across devices
- **Cloud backup**: Automatic server-side backup
- **Real-time features**: Live updates, collaboration
- **Advanced analytics**: Server-side processing

## Backward Compatibility Strategy

### Version Support Matrix
| App Version | API Version | Supported Features |
|-------------|-------------|-------------------|
| 1.0.x       | v1          | Basic CRUD operations |
| 1.1.x       | v1, v2      | + Cloud sync |
| 1.2.x       | v1, v2, v3  | + Real-time features |

### Breaking Change Prevention
1. **API Versioning**: Each API version is maintained separately
2. **Graceful Degradation**: Newer features fail gracefully on older clients
3. **Client Version Detection**: Server knows what features each client supports
4. **Automatic Fallback**: Network failures fall back to local storage

## Technical Details

### API Client Configuration
```typescript
const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  version: 'v1',
  timeout: 10000,
  useLocalStorage: !process.env.EXPO_PUBLIC_API_URL,
  enableLogging: __DEV__,
};
```

### Request Flow
1. **Check Configuration**: Local vs Remote
2. **Make Request**: With version headers
3. **Handle Response**: Parse and validate
4. **Fallback**: To local storage if remote fails
5. **Log Activity**: For debugging and monitoring

### Data Consistency
- **Local First**: All data operations work locally
- **Background Sync**: When connected, sync to remote
- **Conflict Resolution**: Last-write-wins with timestamps
- **Offline Support**: Full functionality without network

## Benefits of This Approach

### For Users
- ✅ **No Disruption**: App continues working during backend migration
- ✅ **Offline First**: Always functional without internet
- ✅ **Smooth Updates**: No forced app updates for backend changes
- ✅ **Data Safety**: Local data is never lost

### For Developers
- ✅ **Gradual Migration**: Can migrate features incrementally
- ✅ **A/B Testing**: Easy to test new features with subsets of users
- ✅ **Rollback Safety**: Can revert to local storage if needed
- ✅ **Monitoring**: Built-in logging and health checks

### For Business
- ✅ **Risk Reduction**: No "big bang" migrations
- ✅ **User Retention**: No disruption to existing users
- ✅ **Feature Flexibility**: Can add premium features gradually
- ✅ **Cost Control**: Pay for backend resources only when needed

## Usage Examples

### Current Usage (Local Storage)
```typescript
// In your components - no changes needed
const { techniques } = useData();

// Behind the scenes
apiClient.getTechniques() → Storage.getTechniques() → SQLite
```

### Future Usage (Remote API)
```typescript
// Same component code - no changes needed
const { techniques } = useData();

// Behind the scenes
apiClient.getTechniques() → fetch('/api/v1/techniques') → Remote API
// Falls back to SQLite if network fails
```

## Monitoring and Health Checks

### API Health Check
```typescript
const health = await apiClient.healthCheck();
// Returns: { status: 'healthy', isLocal: true, version: 'v1' }
```

### Compatibility Check
```typescript
const compat = await apiClient.checkCompatibility();
// Returns: { compatible: true, upgradeRequired: false }
```

## Implementation Status

- [x] **API Layer Created**: Thin wrapper around storage
- [x] **DataContext Updated**: Uses API layer instead of direct storage
- [x] **Version Management**: Headers and compatibility checking
- [x] **Logging System**: Performance tracking and debugging
- [x] **Health Checks**: API status monitoring
- [x] **Documentation**: This strategy document

## Next Steps (When Ready for Backend)

1. **Design Backend API**: Match the interface expected by the API layer
2. **Implement v1 Endpoints**: Mirror current storage operations
3. **Set Environment Variable**: `EXPO_PUBLIC_API_URL`
4. **Deploy and Test**: Gradual rollout with monitoring
5. **Add Enhanced Features**: Multi-device sync, cloud backup, etc.

## Risk Mitigation

### What We Prevent
- ❌ **Breaking Changes**: Old app versions becoming unusable
- ❌ **Data Loss**: Users losing their local data
- ❌ **Forced Updates**: Users being forced to update immediately
- ❌ **Feature Regression**: New backend causing missing features

### What We Enable
- ✅ **Seamless Migration**: Transparent transition to backend
- ✅ **Incremental Rollout**: Test with small user groups first
- ✅ **Easy Rollback**: Can revert to local storage instantly
- ✅ **Future Flexibility**: Can add any backend features later

---

This strategy ensures that your app will never suffer from the "API versioning nightmare" described in the tweet, while maintaining full current functionality and enabling unlimited future possibilities.