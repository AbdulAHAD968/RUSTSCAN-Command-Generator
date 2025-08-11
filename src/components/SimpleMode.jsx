import { useState } from 'react';
import { FaCopy, FaInfoCircle } from 'react-icons/fa';
import { useIp } from '../contexts/IpContext';
import '../styles/SimpleMode.css';

const CommandCard = ({ command, onCopy }) => {
  return (
    <div className="command-card">
      <div className="command-header">
        <h4>{command.label}</h4>
        <div className="tooltip">
          <FaInfoCircle className="info-icon" />
          <span className="tooltiptext">{command.explanation}</span>
        </div>
      </div>
      <div className="command-body">
        <div className="command-text-container">
          <code className="command-text">{command.getCommand()}</code>
        </div>
        <button 
          className="copy-button" 
          onClick={() => onCopy(command.getCommand())}
          aria-label="Copy command"
        >
          <FaCopy />
        </button>
      </div>
    </div>
  );
};

const SimpleMode = () => {
  const { ip } = useIp();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [notification, setNotification] = useState("");

  const commands = [
    {
      id: 'Ulimit-Scan',
      label: 'Increase Ulimit for More Ports',
      getCommand: () => `rustscan -a ${ip} -- -sC -sV`,
      explanation: 'Raise ulimit to handle more simultaneous ports, then run Nmap scripts and service detection'
    },
    {
      id: 'Basic-Scan',
      label: 'Basic Scan',
      getCommand: () => `rustscan -a ${ip}`,
      explanation: 'Quick scan of the top 1,000 most common ports using RustScan default settings',
    },
    {
      id: 'All-Ports-Scan',
      label: 'All Ports Scan',
      getCommand: () => `rustscan -a ${ip} -r 1-65535`,
      explanation: 'Scan all 65,535 ports — faster than Nmap, but without detailed service info by default'
    },
    {
      id: 'Batch-Size-Scan',
      label: 'High Speed Scan',
      getCommand: () => `rustscan -a ${ip} -b 4500`,
      explanation: 'Increase batch size to 4,500 for faster results (risk: might overwhelm slower networks)'
    },
    {
      id: 'Nmap-Integration',
      label: 'RustScan + Nmap Aggressive Scan',
      getCommand: () => `rustscan -a ${ip} -- -A`,
      explanation: 'RustScan for port discovery, then Nmap aggressive scan (OS detect, version, scripts, traceroute)'
    },
    {
      id: 'Top-Ports-Scan',
      label: 'Top Ports Scan',
      getCommand: () => `rustscan -a ${ip} -- -F`,
      explanation: 'Scan only the top 100 most common ports quickly (uses Nmaps -F flag)',
    },
    {
      id: 'Script-Scan',
      label: 'Service & Script Scan',
      getCommand: () => `rustscan -a ${ip} -- -sC -sV`,
      explanation: 'RustScan for discovery, Nmap default scripts (-sC) and service/version detection (-sV)'
    },
    {
      id: 'Quiet-Scan',
      label: 'Quiet Scan',
      getCommand: () => `rustscan -a ${ip} -q`,
      explanation: 'Quiet mode — only shows open ports without additional output'
    },
    {
      id: 'Custom-Range',
      label: 'Custom Port Range',
      getCommand: () => `rustscan -a ${ip} -r 1-1000`,
      explanation: 'Scan a specific port range (example: 1-1000)'
    },
    {
      id: 'UDP-Scan',
      label: 'UDP Scan (via Nmap)',
      getCommand: () => `rustscan -a ${ip} -- -sU`,
      explanation: 'RustScan for discovery, then Nmap UDP scan (-sU) — slower but detects UDP services'
    }
  ];

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setNotification("Command copied to clipboard!");
    setTimeout(() => {
      setCopiedIndex(null);
      setNotification("");
    }, 2000);
  };

  return (
    <div className="simple-mode-container">
      <div className="background-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="simple-mode-content">
        <h2 className="mode-title">
          Simple <span style={{ color: 'orange', fontWeight: 'bold' }}>RUST SCAN</span> Commands
        </h2>
        <p className="mode-description">
          Pre-configured RustScan commands for fast port scanning scenarios. 
          Click any command to copy it to your clipboard.
        </p>

        <div className="commands-grid">
          {commands.map((cmd, index) => (
            <CommandCard 
              key={cmd.id}
              command={cmd}
              onCopy={(text) => copyToClipboard(text, index)}
            />
          ))}
        </div>

        <div className="tips-section">
          <h3>RustScan Tips:</h3>
          <ul>
            <li>RustScan is much faster than Nmap for port discovery</li>
            <li>Use <code>--</code> to pass arguments to Nmap for detailed analysis</li>
            <li>Adjust batch size with <code>-b</code> (default 4500, max 65535)</li>
            <li>Use <code>-t</code> to set timeout in milliseconds (default 1500)</li>
            <li>Combine with Nmap for best of both worlds: speed + detail</li>
          </ul>
        </div>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default SimpleMode;