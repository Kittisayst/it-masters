# ວິທີສ້າງ Users Sheet ໃນ Google Sheets

## 1. ເປີດ Google Sheets

ໄປທີ່: https://docs.google.com/spreadsheets/d/1oy_-bXnWsJVthTkitN7mMgaIikl-L-LEUUIOn9s7s6c/edit

## 2. ສ້າງ Sheet ໃໝ່

1. ກົດປຸ່ມ **+** ລຸ່ມຊ້າຍເພື່ອເພີ່ມ sheet ໃໝ່
2. ປ່ຽນຊື່ເປັນ **Users**

## 3. ສ້າງ Header Row (ແຖວທີ 1)

ໃສ່ຂໍ້ມູນໃນແຖວທີ 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | username | password | fullName | email | role | department | status | createdAt | lastLogin |

## 4. ເພີ່ມຂໍ້ມູນຕົວຢ່າງ (Sample Users)

### Admin User (ແຖວ 2):
```
id: 1
username: admin
password: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
fullName: ຜູ້ດູແລລະບົບ
email: admin@company.com
role: admin
department: IT
status: active
createdAt: 2024-02-06
lastLogin: 2024-02-06
```

### Technician User (ແຖວ 3):
```
id: 2
username: tech1
password: 9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05
fullName: ຊ່າງເຕັກນິກ 1
email: tech1@company.com
role: technician
department: IT
status: active
createdAt: 2024-02-06
lastLogin: 
```

### Regular User (ແຖວ 4):
```
id: 3
username: user1
password: 0a041b9462caa4a31bac3567e0b6e6fd9100787db2ab433d96f6d178cabfce90
fullName: ຜູ້ໃຊ້ທົ່ວໄປ 1
email: user1@company.com
role: user
department: Sales
status: active
createdAt: 2024-02-06
lastLogin: 
```

## 5. Password Hashes

ຂໍ້ມູນ password ທີ່ໃຊ້ (SHA-256 hash):

- `admin123` → `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`
- `tech123` → `9f735e0df9a1ddc702bf0a1a7b83033f9f7153a00c29de82cedadc9957289b05`
- `user123` → `0a041b9462caa4a31bac3567e0b6e6fd9100787db2ab433d96f6d178cabfce90`

## 6. ກວດສອບ

ຫຼັງຈາກເພີ່ມຂໍ້ມູນແລ້ວ, sheet ຄວນມີ:
- ✅ Header row ທີ່ຖືກຕ້ອງ
- ✅ 3 users ຕົວຢ່າງ (admin, technician, user)
- ✅ Password ເປັນ hash ທັງໝົດ

## 7. ຕໍ່ໄປ

ຫຼັງຈາກສ້າງ Users sheet ແລ້ວ:
1. ອັບເດດ Apps Script ເພື່ອຮອງຮັບ Users CRUD
2. ສ້າງ authentication service ໃນ React
3. ສ້າງໜ້າ Login

## ໝາຍເຫດ

⚠️ **ສຳຄັນ:** 
- Password ຄວນເປັນ hash ສະເໝີ
- ບໍ່ຄວນເກັບ plain text password
- ນີ້ແມ່ນ MVP - ສຳລັບ production ຄວນໃຊ້ authentication service ທີ່ເໝາະສົມ
