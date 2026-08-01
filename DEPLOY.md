# Deploy

## Atualizar código

git pull

## Backend

cd auditoria_5s_api

composer install --no-dev --optimize-autoloader

php artisan migrate --force

php artisan optimize:clear
php artisan config:cache
php artisan route:cache

sudo systemctl reload php8.3-fpm

## Frontend

cd ../auditoria_5s_front

npm ci
npm run build

sudo systemctl reload nginx

# Primeira instalação

composer install

cp .env.example .env

php artisan key:generate

php artisan jwt:secret

php artisan migrate:fresh --force

php artisan db:seed --class=AdminUserSeeder

# Permissões

sudo chown -R douglas:www-data storage bootstrap/cache

sudo chmod -R 775 storage bootstrap/cache