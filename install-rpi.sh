#!/bin/bash

# 🍓 Raspberry Pi Installation Script for XL2 Web Server
# Run with: bash install-rpi.sh

set -e  # Exit on any error

echo "🍓 XL2 Web Server - Raspberry Pi Installation"
echo "=============================================="

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo apt install -y git
fi

# Add user to dialout group for serial port access
echo "🔧 Setting up serial port permissions..."
sudo usermod -a -G dialout $USER

# Create udev rules for consistent device naming
echo "🔧 Creating udev rules..."
sudo tee /etc/udev/rules.d/99-xl2-gps.rules > /dev/null << 'EOF'
# NTI XL2 Audio Analyzer
SUBSYSTEM=="tty", ATTRS{idVendor}=="0403", ATTRS{idProduct}=="6001", ATTRS{serial}=="*XL2*", SYMLINK+="xl2", GROUP="dialout", MODE="0666"

# VK-162 GPS Module (CH340 chip)
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="gps", GROUP="dialout", MODE="0666"

# Prolific GPS modules
SUBSYSTEM=="tty", ATTRS{idVendor}=="067b", ATTRS{idProduct}=="2303", SYMLINK+="gps", GROUP="dialout", MODE="0666"

# Generic USB-Serial adapters
SUBSYSTEM=="tty", ATTRS{idVendor}=="10c4", ATTRS{idProduct}=="ea60", GROUP="dialout", MODE="0666"
EOF

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install PM2 for process management
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/pi/xl2-logs

# Create environment file
echo "🔧 Creating environment configuration..."
cat > ~/.xl2-env << 'EOF'
export PORT=3000
export SERIAL_PORT=/dev/ttyUSB0
export GPS_PORT=/dev/ttyUSB1
export NODE_ENV=production
EOF

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/xl2-server.service > /dev/null << EOF
[Unit]
Description=XL2 Web Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable service
echo "🔧 Enabling XL2 service..."
sudo systemctl daemon-reload
sudo systemctl enable xl2-server

# Create PM2 ecosystem file
echo "🔧 Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'xl2-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/pi/xl2-logs/error.log',
    out_file: '/home/pi/xl2-logs/out.log',
    log_file: '/home/pi/xl2-logs/combined.log',
    time: true
  }]
};
EOF

# Get Pi IP address
PI_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "📋 Next Steps:"
echo "1. Reboot to apply group permissions: sudo reboot"
echo "2. After reboot, start the service:"
echo "   sudo systemctl start xl2-server"
echo "   OR"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "🌐 Access the web interface at:"
echo "   http://$PI_IP:3000"
echo "   http://localhost:3000 (local)"
echo ""
echo "📊 Monitor the service:"
echo "   sudo systemctl status xl2-server"
echo "   pm2 status"
echo "   pm2 logs xl2-server"
echo ""
echo "🔧 Configuration files:"
echo "   Environment: ~/.xl2-env"
echo "   PM2 Config: ecosystem.config.js"
echo "   Service: /etc/systemd/system/xl2-server.service"
echo "   Logs: /home/pi/xl2-logs/"
echo ""
echo "🔌 Hardware Setup:"
echo "   - Connect XL2 device via USB"
echo "   - Connect VK-162 GPS module via USB"
echo "   - Check connections: ls -la /dev/ttyUSB*"
echo ""

# Check if reboot is needed
if groups $USER | grep -q dialout; then
    echo "✅ User already in dialout group"
else
    echo "⚠️  Reboot required to apply group permissions"
    read -p "Reboot now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo reboot
    fi
fi