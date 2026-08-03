# ── Stage 1: Node — build Vite assets ────────────────────────────────────────
FROM node:22-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY resources/ resources/
COPY vite.config.ts tsconfig.json ./
RUN npm run build

# ── Stage 2: Composer ─────────────────────────────────────────────────────────
FROM composer:2.8 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-req=ext-pcntl \
    --ignore-platform-req=ext-posix \
    --ignore-platform-req=ext-bcmath \
    --ignore-platform-req=ext-intl

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM php:8.4-cli-alpine AS production

RUN apk add --no-cache \
        $PHPIZE_DEPS \
        curl \
        libzip-dev \
        libsodium-dev \
        oniguruma-dev \
        icu-dev \
        brotli-dev \
        openssl-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install \
        pdo pdo_mysql mysqli bcmath mbstring zip intl sodium pcntl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/pear /var/cache/apk/*

COPY docker/php/php.ini     /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /app/vendor          ./vendor
COPY --from=assets --chown=www-data:www-data /app/public/build    ./public/build

COPY --chown=www-data:www-data docker/entrypoint.sh /entrypoint.sh
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x /entrypoint.sh

USER www-data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

ENTRYPOINT ["/entrypoint.sh"]

# ECS worker task: override CMD to ["php","artisan","horizon"]
# ECS reverb task: override CMD to ["php","artisan","reverb:start","--host=0.0.0.0","--port=8080"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
