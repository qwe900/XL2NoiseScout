# 🍓 XL2 Web Server - Raspberry Pi Edition

## Overview

The XL2 Web Server now includes **full Raspberry Pi support** with automatic hardware detection, performance optimization, and system health monitoring. This makes it perfect for portable acoustic measurement systems.

## 🚀 Quick Start

### 1. One-Line Installation
```bash
# Download and run the installation script
curl -sSL https://raw.githubusercontent.com/your-repo/xl2-web-server/main/install-rpi.sh | bash
```

### 2. Manual Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/xl2-web-server.git
cd xl2-web-server

# Run installation script
bash install-rpi.sh

# Reboot to apply permissions
sudo reboot

# Start the service
sudo systemctl start xl2-server
```

### 3. Access Web Interface
```
http://[PI_IP_ADDRESS]:3000
```

## 🔧 Hardware Compatibility

### Supported Raspberry Pi Models:
- ✅ **Raspberry Pi 4B** (Recommended - Full performance)
- ✅ **Raspberry Pi 3B+** (Good performance)
- ✅ **Raspberry Pi Zero 2W** (Basic functionality)

### USB Devices:
- **XL2 Audio Analyzer**: Auto-detected on `/dev/ttyUSB0` or `/dev/xl2`
- **VK-162 GPS Module**: Auto-detected on `/dev/ttyUSB1` or `/dev/gps`

## 🎯 Features on Raspberry Pi

### ✅ Fully Supported:
- **Real-time GPS tracking** with live map
- **12.5Hz dB measurements** and analysis
- **FFT spectrum analysis** (optimized for Pi performance)
- **Heatmap generation** with GPS correlation
- **CSV data logging** with timestamps
- **Multi-client web interface**
- **System health monitoring**

### 🔧 Pi-Specific Optimizations:
- **Automatic hardware detection** (Pi 4, Pi 3, Pi Zero)
- **Performance scaling** based on Pi model
- **Temperature monitoring** with throttling alerts
- **Memory usage optimization**
- **Disk space monitoring**
- **USB device auto-detection**

## 📊 Performance Profiles

### Raspberry Pi 4B (4GB+):
```javascript
{
  maxClients: 10,
  fftBufferSize: 2048,
  gpsUpdateRate: 1000, // 1 second
  enableHeatmap: true,
  maxHeatmapPoints: 5000
}
```

### Raspberry Pi 3B+:
```javascript
{
  maxClients: 5,
  fftBufferSize: 1024,
  gpsUpdateRate: 2000, // 2 seconds
  enableHeatmap: true,
  maxHeatmapPoints: 2000
}
```

### Raspberry Pi Zero 2W:
```javascript
{
  maxClients: 2,
  fftBufferSize: 512,
  gpsUpdateRate: 5000, // 5 seconds
  enableHeatmap: false, // Disabled for performance
  maxHeatmapPoints: 500
}
```

## 🔌 Hardware Setup

### Physical Connections:
1. **Power**: Use official Pi power adapter (5V 3A for Pi 4)
2. **XL2 Device**: Connect via USB cable
3. **GPS Module**: Connect VK-162 via USB
4. **Network**: WiFi or Ethernet connection
5. **Storage**: High-quality SD card (32GB+ recommended)

### USB Port Layout:
```
┌─────────────────┐
│  [USB1] [USB2]  │  ← XL2 + GPS
│  [USB3] [USB4]  │  ← Available
│                 │
│  [HDMI] [Power] │
└─────────────────┘
```

## 🌐 Network Access

### Local Network:
- **Direct access**: `http://192.168.1.XXX:3000`
- **mDNS**: `http://raspberrypi.local:3000`
- **Hostname**: `http://xl2-server.local:3000`

### WiFi Hotspot Mode:
```bash
# Configure Pi as WiFi hotspot
sudo apt install hostapd dnsmasq
# Follow hotspot configuration guide
```

## 📱 Mobile-Friendly Interface

The web interface is **fully responsive** and works great on:
- 📱 **Smartphones** (iOS/Android)
- 📱 **Tablets** (iPad/Android tablets)
- 💻 **Laptops** (Windows/Mac/Linux)

## 🔧 System Management

### Service Control:
```bash
# Start/stop service
sudo systemctl start xl2-server
sudo systemctl stop xl2-server
sudo systemctl restart xl2-server

# Check status
sudo systemctl status xl2-server

# View logs
sudo journalctl -u xl2-server -f
```

### PM2 Management:
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 status
pm2 logs xl2-server
pm2 monit

# Restart
pm2 restart xl2-server
```

### System Health:
```bash
# Check temperature
vcgencmd measure_temp

# Check throttling
vcgencmd get_throttled

# Check disk space
df -h

# Check memory
free -h
```

## 🔍 Troubleshooting

### Common Issues:

#### GPS Not Connecting:
```bash
# Check USB devices
lsusb
ls -la /dev/ttyUSB*

# Test GPS data
cat /dev/ttyUSB1
# Should show NMEA sentences like: $GPGGA,123456.00,5431.23,N...
```

#### XL2 Not Detected:
```bash
# Check serial permissions
groups $USER
# Should include 'dialout'

# Test XL2 communication
sudo minicom -D /dev/ttyUSB0 -b 115200
# Type: *IDN?
# Should respond: NTiAudio,XL2,A2A-XXXXX-XX,FWXX.XX
```

#### Performance Issues:
```bash
# Check CPU temperature
vcgencmd measure_temp
# Should be < 70°C

# Check for throttling
vcgencmd get_throttled
# Should return: throttled=0x0

# Monitor resources
htop
```

#### Network Access Issues:
```bash
# Find Pi IP address
hostname -I

# Check if service is running
sudo netstat -tlnp | grep :3000

# Test local access
curl http://localhost:3000
```

## 📦 File Structure

```
xl2-web-server/
├── server.js              # Main server file
├── config-rpi.js          # Raspberry Pi configuration
├── gps-logger.js          # GPS handling
├── xl2-interface.js       # XL2 communication
├── install-rpi.sh         # Installation script
├── ecosystem.config.js    # PM2 configuration
├── public/
│   └── index.html         # Web interface
├── logs/                  # Log files
└── data/                  # CSV data files
```

## 🔒 Security Considerations

### Network Security:
```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 3000/tcp
sudo ufw allow ssh

# Change default password
passwd

# Disable unnecessary services
sudo systemctl disable bluetooth
```

### Access Control:
- Web interface has **no authentication** by default
- Consider adding **reverse proxy** with authentication
- Use **VPN** for remote access in production

## 🚀 Use Cases

### Perfect for:
- **Portable acoustic surveys**
- **Environmental noise monitoring**
- **Field measurements** with GPS tracking
- **Research projects** requiring mobility
- **Remote monitoring stations**
- **Educational demonstrations**

### Example Scenarios:
1. **Urban noise mapping** - Walk around city with Pi + XL2 + GPS
2. **Construction site monitoring** - Portable station with WiFi hotspot
3. **Environmental studies** - Remote deployment with solar power
4. **Audio research** - Mobile lab for field recordings

## 📈 Future Enhancements

### Planned Features:
- **LoRaWAN connectivity** for long-range data transmission
- **Solar power management** for off-grid operation
- **Cellular modem support** for remote areas
- **Edge AI processing** for real-time analysis
- **Multi-device synchronization** for array measurements

## 🤝 Contributing

Contributions welcome! Areas of interest:
- **Performance optimizations** for different Pi models
- **Additional GPS module support**
- **Power management features**
- **Mobile app development**
- **Documentation improvements**

## 📞 Support

### Getting Help:
1. **Check logs**: `sudo journalctl -u xl2-server -f`
2. **System health**: Built-in monitoring shows temperature/throttling
3. **Hardware test**: Use provided diagnostic commands
4. **Community**: GitHub issues and discussions

### Reporting Issues:
Please include:
- **Pi model** and OS version
- **Hardware connected** (XL2 model, GPS module)
- **Error logs** from journalctl
- **System info** (temperature, throttling status)

---

**Happy measuring! 🎵📊🍓**