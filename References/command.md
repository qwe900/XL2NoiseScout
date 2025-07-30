# 📡 XL2 Remote Measurement Command Guide for Zencoder

## 🎯 Purpose
Enable Zencoder to interact with NTi XL2 devices using ASCII-based SCPI-style commands over a virtual COM port (USB). Supported operations include querying sound/vibration measurements, starting/stopping acquisition, and retrieving structured data like spectral analysis.

---

## 🛠️ Setup Prerequisites

1. **Install `XL2 Projector PRO`** on the PC to ensure drivers are available.
2. **Connect XL2** via USB → Select `COM Port` mode on XL2 screen.
3. **Detect COM Port**:
    - Use Windows Device Manager or auto-detect logic (e.g., first `COMx` with `NTiAudio` ID).

---

## 📦 Serial Port Configuration

```
Baud Rate: 115200 (or default)
Data Bits: 8
Stop Bits: 1
Parity: None
Flow Control: None
Line Ending: CR LF (`\r\n`)
Timeout: ≥ 1000ms
```

---

## 🔁 Command Flow Example (Python-style pseudocode)

```python
serial.write("*RST\n")             # Reset device to default state
serial.write("INIT START\n")       # Start continuous measurement
wait(3 seconds)

loop every 1 second:
    serial.write("MEAS:INIT\n")    # Trigger a snapshot of all values
    serial.write("MEAS:SLM:123? LAS\n")
    response = serial.read_line()
    log(response)                  # e.g. "53.8 dB, OK"

serial.write("INIT STOP\n")        # Stop measurement if needed
```

---

## 🧠 Core Commands Overview

### 🧾 Identification & Initialization

| Command           | Description                         |
|-------------------|-------------------------------------|
| `*IDN?`           | Identify XL2 (make, serial, fw)     |
| `*RST`            | Reset to default state              |
| `INIT START`      | Begin measurement loop              |
| `INIT STOP`       | Stop measurement                    |
| `INIT:STATE?`     | Query measurement state             |
| `INIT:STATE:SETT?`| Query settling time                 |

---

### 🎧 Sound Measurements

| Task                       | Command Syntax                             |
|---------------------------|--------------------------------------------|
| Set to SLMeter mode       | `MEAS:FUNC SLM`                            |
| Query domain              | `MEAS:DOMAIN?` → `Sound` or `Vibration`    |
| Trigger measurement       | `MEAS:INIT`                                |
| Single value (e.g., LAF)  | `MEAS:SLM:123? LAF`                         |
| Multiple values           | `MEAS:SLM:123? LAF LZSMAX LAFMAX`          |
| Spectrum (EQ)             | `MEAS:SLM:RTA? EQ`                         |
| Spectrum with dt          | `MEAS:SLM:RTA:DT? EQ`                      |
| Frequency weighting       | `MEAS:SLM:RTA:WEIG?`                       |

---

### 📊 Spectral Measurement (FFT)

| Description                   | Command                                  |
|-------------------------------|-------------------------------------------|
| Query FFT spectrum            | `MEAS:FFT? LIVE`                          |
| Get frequency bins            | `MEAS:FFT:F?`                             |
| Set zoom level                | `MEAS:FFT:ZOOM 0`                         |
| Set start frequency           | `MEAS:FFT:FSTART 1000`                   |
| Query dt FFT                  | `MEAS:FFT:DT? EQ`                         |

---

### 🌀 Vibration Measurement

| Command                          | Description                                |
|----------------------------------|--------------------------------------------|
| `MEAS:VIBM:123? accEQ`           | Get acceleration LEQ                       |
| `MEAS:VIBM:123:dt? accEQ`        | Get dt version (between two `MEAS:INIT`)   |
| `MEAS:VIBM:FILTER Flat`          | Set vibration filter                       |
| `MEAS:VIBM:SPEC? EQ`             | Get spectrum of vibration                  |

---

## ⚠️ Notes for Zencoder

- All commands are **terminated with `\r\n`**, not just `\n`.
- Wait for response before sending next command.
- Parse responses like `"53.8 dB, OK"` — filter by status keyword.
- A failed command may return `";"` or `"OPTION_REQUIRED"`.
- **Use `MEAS:INIT` before querying measurement results.**
- Use `MEAS:SLM:123:dt?` to get time-window-based differential values.

---

## 🧪 Example Use Case: 1 Hz Logging of LAF

```
*RST
INIT START
repeat every 1 second:
  MEAS:INIT
  MEAS:SLM:123? LAF
```

---

## 📚 Documentation References

- Supported Commands: See full command list in `XL2 Remote Measurement Manual`
- Setup: pp. 8–14
- Full command structure: from p. 15 onward