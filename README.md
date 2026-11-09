# readdingbook - Kho Lưu Trữ Phim & Sách Tương Tác 3D Leon Vasari

Dự án tương tác 3D độc đáo kết hợp giữa kệ băng VHS cong phối cảnh chiều sâu, trình đọc sách điện tử (E-book reader) và trợ lý ảo giám tuyển điện ảnh tích hợp Gemini AI.

---

## 🚀 Tính năng nổi bật

- **3D Curved VHS Shelf**: Hiệu ứng kệ phim 3D tương tác mượt mà với chuyển động trực quan (Motion / Framer Motion).
- **Trình đọc E-book tích hợp**: Trải nghiệm đọc tài liệu lưu trữ, kịch bản với giao diện cổ điển và thanh điều hướng trực quan.
- **Trợ lý AI Giám Tuyển (Gemini AI)**: Hỗ trợ 3 vai trò phân tích điện ảnh (Học Giả Điện Ảnh, Tra Cứu Nhanh, Thông Diễn Chuyên Sâu) sử dụng mô hình Gemini qua Google Gen AI SDK.
- **Phong cách thẩm mỹ Duotone & Risograph**: Giao diện được thiết kế nghệ thuật với phong cách hạt giấy (Paper Grain), Halftone và bảng màu hoài niệm thập niên 1960–1980.

---

## 🛠 Hướng dẫn chạy Local (Máy tính cá nhân)

### Yêu cầu hệ thống
- **Node.js** phiên bản 18 trở lên (khuyên dùng Node 20+)
- **npm** hoặc **pnpm** / **yarn**

### Các bước cài đặt và khởi chạy:

1. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Sao chép file `.env.example` thành `.env` (hoặc tạo file `.env`):
   ```bash
   cp .env.example .env
   ```
   Sau đó mở file `.env` và điền API Key của bạn:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   ```
   *(Bạn có thể lấy Gemini API Key miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey))*

3. **Chạy dự án ở chế độ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

4. **Kiểm tra và Build phiên bản Production:**
   ```bash
   npm run build
   ```

---

## 🌐 Hướng dẫn Deploy chạy Online (Miễn phí)

### Cách 1: Triển khai qua Vercel (Khuyên dùng - Nhanh nhất)
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Nhấn **"Add New..."** -> **"Project"**.
3. Chọn kho lưu trữ **`readdingbook`** từ danh sách GitHub của bạn và nhấn **Import**.
4. Tại mục **Environment Variables**, thêm biến:
   - Key: `GEMINI_API_KEY`
   - Value: *(Điền Gemini API Key của bạn)*
5. Nhấn **Deploy**. Chỉ sau 1–2 phút, Vercel sẽ cung cấp link công khai dạng `https://readdingbook-xxxx.vercel.app` để truy cập trực tuyến.

### Cách 2: Triển khai qua Render (Chạy full Node.js Server)
1. Truy cập [render.com](https://render.com) và đăng nhập bằng GitHub.
2. Chọn **"New"** -> **"Web Service"**.
3. Kết nối với repo **`readdingbook`**.
4. Điền các thiết lập:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Trong phần **Environment Variables**, thêm:
   - Key: `GEMINI_API_KEY`
   - Value: *(Gemini API Key của bạn)*
6. Nhấn **Create Web Service**. Ứng dụng sẽ chạy online tại đường dẫn dạng `https://readdingbook.onrender.com`.

---

## 📁 Cấu trúc thư mục

```
readdingbook/
├── api/                  # Vercel Serverless Function (/api/chat)
│   └── chat.ts
├── src/                  # Mã nguồn React Frontend
│   ├── archive/          # Dữ liệu danh mục phim & tính toán hình học 3D
│   ├── components/       # Các components giao diện (Shelf, Ebook, GeminiChat, TopBar...)
│   ├── ebook/            # Dữ liệu sách & logic đọc
│   ├── App.tsx           # Component chính
│   └── main.tsx
├── server.ts             # Backend Express server (chạy local & server platforms)
├── vite.config.ts        # Cấu hình Vite & Tailwind v4
├── vercel.json           # Cấu hình định tuyến cho Vercel
└── package.json
```
