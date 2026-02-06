# ແຜນການສ້າງລະບົບ Authentication

## 1. Google Sheets Structure

### Users Sheet
ສ້າງ sheet ໃໝ່ຊື່ "Users" ດ້ວຍ columns:
- `id` - User ID (unique)
- `username` - ຊື່ຜູ້ໃຊ້ (unique)
- `password` - Password (hashed)
- `fullName` - ຊື່ເຕັມ
- `email` - Email
- `role` - ບົດບາດ (admin, technician, user)
- `department` - ພະແນກ
- `status` - ສະຖານະ (active, inactive)
- `createdAt` - ວັນທີສ້າງ
- `lastLogin` - ເຂົ້າລະບົບຄັ້ງສຸດທ້າຍ

## 2. Apps Script Updates

### ເພີ່ມ Functions ໃໝ່:
```javascript
// User Management
function getUsers()
function getUserByUsername(username)
function createUser(userData)
function updateUser(id, userData)
function deleteUser(id)
function login(username, password)
function updateLastLogin(userId)
```

### Security:
- ໃຊ້ simple hashing ສຳລັບ password (SHA-256)
- Validate input data
- Check permissions based on role

## 3. Frontend Implementation

### 3.1 Authentication Context
```typescript
// src/contexts/AuthContext.tsx
- AuthProvider
- useAuth hook
- Login/Logout functions
- Current user state
- Role-based permissions
```

### 3.2 Authentication Service
```typescript
// src/services/authService.ts
- login(username, password)
- logout()
- register(userData)
- getCurrentUser()
- updateProfile()
```

### 3.3 Pages
- `/login` - ໜ້າເຂົ້າສູ່ລະບົບ
- `/register` - ໜ້າລົງທະບຽນ (admin only)
- `/profile` - ໜ້າໂປຣໄຟລ໌
- `/users` - ໜ້າຈັດການຜູ້ໃຊ້ (admin only)

### 3.4 Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
- Check authentication
- Redirect to login if not authenticated
- Check role permissions
```

### 3.5 Navigation Updates
- ສະແດງຊື່ຜູ້ໃຊ້ໃນ sidebar
- ເພີ່ມປຸ່ມ logout
- ເມນູ profile dropdown

## 4. User Roles & Permissions

### Admin
- ຈັດການຜູ້ໃຊ້ທັງໝົດ
- ເຂົ້າເຖິງທຸກໜ້າ
- ລຶບແລະແກ້ໄຂຂໍ້ມູນທັງໝົດ

### Technician
- ເຂົ້າເຖິງໜ້າສ້ອມແປງ
- ສ້າງແລະແກ້ໄຂວຽກສ້ອມແປງຂອງຕົນເອງ
- ເບິ່ງລາຍງານ

### User
- ເຂົ້າເຖິງໜ້າວຽກງານ
- ສ້າງແລະແກ້ໄຂວຽກງານຂອງຕົນເອງ
- ເບິ່ງລາຍງານ

## 5. Implementation Steps

### Phase 1: Google Sheets Setup
1. ສ້າງ Users sheet
2. ເພີ່ມ sample users
3. ອັບເດດ Apps Script

### Phase 2: Authentication Service
1. ສ້າງ authService.ts
2. ສ້າງ AuthContext
3. ເພີ່ມ types ສຳລັບ User

### Phase 3: UI Components
1. ສ້າງໜ້າ Login
2. ສ້າງ ProtectedRoute
3. ອັບເດດ Layout ດ້ວຍ user info

### Phase 4: User Management
1. ສ້າງໜ້າ Users
2. CRUD operations
3. Role management

### Phase 5: Testing & Security
1. ທົດສອບ login/logout
2. ທົດສອບ permissions
3. ກວດສອບ security

## 6. Security Considerations

⚠️ **ໝາຍເຫດສຳຄັນ:**
- ນີ້ແມ່ນ MVP - ບໍ່ແມ່ນ production-ready
- Password hashing ແບບງ່າຍ (ຄວນໃຊ້ bcrypt ໃນ production)
- ບໍ່ມີ JWT tokens (ໃຊ້ session storage)
- ບໍ່ມີ password reset
- ບໍ່ມີ 2FA

ສຳລັບ production ຄວນໃຊ້:
- Firebase Authentication
- Auth0
- Supabase Auth
- ຫຼື backend API ທີ່ເໝາະສົມ

## 7. Sample Users (ສຳລັບທົດສອບ)

```
Admin:
- username: admin
- password: admin123
- role: admin

Technician:
- username: tech1
- password: tech123
- role: technician

User:
- username: user1
- password: user123
- role: user
```
