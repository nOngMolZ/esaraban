# ระบบสารบรรณอิเล็กทรอนิกส์ E-Saraban Chumsaeng

ระบบจัดการเอกสารอิเล็กทรอนิกส์สำหรับโรงเรียน ที่ช่วยให้การจัดการเอกสารเป็นไปอย่างมีประสิทธิภาพ สะดวก และรวดเร็ว ลดการใช้กระดาษและประหยัดเวลาในการค้นหาเอกสาร

## 🚀 เทคโนโลยีที่ใช้

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: React 19 + TypeScript + Inertia.js
- **Styling**: Tailwind CSS 4 + Radix UI Components
- **Database**: MySQL 8.0
- **Authentication**: Laravel Breeze
- **File Storage**: Laravel Storage (Local/S3)
- **PDF Processing**: TCPDF + FPDI
- **Real-time**: Laravel Reverb + Pusher
- **Container**: Docker + Nginx + PHP-FPM
- **Reverse Proxy**: Traefik

## ✨ ฟีเจอร์หลัก

### 📄 การจัดการเอกสาร
- **อัปโหลดและจัดเก็บเอกสาร**: รองรับไฟล์ PDF ขนาดสูงสุด 10MB
- **ระบบหมวดหมู่เอกสาร**: 20+ ประเภทเอกสาร (คำสั่ง, ประกาศ, หนังสือราชการ, ฯลฯ)
- **ค้นหาและกรองเอกสาร**: ค้นหาด้วยชื่อ, ประเภท, สถานะ
- **การแจกจ่ายเอกสาร**: ส่งเอกสารถึงผู้รับที่กำหนด

### 🔐 ระบบลงนามดิจิทัล
- **ลงนามอิเล็กทรอนิกส์**: ลงนามด้วย Canvas หรือรูปภาพ
- **ตราประทับดิจิทัล**: จัดการและใช้ตราประทับของหน่วยงาน
- **Workflow การอนุมัติ**: ระบบขั้นตอนการอนุมัติอัตโนมัติ
- **ประวัติการลงนาม**: บันทึกประวัติการลงนามแต่ละขั้นตอน

### 👥 ระบบบทบาทและสิทธิ์
- **แอดมิน**: จัดการระบบทั้งหมด
- **ผู้อำนวยการ**: อนุมัติเอกสารขั้นสุดท้าย
- **รองผู้อำนวยการ**: อนุมัติเอกสารขั้นต้น
- **เจ้าหน้าที่สารบัญ**: จัดการเอกสารและตราประทับ
- **ผู้ใช้งานทั่วไป**: สร้างและดูเอกสาร

### 📋 ระบบแดชบอร์ด
- **สถิติเอกสาร**: จำนวนเอกสารแต่ละสถานะ
- **เอกสารรอดำเนินการ**: แสดงเอกสารที่รอลงนาม/อนุมัติ
- **เอกสารล่าสุด**: เอกสารที่เพิ่งสร้างหรืออัปเดต
- **การแจ้งเตือน**: แจ้งเตือนเอกสารใหม่แบบ Real-time

## 📦 การติดตั้งและพัฒนา

### ความต้องการระบบ

- PHP 8.3+
- Node.js 20+
- MySQL 8.0+
- Composer 2.7+
- NPM หรือ Yarn

### 1. Clone โปรเจ็ค

```bash
git clone <repository-url>
cd esaraban
```

### 2. ติดตั้ง Dependencies

```bash
# ติดตั้ง PHP dependencies
composer install

# ติดตั้ง Node.js dependencies
npm install
```

### 3. ตั้งค่าไฟล์ Environment

```bash
cp .env.example .env
php artisan key:generate
```

แก้ไขไฟล์ `.env`:

```env
APP_NAME="E-Saraban Chumsaeng"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=esaraban
DB_USERNAME=your_username
DB_PASSWORD=your_password

# การตั้งค่าไฟล์
FILESYSTEM_DISK=public

# การตั้งค่า Mail (สำหรับการแจ้งเตือน)
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls

# การตั้งค่า Broadcasting (สำหรับ Real-time)
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
```

### 4. สร้างฐานข้อมูล

```bash
# รัน migration
php artisan migrate

# สร้างข้อมูลตัวอย่าง
php artisan db:seed

# หรือรันทั้งคู่พร้อมกัน
php artisan migrate:fresh --seed
```

### 5. สร้าง Storage Link

```bash
php artisan storage:link
```

### 6. เริ่มการพัฒนา

```bash
# เริ่มทุกอย่างพร้อมกัน (Laravel server + Queue + Vite)
composer run dev

# หรือเริ่มแบบแยก
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker  
php artisan queue:work

# Terminal 3: Vite dev server
npm run dev
```

เว็บไซต์จะเปิดที่: http://localhost:8000

## 👤 ข้อมูลผู้ใช้สำหรับ Demo

### ผู้ดูแลระบบ
- **อีเมล**: `admin@school.ac.th`
- **รหัสผ่าน**: `password`
- **สิทธิ์**: ทุกสิทธิ์ในระบบ

### ผู้บริหาร
- **ผู้อำนวยการ**: `director@school.ac.th`
- **รองผู้อำนวยการ**: `deputy@school.ac.th`

### เจ้าหน้าที่สารบัญ
- **สารบัญ 1**: `sarabun@school.ac.th`
- **สารบัญ 2**: `sarabun2@school.ac.th`

### ครูผู้สอน
- **ครูคณิตศาสตร์**: `teacher.math@school.ac.th`
- **ครูภาษาไทย**: `teacher.thai@school.ac.th`
- **ครูวิทยาศาสตร์**: `teacher.science@school.ac.th`

> **หมายเหตุ**: รหัสผ่านของทุกบัญชีคือ `password`

## 🚀 การ Deploy บน VPS

### ข้อกำหนดของ VPS

- **OS**: Ubuntu 20.04+ หรือ CentOS 8+
- **RAM**: อย่างน้อย 2GB (แนะนำ 4GB+)
- **Storage**: อย่างน้อย 20GB
- **CPU**: อย่างน้อย 2 cores
- **Network**: Port 80, 443 เปิดอยู่

### วิธีที่ 1: Deploy ด้วย Docker (แนะนำ)

#### 1. ติดตั้ง Docker และ Docker Compose

```bash
# อัปเดต packages
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# ติดตั้ง Docker Compose
sudo apt install docker-compose-plugin

# ติดตั้ง Traefik (Reverse Proxy)
mkdir -p ~/traefik
cd ~/traefik
```

#### 2. ตั้งค่า Traefik

สร้างไฟล์ `~/traefik/docker-compose.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: always
    command:
      - --api.dashboard=true
      - --api.insecure=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.myresolver.acme.email=your-email@domain.com
      - --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.myresolver.acme.httpchallenge=true
      - --certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik

networks:
  traefik:
    external: true
```

#### 3. เริ่ม Traefik

```bash
cd ~/traefik
docker network create traefik
docker-compose up -d
```

#### 4. Upload โค้ดและตั้งค่า

```bash
# Upload โค้ดไปยัง VPS
scp -r . user@your-vps-ip:/home/user/esaraban/

# หรือใช้ git clone
git clone <repository-url> /home/user/esaraban
cd /home/user/esaraban
```

#### 5. ตั้งค่า Environment สำหรับ Production

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
APP_NAME="E-Saraban Chumsaeng"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://esarabun.ct.ac.th

DB_CONNECTION=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_DATABASE=esaraban_prod
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# ตั้งค่าการส่งอีเมล
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="E-Saraban Chumsaeng"

# การตั้งค่า Broadcasting
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_prod_app_id
REVERB_APP_KEY=your_prod_app_key
REVERB_APP_SECRET=your_prod_app_secret
```

#### 6. Build และเริ่มการทำงาน

```bash
# Build Docker image
docker build -t esaraban-app .

# เริ่มการทำงาน
docker-compose up -d

# รัน migration และ seeder
docker exec esaraban php artisan migrate --force
docker exec esaraban php artisan db:seed --force

# สร้าง storage link
docker exec esaraban php artisan storage:link
```

### วิธีที่ 2: Deploy แบบดั้งเดิม (Manual)

#### 1. ติดตั้ง Dependencies

```bash
# อัปเดต system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง PHP 8.3
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-mbstring php8.3-intl

# ติดตั้ง MySQL
sudo apt install mysql-server
sudo mysql_secure_installation

# ติดตั้ง Nginx
sudo apt install nginx

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# ติดตั้ง Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 2. ตั้งค่า MySQL

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE esaraban_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'esaraban'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON esaraban_prod.* TO 'esaraban'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. ตั้งค่า Nginx

สร้างไฟล์ `/etc/nginx/sites-available/esaraban`:

```nginx
server {
    listen 80;
    server_name esarabun.ct.ac.th;
    root /var/www/esaraban/public;
    index index.php index.html;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

#### 4. เปิดใช้งาน Site

```bash
sudo ln -s /etc/nginx/sites-available/esaraban /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Deploy Application

```bash
# Upload code
sudo mkdir -p /var/www/esaraban
sudo chown $USER:$USER /var/www/esaraban
cd /var/www/esaraban

# Clone หรือ upload code
git clone <repository-url> .

# ติดตั้ง dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# ตั้งค่า permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# ตั้งค่า environment
cp .env.example .env
# แก้ไข .env สำหรับ production
php artisan key:generate

# รัน migration
php artisan migrate --force
php artisan db:seed --force

# Optimize application
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

#### 6. ตั้งค่า SSL ด้วย Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d esarabun.ct.ac.th
```

#### 7. ตั้งค่า Supervisor สำหรับ Queue Worker

สร้างไฟล์ `/etc/supervisor/conf.d/esaraban.conf`:

```ini
[program:esaraban-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/esaraban/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/esaraban/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start esaraban-worker:*
```

## 🔧 การบำรุงรักษา

### การสำรองข้อมูล

```bash
# สำรองฐานข้อมูล
mysqldump -u esaraban -p esaraban_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# สำรองไฟล์เอกสาร
tar -czf documents_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/esaraban/storage/app/public/documents
```

### การอัปเดตระบบ

```bash
cd /var/www/esaraban

# Pull code ใหม่
git pull origin main

# อัปเดต dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# รัน migration ใหม่ (ถ้ามี)
php artisan migrate --force

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo systemctl reload nginx
sudo supervisorctl restart esaraban-worker:*
```

### การตรวจสอบสถานะ

```bash
# ตรวจสอบ Queue
php artisan queue:work --once

# ตรวจสอบ logs
tail -f storage/logs/laravel.log

# ตรวจสอบ Nginx
sudo nginx -t
sudo systemctl status nginx

# ตรวจสอบ PHP-FPM
sudo systemctl status php8.3-fpm
```

## 📚 การใช้งาน

### สำหรับผู้ดูแลระบบ

1. **จัดการผู้ใช้งาน**: เพิ่ม/แก้ไข/ลบผู้ใช้งาน กำหนดบทบาทและสิทธิ์
2. **จัดการแผนก**: สร้างและจัดการโครงสร้างแผนกงาน
3. **จัดการตำแหน่ง**: กำหนดตำแหน่งงานต่างๆ
4. **จัดการประเภทเอกสาร**: เพิ่มประเภทเอกสารใหม่
5. **จัดการตราประทับ**: อัปโหลดและจัดการตราประทับ

### สำหรับผู้ใช้งานทั่วไป

1. **สร้างเอกสาร**: อัปโหลดเอกสาร PDF เพื่อเข้าสู่กระบวนการอนุมัติ
2. **ลงนามเอกสาร**: ลงนามดิจิทัลเมื่อเอกสารมาถึง
3. **ติดตามสถานะ**: ดูสถานะการดำเนินการของเอกสาร
4. **ดูเอกสาร**: เข้าถึงเอกสารที่ได้รับอนุญาต

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. ไม่สามารถอัปโหลดไฟล์ได้

```bash
# ตรวจสอบ permission
ls -la storage/
sudo chown -R www-data:www-data storage/
sudo chmod -R 775 storage/

# ตรวจสอบ PHP configuration
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

#### 2. Queue ไม่ทำงาน

```bash
# เริ่ม queue worker ใหม่
php artisan queue:restart

# ตรวจสอบ failed jobs
php artisan queue:failed

# Clear failed jobs
php artisan queue:flush
```

#### 3. เว็บไซต์ช้า

```bash
# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize สำหรับ production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 📄 ลิขสิทธิ์

โปรเจ็คนี้ใช้ลิขสิทธิ์ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [Issues](../../issues) ที่มีอยู่แล้ว
2. สร้าง Issue ใหม่พร้อมรายละเอียดปัญหา
3. ติดต่อทีมพัฒนาผ่านอีเมล

## 🔄 การอัปเดตเวอร์ชัน

- **v1.0.0** - ระบบพื้นฐานการจัดการเอกสาร
- **v1.1.0** - เพิ่มระบบลงนามดิจิทัล
- **v1.2.0** - เพิ่มระบบตราประทับ
- **v1.3.0** - เพิ่มระบบแจกจ่ายเอกสาร
- **v1.4.0** - เพิ่มระบบการแจ้งเตือนแบบ Real-time

---

พัฒนาโดย ทีมงาน NMSoft สำหรับโรงเรียน Chumsaeng 