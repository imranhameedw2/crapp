#!/usr/bin/env bash
# ==============================================================================
# CryptoPulse Pro - aaPanel & Linux One-Click Automated Installer
# ==============================================================================
# Usage:
#   curl -sSL <YOUR_RAW_SCRIPT_URL_OR_RUN_LOCAL> | bash
#   or:
#   bash setup-aapanel.sh
# ==============================================================================

set -e

# ANSI Color Codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "==========================================================="
echo "   🚀 CryptoPulse Pro - Automated One-Click Installer"
echo "        Optimized for aaPanel & Linux VPS/Cloud"
echo "==========================================================="
echo -e "${NC}"

# 1. Root / Sudo Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Notice: Running as non-root user. If root permissions are required, prefix commands with sudo.${NC}"
fi

# Detect Server IP
SERVER_IP=$(curl -s -4 https://ifconfig.me || curl -s -4 https://api.ipify.org || echo "YOUR_SERVER_IP")

# 2. Check & Install System Prerequisites (curl, git, build-essential)
echo -e "\n${PURPLE}[1/6] Checking system tools...${NC}"
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -y >/dev/null 2>&1
  apt-get install -y curl git unzip build-essential >/dev/null 2>&1
elif command -v yum >/dev/null 2>&1; then
  yum install -y curl git unzip gcc-c++ make >/dev/null 2>&1
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y curl git unzip gcc-c++ make >/dev/null 2>&1
fi
echo -e "${GREEN}✓ System tools ready.${NC}"

# 3. Check & Install Node.js (Require Node >= 18, default to Node 20 LTS)
echo -e "\n${PURPLE}[2/6] Checking Node.js runtime...${NC}"
NODE_OK=false
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -ge 18 ]; then
    echo -e "${GREEN}✓ Detected Node.js $(node -v) (NPM $(npm -v))${NC}"
    NODE_OK=true
  fi
fi

if [ "$NODE_OK" = false ]; then
  echo -e "${YELLOW}Installing modern Node.js 20 LTS...${NC}"
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y nodejs >/dev/null 2>&1
  elif command -v yum >/dev/null 2>&1 || command -v dnf >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    yum install -y nodejs >/dev/null 2>&1 || dnf install -y nodejs >/dev/null 2>&1
  fi
  echo -e "${GREEN}✓ Node.js installed: $(node -v) (NPM $(npm -v))${NC}"
fi

# 4. Target Directory Setup
INSTALL_DIR="/www/wwwroot/crypto-pulse"
if [ ! -d "/www/wwwroot" ]; then
  INSTALL_DIR="$(pwd)"
fi

echo -e "\n${PURPLE}[3/6] Setting up project directory at: ${INSTALL_DIR}...${NC}"
mkdir -p "$INSTALL_DIR"

# If current directory is not INSTALL_DIR, copy or sync files
if [ "$(pwd)" != "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}Syncing project files to ${INSTALL_DIR}...${NC}"
  cp -r ./* "$INSTALL_DIR/" 2>/dev/null || true
  cp -r ./.env* "$INSTALL_DIR/" 2>/dev/null || true
  cd "$INSTALL_DIR"
fi

# Ensure .env exists
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Generated .env file from .env.example${NC}"
fi

# 5. Install Dependencies & Build Production Bundle
echo -e "\n${PURPLE}[4/6] Installing dependencies (npm install)...${NC}"
npm install

echo -e "\n${PURPLE}[5/6] Building production assets (npm run build)...${NC}"
npm run build
echo -e "${GREEN}✓ Production build completed! Output stored in: ${INSTALL_DIR}/dist${NC}"

# 6. Process Management with PM2
echo -e "\n${PURPLE}[6/6] Configuring background service (PM2)...${NC}"
if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing PM2 process manager globally...${NC}"
  npm install -g pm2 >/dev/null 2>&1
fi

# Stop existing instance if running
pm2 delete crypto-pulse 2>/dev/null || true

# Start application using PM2
pm2 start npm --name "crypto-pulse" -- run preview
pm2 save 2>/dev/null || true

echo -e "${GREEN}"
echo "==========================================================="
echo "   🎉 INSTALLATION COMPLETE & APP IS RUNNING!"
echo "==========================================================="
echo -e "${NC}"

echo -e "${CYAN}▶ Direct IP Access:${NC} http://${SERVER_IP}:3000"
echo -e "${CYAN}▶ App Directory:${NC}    ${INSTALL_DIR}"
echo -e "${CYAN}▶ Static Files:${NC}     ${INSTALL_DIR}/dist"
echo ""
echo -e "${YELLOW}--- aaPanel Domain & SSL Setup (Recommended) ---${NC}"
echo "1. In aaPanel, go to: Website ➜ Add site"
echo "   - Domain: yourdomain.com"
echo "   - Root directory: ${INSTALL_DIR}"
echo "   - Running directory: /dist"
echo "2. In Site Settings ➜ URL Rewrite, add this rule:"
echo -e "${PURPLE}"
echo "   location / {"
echo "       try_files \$uri \$uri/ /index.html;"
echo "   }"
echo -e "${NC}"
echo "3. In Site Settings ➜ SSL ➜ Let's Encrypt ➜ Click Apply."
echo ""
echo -e "${YELLOW}--- Helpful Management Commands ---${NC}"
echo "  pm2 status                 # Check app running status"
echo "  pm2 logs crypto-pulse      # View real-time logs"
echo "  pm2 restart crypto-pulse   # Restart application"
echo "  pm2 stop crypto-pulse      # Stop application"
echo "==========================================================="
