# 📊 User Data Backup & Restore Feature

## Overview
Complete user data backup and restore functionality for BlackwaterLeaf. Users can download all their data and restore it later.

## Features

### ✅ Export Options

#### JSON Export
Complete backup of all user data:
- User profile (name, bio, location, interests)
- All plants and aquariums with details
- All posts, comments, and likes
- Messages and conversations
- AI chat history
- Gamification stats and badges
- Group memberships and follows
- Notifications and AI corrections

#### ZIP Export
Same data as JSON but packaged in a ZIP file with:
- `backup_YYYY-MM-DD.json` - Complete data
- `README.md` - Information about the backup

#### CSV Export
Individual CSV files per category:
- Plants list
- Aquariums list
- Posts list
- Comments list

### ✅ Import/Restore
- Upload JSON backup files
- Restore all data categories
- New IDs generated automatically
- No data overwrites (only additions)
- Error handling and reporting

### ✅ User Info Access
- View username, email, name
- Check account status and role
- See join date and last login

### ✅ GDPR Compliance
- Full data portability (Art. 20)
- User can download and export data anytime
- Clear privacy information
- Secure data handling

## File Structure

```
server/
├── routers/
│   ├── export.ts      # Export tRPC endpoints
│   ├── import.ts      # Import tRPC endpoints
│   └── index.ts       # Router registration
└── _core/
    ├── backupRoutes.ts   # Express routes for direct download
    └── index.ts          # Server initialization

src/pages/settings/
└── data-backup.tsx   # UI for backup/restore

docs/
└── DATA_BACKUP.md    # This file
```

## API Endpoints

### Export Endpoints

#### GET /api/backup/download-all
Download complete backup as ZIP file

**Response:**
- Content-Type: `application/zip`
- File: `blackwaterleaf_backup_{username}_{date}.zip`

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://yourapp.com/api/backup/download-all
```

#### GET /api/backup/download-json
Download backup as plain JSON

**Response:**
- Content-Type: `application/json`
- File: `blackwaterleaf_backup_{username}_{date}.json`

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://yourapp.com/api/backup/download-json
```

### Import Endpoints

#### POST /api/backup/upload
Upload and restore backup file

**Request Body:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "userName": "pflanzentante",
  "userId": 42,
  "profile": { /* ... */ },
  "data": {
    "plants": [ /* ... */ ],
    "aquariums": [ /* ... */ ],
    "posts": [ /* ... */ ],
    "comments": [ /* ... */ ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restored",
  "importResults": {
    "plants": 15,
    "aquariums": 3,
    "posts": 42,
    "comments": 128,
    "errors": []
  }
}
```

## Data Structure

### Backup JSON Format

```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "userName": "pflanzentante",
  "userId": 42,
  "profile": {
    "id": 42,
    "username": "pflanzentante",
    "email": "user@example.com",
    "name": "Plant Auntie",
    "bio": "Love plants!",
    "location": "Germany",
    "interests": ["plants", "aquaristics"],
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "active"
  },
  "stats": {
    "totalPlants": 15,
    "totalAquariums": 3,
    "totalPosts": 42,
    "totalComments": 128,
    "totalLikes": 256,
    "followers": 50,
    "following": 30
  },
  "data": {
    "plants": [
      {
        "id": 1,
        "userId": 42,
        "name": "Alocasia",
        "scientificName": "Alocasia baginda",
        "category": "alocasia",
        "difficulty": "intermediate",
        "isPublic": true,
        "createdAt": "2024-01-05T10:00:00Z"
        /* ... more fields ... */
      }
      /* ... more plants ... */
    ],
    "aquariums": [ /* ... */ ],
    "posts": [ /* ... */ ],
    "comments": [ /* ... */ ],
    "likes": [ /* ... */ ],
    "messages": [ /* ... */ ],
    "follows": {
      "following": [ /* ... */ ],
      "followers": [ /* ... */ ]
    },
    "badges": [ /* ... */ ],
    "stats": { /* ... */ },
    "aiChats": [ /* ... */ ],
    "groupMemberships": [ /* ... */ ],
    "notifications": [ /* ... */ ],
    "aiCorrections": [ /* ... */ ]
  }
}
```

## Security Considerations

✅ **Protected Procedures**: All endpoints require authentication
✅ **User Scoped**: Each user can only export/import their own data
✅ **Sensitive Data Redacted**: `openId` is redacted in exports
✅ **Error Handling**: Detailed error messages for import failures
✅ **No Overwrites**: Import creates new entries, doesn't delete old ones
✅ **Rate Limiting**: API endpoints have rate limiting applied

## GDPR Compliance

- ✅ **Art. 15**: Right to access (export endpoints)
- ✅ **Art. 20**: Right to data portability (JSON format)
- ✅ **Art. 17**: Right to erasure (can be extended)
- ✅ Transparent data handling
- ✅ Clear privacy notices in UI

## Usage Examples

### Download Backup (Frontend)

```typescript
// Download as ZIP
const downloadZip = async () => {
  const response = await fetch('/api/backup/download-all');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.zip';
  a.click();
};

// Download as JSON
const downloadJSON = async () => {
  const response = await fetch('/api/backup/download-json');
  const data = await response.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  a.click();
};
```

### Upload Backup (Frontend)

```typescript
const uploadBackup = async (file: File) => {
  const text = await file.text();
  const backupData = JSON.parse(text);
  
  const response = await fetch('/api/backup/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backupData)
  });
  
  const result = await response.json();
  console.log('Import results:', result.importResults);
};
```

## Best Practices

1. **Regular Backups**: Encourage users to download backups regularly
2. **Secure Storage**: Advise users to store backups securely
3. **Privacy Warning**: Clearly state that backups contain sensitive data
4. **Verification**: Consider adding checksum verification for large exports
5. **Retention**: Store backups with encryption if archiving server-side
6. **Documentation**: Provide clear instructions in the UI

## Future Enhancements

- [ ] Scheduled automatic backups
- [ ] Cloud backup integration (Google Drive, OneDrive)
- [ ] Selective data export (choose what to download)
- [ ] Delete account with data export
- [ ] Backup encryption
- [ ] Version history of backups
- [ ] Incremental backups
- [ ] Backup integrity verification
