# NTI XL2 Web Server

A clean, server-only web interface for controlling NTI XL2 audio analyzer devices via USB serial connection. Features real-time measurements with special focus on **12.5Hz dB values**.

## 🎯 Key Features

- **🔌 Direct USB Serial Connection** - Connect XL2 device directly via USB
- **🛰️ GPS Integration** - VK-162 USB GPS module support with live coordinates
- **📝 CSV Logging** - Automatic logging: Datum, Uhrzeit, 12.5Hz Pegel, GPS Koordinaten
- **🌐 Web Interface** - Access from any device on the network
- **📊 Real-time FFT Bar Graph** - Live spectrum analysis with 12.5Hz highlighting
- **🎵 12.5Hz Focus** - Special highlighting and tracking of 12.5Hz measurements
- **📱 Mobile Friendly** - Responsive design works on phones and tablets
- **🚀 Server Mode** - Runs as a system service on Raspberry Pi or Linux

## 🏗️ Architecture

```
┌─────────────────┐    USB Serial    ┌─────────────────┐    WebSocket    ┌─────────────────┐
│   NTI XL2       │◄────────────────►│  Node.js Server │◄───────────────►│  Web Browser    │
│   Device        │                  │  (Raspberry Pi) │                 │  (Any Device)   │
└─────────────────┘                  └─────────────────┘                 └─────────────────┘
```

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start server
npm start

# Or for development with auto-restart
npm run dev
```

### Access Web Interface
Open your browser and go to: `http://your-server-ip:3000`

## 📋 Requirements

- **Node.js** 16+ 
- **NTI XL2** device connected via USB
- **Linux/Raspberry Pi** (recommended) or Windows
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # Web server port
SERIAL_PORT=/dev/ttyUSB0    # XL2 serial port (auto-detect if not set)
NODE_ENV=production         # Production mode
```

### Serial Port Settings
- **Baud Rate**: 115200 (XL2 standard)
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None
- **Line Ending**: CR+LF (\r\n)

## 🎵 12.5Hz Special Features

The interface provides special handling for 12.5Hz measurements:

- **🎯 Dedicated Display Section** - Large, prominent 12.5Hz dB value display
- **📈 History Tracking** - Last 10 measurements at 12.5Hz
- **⚡ Real-time Updates** - Automatic highlighting when 12.5Hz is detected
- **🔔 Visual Alerts** - Pulsing animation for new 12.5Hz measurements

## 🌐 Web Interface Features

### Connection Panel
- **🔍 Smart Device Scanner** - Scans all COM ports and sends `*IDN?` to each
- **📋 Device Selection List** - Shows all found devices with XL2 identification
- **✅ Auto-Selection** - Automatically selects first XL2 device found
- **🔧 Manual Fallback** - Manual port selection if auto-scan fails
- **📊 Real-time Status** - Live connection status indicator

### Measurement Display
- **Current Values**: Frequency, Amplitude, dB Level, Phase, THD
- **12.5Hz Highlight**: Special section for 12.5Hz measurements
- **Real-time Updates**: Live data streaming

### Control Panel
- **Quick Commands**: Device info, re-initialize FFT, reset
- **FFT Control**: Manual controls for zoom/start frequency
- **12.5Hz Context**: Set frequency context for 12.5Hz highlighting
- **Live FFT Control**: Manual trigger, stop live updates
- **Custom Commands**: Send any XL2 command

### Live FFT Display
- **📈 Real-time Spectrum**: Live FFT visualization with ~0.67Hz update rate
- **🎯 12.5Hz Precision**: First bin starts exactly at 12.5Hz (FSTART 12.5)
- **🔴 Enhanced Highlighting**: Larger red marker for bin 0 (12.5Hz exactly)
- **📊 Grid Display**: Frequency (Hz) and amplitude (dB) axes
- **📱 Canvas Visualization**: 800x300 pixel spectrum plot

### Console
- **Real-time Log**: All TX/RX communication
- **Command History**: Track all sent commands
- **Error Display**: Clear error messages

## 📱 Mobile Support

The web interface is fully responsive and works on:
- **📱 Smartphones** (iOS Safari, Android Chrome)
- **📟 Tablets** (iPad, Android tablets)
- **💻 Desktop** (Windows, Mac, Linux)

## 🔧 System Service Installation

### Raspberry Pi / Linux
```bash
# Install as system service
sudo npm run install-service

# Start service
sudo systemctl start xl2-web-server

# Enable auto-start on boot
sudo systemctl enable xl2-web-server

# Check status
sudo systemctl status xl2-web-server

# View logs
sudo journalctl -u xl2-web-server -f
```

## 🛠️ Development

### Project Structure
```
xl2-web-server/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── install-service.js     # Service installation script
├── public/
│   └── index.html         # Web interface
└── README.md              # This file
```

### API Endpoints

#### REST API
- `GET /api/status` - Get connection and device status
- `GET /api/ports` - List available serial ports
- `POST /api/connect` - Connect to XL2 device
- `POST /api/disconnect` - Disconnect from XL2 device
- `POST /api/command` - Send command to XL2
- `GET /api/measurements` - Get measurement history
- `GET /api/measurements/12_5hz` - Get 12.5Hz measurements only

#### WebSocket Events
- `xl2-connect` - Connect to device
- `xl2-disconnect` - Disconnect from device
- `xl2-send-command` - Send command
- `xl2-data` - Receive data from XL2
- `xl2-measurement` - Parsed measurement data
- `xl2-connected` - Device connected
- `xl2-disconnected` - Device disconnected
- `xl2-error` - Error occurred

## 🎯 XL2 Commands Supported

### System Commands
- `*IDN?` - Device identification
- `*RST` - Reset device to default state
- `INIT START` - Begin measurement loop
- `INIT STOP` - Stop measurement

### FFT Commands (Primary Mode)
- `MEAS:FUNC FFT` - Set to FFT mode
- `MEAS:INIT` - Trigger measurement snapshot
- `MEAS:FFT? LIVE` - Get FFT spectrum data
- `MEAS:FFT:F?` - Get frequency bins
- `MEAS:FFT:ZOOM <n>` - Set zoom level (0-15)
- `MEAS:FFT:FSTART <freq>` - Set start frequency

### Initialization Sequence
```
*RST                    # Reset device
MEAS:FUNC FFT          # Set to FFT mode
INIT START             # Start measurement loop
(wait 2 seconds)
MEAS:FFT:ZOOM 9        # Set zoom level
MEAS:FFT:FSTART 12.5   # Set start frequency to 12.5Hz (first bin = 12.5Hz exactly!)
MEAS:INIT              # Trigger measurement
MEAS:FFT:F?            # Get frequency bins
```

## 🔍 Troubleshooting

### Connection Issues
```bash
# Check if XL2 is detected
ls /dev/ttyUSB*

# Check permissions
sudo usermod -a -G dialout $USER

# Check service logs
sudo journalctl -u xl2-web-server -f
```

### Common Problems
- **Device not found**: Check USB connection and drivers
- **Permission denied**: Add user to `dialout` group
- **Port in use**: Stop other applications using the serial port
- **Web interface not loading**: Check firewall settings for port 3000

## 🛰️ GPS Integration & CSV Logging

### **VK-162 USB GPS Module Support**

The system supports the **temedu USB-GPS-Modul VK-162** for precise location logging:

- **🔌 USB Connection**: Connects directly to server via USB
- **📡 GLONASS/GPS**: Dual satellite system support
- **💧 Waterproof**: IP67 rated, magnetic mounting
- **🖥️ Multi-Platform**: Windows 10, Linux, Raspberry Pi compatible

### **CSV Logging Format**

Automatic logging creates timestamped CSV files with German locale:

```csv
Datum,Uhrzeit,Pegel_12.5Hz_dB,GPS_Latitude,GPS_Longitude,GPS_Altitude_m,GPS_Satellites,GPS_Fix_Quality
01.12.2024,14:30:15,45.2,52.520008,13.404954,54.2,8,1
01.12.2024,14:30:17,44.8,52.520012,13.404958,54.1,8,1
01.12.2024,14:30:19,46.1,52.520015,13.404962,54.3,9,1
```

### **Logging Features**

- **📁 Auto-Naming**: `logs/Log_YYYY-MM-DD-HH-mm-ss.csv`
- **🕐 German Format**: DD.MM.YYYY and HH:mm:ss
- **📍 GPS Coordinates**: Latitude, Longitude, Altitude
- **🛰️ GPS Quality**: Satellite count and fix quality
- **⚡ Real-time**: Logs every FFT measurement (~1.5s intervals)
- **🔄 Auto-Sync**: GPS and measurement data synchronized

### **Heatmap Visualization**

The web UI can render all logged dB values on a map as a heatmap. A local copy
of the [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) plugin is bundled
under `public/vendor/leaflet-heat/`. This ensures heatmap functionality even on
systems without internet access.

### **GPS Setup Workflow**

1. **🔌 Connect VK-162**: Plug USB GPS module into server
2. **🔍 Scan GPS Ports**: Click "Scan GPS Ports" in web interface
3. **📡 Select GPS**: Choose VK-162 from detected ports
4. **🛰️ Connect**: Click "Connect GPS" and wait for satellite fix
5. **📝 Start Logging**: Click "Start Logging" to begin CSV recording
6. **📊 Monitor**: Watch live GPS coordinates and logging status

## 📊 Example Usage

1. **Connect XL2** to computer via USB, set XL2 to COM Port mode
2. **Connect GPS** (optional): Plug in VK-162 USB GPS module
3. **Start server**: `npm start`
4. **Open browser**: Go to `http://localhost:3000`
5. **Scan devices**: Click "🔍 Scan All COM Ports" (auto-runs on page load)
6. **Select XL2**: Choose your XL2 from the device list (auto-selected if found)
7. **Connect XL2**: Click "Connect Selected"
8. **Setup GPS**: Click "🔍 Scan GPS Ports" → Select VK-162 → "Connect GPS"
9. **Start Logging**: Click "▶️ Start Logging" to begin CSV recording
10. **Auto-FFT**: FFT initializes automatically and starts live measurements
11. **Watch Live FFT**: Real-time bar graph display updates every 1.5s
12. **Monitor 12.5Hz**: Red highlighted bar shows exact 12.5Hz dB values
13. **GPS Logging**: Every measurement logged with GPS coordinates to CSV

## 📄 License

MIT License - Feel free to use and modify for your needs.

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

---

**🎵 Perfect for audio measurement applications requiring precise 12.5Hz monitoring! 🎵**