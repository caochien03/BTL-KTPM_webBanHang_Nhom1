# Bookstore Backend API

Backend API cho ứng dụng bán sách trực tuyến được xây dựng với Node.js, Express, TypeScript và MongoDB.

## 🚀 Tính năng

### 👤 Quản lý người dùng
- ✅ Đăng ký/Đăng nhập người dùng
- ✅ JWT Authentication
- ✅ Quản lý thông tin người dùng
- ✅ Phân quyền Admin/User
- ✅ Upload avatar
- ✅ Đổi mật khẩu

### 📚 Quản lý sách  
- ✅ CRUD sách (Admin)
- ✅ Tìm kiếm, lọc, sắp xếp sách
- ✅ Phân trang
- ✅ Upload hình ảnh sách
- ✅ Quản lý danh mục

### 🛒 Giỏ hàng & Đặt hàng
- ✅ Thêm/xóa sản phẩm khỏi giỏ hàng
- ✅ Tạo đơn hàng
- ✅ Lịch sử đơn hàng
- ✅ Quản lý đơn hàng (Admin)

### 📊 Dashboard Admin
- ✅ Thống kê tổng quan
- ✅ Quản lý người dùng
- ✅ Quản lý sách
- ✅ Quản lý đơn hàng

## 🛠️ Cài đặt

### Prerequisites
- Node.js (v16+)
- MongoDB (v4.4+)
- npm hoặc yarn

### Bước 1: Clone project
```bash
git clone <repository-url>
cd backend-remake
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình environment
```bash
cp .env.example .env
# Chỉnh sửa file .env theo môi trường của bạn
```

### Bước 4: Chạy setup script
```bash
./setup.sh
```

### Bước 5: Start server
```bash
# Development mode
npm run dev

# Production mode  
npm run build
npm start
```

## 📡 API Endpoints

### 🔐 Authentication
```
POST /api/v1/auth/login          - Đăng nhập
POST /api/v1/auth/logout         - Đăng xuất
GET  /api/v1/auth/account        - Lấy thông tin user
POST /api/v1/user/register       - Đăng ký
POST /api/v1/user/change-password - Đổi mật khẩu
```

### 👥 User Management (Admin)
```
GET    /api/v1/user              - Lấy danh sách user
POST   /api/v1/user              - Tạo user mới
PUT    /api/v1/user              - Cập nhật user
DELETE /api/v1/user/:id          - Xóa user
POST   /api/v1/user/bulk-create  - Tạo nhiều user
```

### 📖 Books
```
GET    /api/v1/book              - Lấy danh sách sách
GET    /api/v1/book/:id          - Lấy thông tin 1 sách
POST   /api/v1/book              - Tạo sách (Admin)
PUT    /api/v1/book/:id          - Cập nhật sách (Admin)
DELETE /api/v1/book/:id          - Xóa sách (Admin)
```

### 📦 Orders  
```
GET  /api/v1/order               - Lấy đơn hàng (Admin: all, User: own)
POST /api/v1/order               - Tạo đơn hàng
GET  /api/v1/history             - Lịch sử đơn hàng user
```

### 🗂️ Database
```
GET /api/v1/database/category    - Lấy danh sách danh mục
GET /api/v1/database/dashboard   - Dashboard admin
```

### 📁 File Upload
```
POST /api/v1/file/upload         - Upload file (hình ảnh)
```

### ⚙️ Admin Utils
```
POST /api/v1/admin/init          - Khởi tạo admin
POST /api/v1/admin/seed          - Tạo dữ liệu mẫu
GET  /api/v1/admin/stats         - Thống kê hệ thống
```

## 🗃️ Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string,
  password: string (hashed),
  phone?: string,
  avatar?: string,
  role: 'user' | 'admin',
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Collection  
```typescript
{
  _id: ObjectId,
  mainText: string,
  author: string,
  category: string,
  price: number,
  quantity: number,
  sold: number,
  thumbnail?: string,
  slider?: string[],
  description?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```typescript
{
  _id: ObjectId,
  user: ObjectId,
  orderNumber: string,
  items: [{
    book: ObjectId,
    title: string,
    quantity: number,
    price: number,
    total: number
  }],
  shippingAddress: {
    firstName: string,
    lastName: string,
    phone: string,
    street: string,
    city: string,
    // ...
  },
  totalAmount: number,
  orderStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                        # Server port
NODE_ENV=development             # Environment
MONGODB_URI=mongodb://localhost:27017/bookstore # Database URL
JWT_SECRET=your-jwt-secret       # JWT secret key
JWT_EXPIRE=30d                   # JWT expiration
FRONTEND_URL=http://localhost:3000 # Frontend URL
```

## 🎯 Khởi tạo hệ thống

### 1. Tạo Admin đầu tiên
```bash
curl -X POST http://localhost:3001/api/v1/admin/init
```

### 2. Đăng nhập Admin
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin123"}'
```

### 3. Tạo dữ liệu mẫu
```bash
curl -X POST http://localhost:3001/api/v1/admin/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing với bcrypt
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Role-based access control

## 📈 Monitoring & Logging

- ✅ Morgan HTTP request logging
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ API response standardization

## 🤝 Compatible với Frontend

Backend này được thiết kế để hoàn toàn tương thích với frontend React/Antd:

- ✅ Response format chuẩn cho Antd Table
- ✅ Pagination format đúng với Antd
- ✅ Validation messages tiếng Việt
- ✅ File upload tương thích
- ✅ API endpoints khớp với frontend calls

## 📝 Development Notes

- TypeScript cho type safety
- Async/await pattern
- Error handling middleware
- Validation với express-validator
- File upload với multer
- Database với Mongoose ODM

## 🚀 Production Deployment

1. Build TypeScript: `npm run build`
2. Set production environment variables
3. Use PM2 for process management
4. Setup reverse proxy (nginx)
5. Enable SSL/HTTPS
6. Configure MongoDB replica set
7. Setup monitoring & logging

## 📞 Support

Nếu có vấn đề, hãy kiểm tra:
1. MongoDB đã chạy chưa
2. Node.js version >= 16
3. File .env đã cấu hình đúng
4. Port 3001 có bị chiếm dụng không

---

**Phát triển bởi KTPM Team** 🎓
