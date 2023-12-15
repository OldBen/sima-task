FROM php:8.2-fpm-alpine
RUN docker-php-ext-install pdo pdo_mysql  && docker-php-ext-enable pdo_mysql