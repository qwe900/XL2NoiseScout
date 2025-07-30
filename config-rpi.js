// Raspberry Pi Configuration for XL2 Web Server
import { platform, arch } from 'os';

const isRaspberryPi = () => {
  return platform() === 'linux' && (arch() === 'arm' || arch() === 'arm64');
};

export const RPI_CONFIG = {
  // Detect if running on Raspberry Pi
  isRaspberryPi: isRaspberryPi(),
  
  // Serial port configurations for different Pi setups
  serialPorts: {
    // Primary XL2 device ports (try in order)
    xl2: [
      '/dev/xl2',        // Custom udev rule symlink
      '/dev/ttyUSB0',    // Most common
      '/dev/ttyACM0',    // Some USB-serial adapters
      '/dev/ttyAMA0',    // Pi UART (if using GPIO)
    ],
    
    // GPS device ports (try in order)
    gps: [
      '/dev/gps',        // Custom udev rule symlink
      '/dev/ttyUSB1',    // Second USB device
      '/dev/ttyUSB2',    // Third USB device
      '/dev/ttyACM1',    // Alternative GPS port
    ]
  },
  
  // Performance settings for different Pi models
  performance: {
    // Raspberry Pi 4B settings
    pi4: {
      maxClients: 10,
      fftBufferSize: 2048,
      gpsUpdateRate: 1000, // ms
      enableHeatmap: true,
      maxHeatmapPoints: 5000
    },
    
    // Raspberry Pi 3B+ settings
    pi3: {
      maxClients: 5,
      fftBufferSize: 1024,
      gpsUpdateRate: 2000, // ms
      enableHeatmap: true,
      maxHeatmapPoints: 2000
    },
    
    // Raspberry Pi Zero 2W settings
    piZero: {
      maxClients: 2,
      fftBufferSize: 512,
      gpsUpdateRate: 5000, // ms
      enableHeatmap: false, // Disable for performance
      maxHeatmapPoints: 500
    }
  },
  
  // GPIO pin configurations (if using GPIO instead of USB)
  gpio: {
    xl2: {
      tx: 14,  // GPIO 14 (TXD)
      rx: 15,  // GPIO 15 (RXD)
      baudRate: 115200
    },
    gps: {
      tx: 8,   // GPIO 8
      rx: 10,  // GPIO 10
      baudRate: 4800
    }
  },
  
  // System optimization settings
  system: {
    // Memory management
    maxMemoryUsage: '512M',
    
    // CPU throttling detection
    checkThrottling: true,
    
    // Temperature monitoring
    maxTemperature: 70, // °C
    
    // Disk space monitoring
    minDiskSpace: 1024, // MB
  },
  
  // Network settings
  network: {
    // Default to all interfaces on Pi
    host: '0.0.0.0',
    
    // CORS settings for local network access
    cors: {
      origin: [
        'http://localhost:*',
        'http://192.168.*',
        'http://10.*',
        'http://172.*'
      ]
    }
  },
  
  // Logging settings for Pi
  logging: {
    level: 'info',
    maxFileSize: '10M',
    maxFiles: 5,
    logDirectory: '/home/pi/xl2-logs'
  }
};

// Auto-detect Pi model based on CPU info
export const detectPiModel = async () => {
  if (!isRaspberryPi()) return null;
  
  try {
    const fs = await import('fs');
    const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    
    if (cpuInfo.includes('BCM2711')) return 'pi4';      // Pi 4B
    if (cpuInfo.includes('BCM2837')) return 'pi3';      // Pi 3B+
    if (cpuInfo.includes('BCM2710')) return 'pi3';      // Pi 3B
    if (cpuInfo.includes('BCM2835')) return 'piZero';   // Pi Zero/1
    
    return 'unknown';
  } catch (error) {
    console.warn('Could not detect Pi model:', error.message);
    return 'pi3'; // Default to Pi 3 settings
  }
};

// Get optimal configuration for detected Pi model
export const getOptimalConfig = async () => {
  const model = await detectPiModel();
  
  if (!model || !RPI_CONFIG.performance[model]) {
    return RPI_CONFIG.performance.pi3; // Default fallback
  }
  
  return RPI_CONFIG.performance[model];
};

// System health monitoring functions
export const systemHealth = {
  // Check CPU temperature
  async getCPUTemperature() {
    try {
      const fs = await import('fs');
      const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
      return parseInt(temp) / 1000; // Convert to Celsius
    } catch (error) {
      return null;
    }
  },
  
  // Check for CPU throttling
  async isThrottled() {
    try {
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec('vcgencmd get_throttled', (error, stdout) => {
          if (error) resolve(false);
          const throttled = stdout.trim().split('=')[1];
          resolve(throttled !== '0x0');
        });
      });
    } catch (error) {
      return false;
    }
  },
  
  // Check available disk space
  async getDiskSpace() {
    try {
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec('df -m / | tail -1', (error, stdout) => {
          if (error) resolve(null);
          const parts = stdout.trim().split(/\s+/);
          resolve({
            total: parseInt(parts[1]),
            used: parseInt(parts[2]),
            available: parseInt(parts[3])
          });
        });
      });
    } catch (error) {
      return null;
    }
  }
};

export default RPI_CONFIG;