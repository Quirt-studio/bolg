#!/bin/bash
# ============================================
# Bolg CMS - Server Deployment Script
# Server: 120.48.166.99 / qurit.cloud
# ============================================

set -e

echo "=========================================="
echo "  Bolg CMS Deployment Script"
echo "=========================================="

# ---- 1. System packages ----
echo "[1/7] Installing system packages..."
apt update
apt install -y nginx mysql-server git curl

# ---- 2. Install Go (if not installed) ----
if ! command -v go &> /dev/null; then
    echo "[2/7] Installing Go..."
    curl -LO https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
    tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    export PATH=$PATH:/usr/local/go/bin
    rm go1.22.5.linux-amd64.tar.gz
else
    echo "[2/7] Go already installed: $(go version)"
fi

# ---- 3. Install Node.js (if not installed) ----
if ! command -v node &> /dev/null; then
    echo "[3/7] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "[3/7] Node.js already installed: $(node --version)"
fi

# ---- 4. Setup MySQL ----
echo "[4/7] Setting up MySQL..."
systemctl start mysql
systemctl enable mysql

# Create database and user
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS bolg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_MYSQL_PASSWORD';
FLUSH PRIVILEGES;
EOF
echo "  MySQL database 'bolg' created."

# ---- 5. Clone and build ----
echo "[5/7] Cloning project..."
cd /opt
if [ -d "bolg" ]; then
    cd bolg && git pull
else
    git clone https://gitee.com/queit-studio/bolg.git
    cd bolg
fi

# Build Go API
echo "  Building Go API..."
cd bolg-api
# Update config for production
sed -i 's/password: "2006825"/password: "YOUR_MYSQL_PASSWORD"/' config/config.yaml
sed -i 's/mode: debug/mode: release/' config/config.yaml

# Generate JWT secrets
ACCESS_SECRET=$(openssl rand -hex 32)
REFRESH_SECRET=$(openssl rand -hex 32)
sed -i "s/bolg-access-secret-change-in-production/$ACCESS_SECRET/" config/config.yaml
sed -i "s/bolg-refresh-secret-change-in-production/$REFRESH_SECRET/" config/config.yaml

go build -o bolg-api cmd/server/main.go
echo "  Go API built."

# Build Next.js admin
echo "[6/7] Building admin dashboard..."
cd ../admin
npm install
npm run build
echo "  Admin dashboard built."

# ---- 7. Nginx ----
echo "[7/7] Configuring Nginx..."
cp /opt/bolg/deploy/nginx.conf /etc/nginx/sites-available/bolg
ln -sf /etc/nginx/sites-available/bolg /etc/nginx/sites-enabled/bolg
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "  Nginx configured."

# ---- Create systemd services ----
echo "Creating systemd services..."

# Go API service
cat > /etc/systemd/system/bolg-api.service <<'UNIT'
[Unit]
Description=Bolg API Server
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bolg/bolg-api
ExecStart=/opt/bolg/bolg-api/bolg-api
Restart=always
RestartSec=5
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
UNIT

# Next.js admin service
cat > /etc/systemd/system/bolg-admin.service <<'UNIT'
[Unit]
Description=Bolg Admin Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bolg/admin
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable bolg-api bolg-admin
systemctl start bolg-api bolg-admin

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  Homepage:  http://qurit.cloud"
echo "  Admin:     http://qurit.cloud/admin"
echo "  API:       http://qurit.cloud/api/v1"
echo ""
echo "  Next steps:"
echo "  1. Edit /opt/bolg/bolg-api/config/config.yaml"
echo "     - Set your real MySQL password"
echo "  2. Run: mysql -u root -p bolg < /opt/bolg/bolg-api/migrations/001_init.sql"
echo "  3. Restart: systemctl restart bolg-api"
echo "  4. (Optional) Install SSL:"
echo "     apt install certbot python3-certbot-nginx"
echo "     certbot --nginx -d qurit.cloud -d www.qurit.cloud"
echo ""
