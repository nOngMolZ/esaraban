FROM composer:2.7 AS composer 
# Stage 1: Composer dependencies

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-scripts

# Stage 2: Build React assets
FROM node:20 AS nodebuild

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production image
FROM php:8.3-fpm-alpine

# ติดตั้ง extension ที่ Laravel ต้องใช้
RUN apk add --no-cache nginx supervisor bash mysql-client \
    && docker-php-ext-install pdo pdo_mysql \
    && docker-php-ext-enable pdo pdo_mysql

WORKDIR /var/www

# Copy app code และ vendor จาก stage 1/2
COPY --from=composer /app/vendor ./vendor
COPY --from=nodebuild /app/public/build ./public/build
COPY . .

# Nginx config
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# Set permission
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Optimize autoloader and cache config/routes/views
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose ports
EXPOSE 80

# Start both php-fpm + nginx
COPY deploy/supervisord.conf /etc/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
