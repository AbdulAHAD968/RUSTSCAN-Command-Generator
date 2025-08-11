import { useState, useEffect, useRef } from 'react'
import { FaCopy, FaCogs, FaNetworkWired, FaTerminal, FaInfoCircle } from 'react-icons/fa'

const RustScanMode = () => {
  const [ip, setIp] = useState('')
  const [scanOptions, setScanOptions] = useState({
    accessible: false,
    batchSize: '4500',
    ports: 'top1000',
    customPorts: '',
    range: '',
    scanOrder: 'Random',
    timeout: '1500',
    greppable: false,
    script: 'None',
    ulimit: '5000'
  })
  const [command, setCommand] = useState('rustscan')
  const [isEditing, setIsEditing] = useState(false)
  const [editedCommand, setEditedCommand] = useState('')
  const [activeTab, setActiveTab] = useState('scanOptions')
  const commandInputRef = useRef(null)

  useEffect(() => {
    const ipInput = document.getElementById('IP')
    if (ipInput) {
      setIp(ipInput.value)
      const observer = new MutationObserver(() => {
        setIp(ipInput.value)
      })
      observer.observe(ipInput, { attributes: true, childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isEditing) {
      generateCommand()
    }
  }, [ip, scanOptions, isEditing])

  const generateCommand = () => {
    let cmdParts = ['rustscan']

    cmdParts.push(ip || '<IP>')

    if (scanOptions.accessible) {
      cmdParts.push('--accessible')
    }
    if (scanOptions.batchSize !== '4500') {
      cmdParts.push(`--batch-size ${scanOptions.batchSize}`)
    }
    if (scanOptions.timeout !== '1500') {
      cmdParts.push(`--timeout ${scanOptions.timeout}`)
    }
    if (scanOptions.ulimit !== '5000') {
      cmdParts.push(`--ulimit ${scanOptions.ulimit}`)
    }

    if (scanOptions.ports === 'full') {
      cmdParts.push('-p 1-65535')
    } 
    else if (scanOptions.ports === 'custom' && scanOptions.customPorts) {
      cmdParts.push(`-p ${scanOptions.customPorts}`)
    }
    else if (scanOptions.ports === 'range' && scanOptions.range) {
      cmdParts.push(`-r ${scanOptions.range}`)
    }

    if (scanOptions.scanOrder === 'Sequential'){
      cmdParts.push('--scan-order sequential')
    }

    if (scanOptions.greppable) {
      cmdParts.push('-g')
    }

    if (scanOptions.script !== 'None') {
      cmdParts.push(`-- ${scanOptions.script === 'Default' ? '-A' : scanOptions.script}`)
    }

    setCommand(cmdParts.join(' '))
    setEditedCommand(cmdParts.join(' '))
  }

  const handleScanOptionChange = (option, value) => {
    setScanOptions(prev => ({
      ...prev,
      [option]: value
    }))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    
    const feedback = document.createElement('div')
    feedback.className = 'copy-feedback'
    feedback.textContent = 'Command copied to clipboard!'
    document.body.appendChild(feedback)
    
    feedback.style.display = 'flex'
    
    setTimeout(() => {
      feedback.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(feedback)
      }, 300)
    }, 2000)
  }

  const handleCommandEdit = (e) => {
    setEditedCommand(e.target.value)
  }

  const handleCommandBlur = () => {
    setIsEditing(false)
    setCommand(editedCommand)
  }

  const handleCommandFocus = () => {
    setIsEditing(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commandInputRef.current.blur()
    }
  }

  return (
    <div className="rustscan-container">
      <div className="rustscan-header">
        <h2 className="rustscan-title">
          RustScan Command Generator
        </h2>
        <p className="rustscan-subtitle">
          Generate optimized RustScan commands for your penetration testing needs
        </p>
      </div>

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button 
          className={`mobile-tab ${activeTab === 'scanOptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanOptions')}
        >
          <FaCogs /> Options
        </button>
        <button 
          className={`mobile-tab ${activeTab === 'ports' ? 'active' : ''}`}
          onClick={() => setActiveTab('ports')}
        >
          <FaNetworkWired /> Ports
        </button>
        <button 
          className={`mobile-tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          <FaTerminal /> Output
        </button>
      </div>

      <div className="rustscan-content">
        {/* Desktop Columns */}
        <div className="desktop-columns">
          {/* Scan Options Column */}
          <div className={`options-column ${activeTab === 'scanOptions' ? 'mobile-active' : ''}`}>
            <div className="options-card">
              <h3 className="options-title">
                <FaCogs className="icon" /> Scan Options
              </h3>
              
              <div className="option-item">
                <label className="option-label">
                  <input
                    type="checkbox"
                    className="option-checkbox"
                    checked={scanOptions.accessible}
                    onChange={() => handleScanOptionChange('accessible', !scanOptions.accessible)}
                  />
                  <span className="option-text">Accessible Mode</span>
                  <span className="option-tooltip">
                    <FaInfoCircle />
                    <span className="tooltip-text">Slower but more reliable scanning</span>
                  </span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="option-label">Batch Size</label>
                <div className="option-input-group">
                  <input
                    type="number"
                    className="option-input"
                    value={scanOptions.batchSize}
                    onChange={(e) => handleScanOptionChange('batchSize', e.target.value)}
                    min="1"
                    max="65535"
                  />
                  <span className="option-hint">Ports per batch (default: 4500)</span>
                </div>
              </div>
              
              <div className="option-item">
                <label className="option-label">Timeout (ms)</label>
                <div className="option-input-group">
                  <input
                    type="number"
                    className="option-input"
                    value={scanOptions.timeout}
                    onChange={(e) => handleScanOptionChange('timeout', e.target.value)}
                    min="100"
                    max="10000"
                  />
                  <span className="option-hint">Response timeout (default: 1500ms)</span>
                </div>
              </div>
              
              <div className="option-item">
                <label className="option-label">Ulimit</label>
                <div className="option-input-group">
                  <input
                    type="number"
                    className="option-input"
                    value={scanOptions.ulimit}
                    onChange={(e) => handleScanOptionChange('ulimit', e.target.value)}
                    min="1000"
                    max="100000"
                  />
                  <span className="option-hint">Open files limit (default: 5000)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Port Specification Column */}
          <div className={`options-column ${activeTab === 'ports' ? 'mobile-active' : ''}`}>
            <div className="options-card">
              <h3 className="options-title">
                <FaNetworkWired className="icon" /> Port Specification
              </h3>
              
              <div className="option-item">
                <div className="port-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ports"
                      checked={scanOptions.ports === 'top1000'}
                      onChange={() => handleScanOptionChange('ports', 'top1000')}
                    />
                    <span className="radio-label">Top 1000 Ports</span>
                    <span className="radio-description">(Default)</span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ports"
                      checked={scanOptions.ports === 'full'}
                      onChange={() => handleScanOptionChange('ports', 'full')}
                    />
                    <span className="radio-label">All Ports</span>
                    <span className="radio-description">(1-65535)</span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ports"
                      checked={scanOptions.ports === 'custom'}
                      onChange={() => handleScanOptionChange('ports', 'custom')}
                    />
                    <span className="radio-label">Custom Ports</span>
                  </label>
                  
                  <input
                    className="option-input"
                    type="text"
                    value={scanOptions.customPorts}
                    onChange={(e) => handleScanOptionChange('customPorts', e.target.value)}
                    disabled={scanOptions.ports !== 'custom'}
                    placeholder="e.g., 80,443,8000-9000"
                    pattern="^(\d+(-\d+)?)(,\d+(-\d+)?)*$"
                  />
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="ports"
                      checked={scanOptions.ports === 'range'}
                      onChange={() => handleScanOptionChange('ports', 'range')}
                    />
                    <span className="radio-label">Port Range</span>
                  </label>
                  
                  <input
                    className="option-input"
                    type="text"
                    value={scanOptions.range}
                    onChange={(e) => handleScanOptionChange('range', e.target.value)}
                    disabled={scanOptions.ports !== 'range'}
                    placeholder="e.g., 1-1000"
                    pattern="^\d+-\d+$"
                  />
                </div>
              </div>
              
              <div className="option-item">
                <label className="option-label">Scan Order</label>
                <select
                  className="option-select"
                  value={scanOptions.scanOrder}
                  onChange={(e) => handleScanOptionChange('scanOrder', e.target.value)}
                >
                  <option value="Random">Random (Default)</option>
                  <option value="Sequential">Sequential</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Column */}
          <div className={`options-column ${activeTab === 'output' ? 'mobile-active' : ''}`}>
            <div className="options-card">
              <h3 className="options-title">
                <FaTerminal className="icon" /> Output & Post-Processing
              </h3>
              
              <div className="option-item">
                <label className="option-label">
                  <input
                    type="checkbox"
                    className="option-checkbox"
                    checked={scanOptions.greppable}
                    onChange={() => handleScanOptionChange('greppable', !scanOptions.greppable)}
                  />
                  <span className="option-text">Greppable Output</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="option-label">Nmap Script</label>
                <select
                  className="option-select"
                  value={scanOptions.script}
                  onChange={(e) => handleScanOptionChange('script', e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Default">Default (-A)</option>
                  <option value="-sV">Service Detection (-sV)</option>
                  <option value="-sC">Default Script Scan (-sC)</option>
                  <option value="-sV -sC">Service + Script Scan (-sV -sC)</option>
                  <option value="-O">OS Detection (-O)</option>
                  <option value="-A">Aggressive Scan (-A)</option>
                </select>
                <div className="option-hint">
                  RustScan will automatically pass discovered ports to Nmap
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Output */}
        <div className="command-container">
          <div className="command-header">
            <h3 className="command-title">Generated Command</h3>
            <button className="copy-button" onClick={copyToClipboard}>
              <FaCopy /> Copy Command
            </button>
          </div>
          <div className="command-output">
            <input
              ref={commandInputRef}
              type="text"
              className="command-input"
              value={isEditing ? editedCommand : command}
              onChange={handleCommandEdit}
              onBlur={handleCommandBlur}
              onFocus={handleCommandFocus}
              onKeyDown={handleKeyDown}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .rustscan-container {
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        .rustscan-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .rustscan-title {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .rustscan-icon {
          font-size: 1.5em;
        }
        
        .rustscan-subtitle {
          color: #7f8c8d;
          font-size: 1.2rem;
          font-weight: 500;
          margin-top: 0;
        }
        
        .rustscan-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .desktop-columns {
          display: flex;
          gap: 20px;
        }
        
        .options-column {
          flex: 1;
          display: block;
        }
        
        .options-card {
          background: rgba(255, 255, 255, 0.28);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          height: 100%;
          border: 1px solid #e0e0e0;
        }
        
        .options-title {
          font-size: 1.2rem;
          color: #3498db;
          margin-top: 0;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .icon {
          color: #7f8c8d;
        }
        
        .option-item {
          margin-bottom: 20px;
        }
        
        .option-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .option-checkbox {
          margin-right: 10px;
          accent-color: #3498db;
        }
        
        .option-text {
          vertical-align: middle;
        }
        
        .option-input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .option-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.9rem;
          width: 100%;
        }
        
        .option-select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.9rem;
          width: 100%;
          background-color: white;
        }
        
        .option-hint {
          font-size: 0.8rem;
          color: #7f8c8d;
          font-style: italic;
        }
        
        .port-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .radio-label {
          font-weight: 500;
        }
        
        .radio-description {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .command-container {
          background: rgba(255, 255, 255, 0.28);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e0e0e0;
        }
        
        .command-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .command-title {
          font-size: 1.2rem;
          color: #3498db;
          margin: 0;
        }
        
        .copy-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        
        .copy-button:hover {
          background: #2980b9;
        }
        
        .command-output {
          background: #f8f9fa;
          border-radius: 5px;
          padding: 10px;
        }
        
        .command-input {
          width: 100%;
          padding: 10px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: white;
          overflow-x: auto;
          white-space: nowrap;
        }
        
        .command-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .copy-feedback {
          position: fixed;
          bottom: 30px;
          right: 20px;
          background: #27ae60;
          color: white;
          padding: 12px 20px;
          border-radius: 5px;
          display: none;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          font-size: 0.9rem;
        }
        
        .option-tooltip {
          position: relative;
          display: inline-flex;
          margin-left: 8px;
          color: #7f8c8d;
          cursor: help;
        }
        
        .tooltip-text {
          visibility: hidden;
          width: 200px;
          background-color: #333;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.8rem;
          font-weight: normal;
        }
        
        .option-tooltip:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        
        /* Mobile styles */
        .mobile-tabs {
          display: none;
          margin-bottom: 15px;
          gap: 5px;
        }
        
        .mobile-tab {
          flex: 1;
          padding: 10px;
          background: #f8f9fa;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.9rem;
        }
        
        .mobile-tab.active {
          background: #3498db;
          color: white;
        }
        
        .mobile-active {
          display: block !important;
        }
        
        @media (max-width: 768px) {
          .desktop-columns {
            flex-direction: column;
          }
          
          .options-column {
            display: none;
          }
          
          .mobile-tabs {
            display: flex;
          }
          
          .rustscan-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .rustscan-container {
            padding: 15px;
          }
          
          .rustscan-title {
            font-size: 1.6rem;
          }
          
          .command-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .copy-button {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default RustScanMode