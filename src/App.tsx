import React, { useState, useEffect } from 'react';
import {
  Shield,
  Terminal,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Bot,
  Cpu,
  Wifi,
  Activity,
  Radio,
  Clock,
  Lock,
  Zap,
  Menu,
  X
} from 'lucide-react';
import type { TabType, SystemStats, SecurityEvent, SecurityCheckItem, Task, Note, ChatMessage } from './types';

// Mock Initial Data
const initialStats: SystemStats = {
  cpuUsage: 42,
  memoryUsage: 68,
  neuralLatency: 14.2,
  activeNodes: 128,
  threatLevel: 'NOMINAL',
  networkTraffic: 342.8,
  uptime: '7d 14h 22m'
};

const initialEvents: SecurityEvent[] = [
  {
    id: 'evt-1',
    timestamp: '14:22:05',
    type: 'FIREWALL_BLOCK',
    source: '192.168.4.12',
    destination: 'Core-Relay-Alpha',
    severity: 'medium',
    details: 'Blocked unauthorized connection attempt on port 443.'
  },
  {
    id: 'evt-2',
    timestamp: '14:21:40',
    type: 'PORT_SCAN',
    source: '10.0.12.99',
    destination: 'Subnet-Beta',
    severity: 'low',
    details: 'Sequential port scan detected and rate-limited.'
  },
  {
    id: 'evt-3',
    timestamp: '14:19:12',
    type: 'AI_ANOMALY',
    source: 'Neural-Engine-01',
    destination: 'Memory-Cluster',
    severity: 'low',
    details: 'Minor packet entropy variance normalized by auto-shaper.'
  }
];

const initialChecklist: SecurityCheckItem[] = [
  { id: 'chk-1', category: 'Authentication', title: 'Multi-Factor Biometrics', description: 'Enforce hardware-token or neural signature 2FA across all admin nodes.', status: 'secure', completed: true },
  { id: 'chk-2', category: 'Encryption', title: 'Quantum-Resistant TLS 1.5', description: 'Ensure all external tunnels use post-quantum lattice cryptography.', status: 'secure', completed: true },
  { id: 'chk-3', category: 'Perimeter', title: 'Zero-Trust Microsegmentation', description: 'Isolate containerized workloads with dynamic service-mesh firewalls.', status: 'warning', completed: false },
  { id: 'chk-4', category: 'Audit', title: 'Immutable Audit Ledger', description: 'Replicate security logs to tamper-proof WORM storage nodes.', status: 'secure', completed: true },
  { id: 'chk-5', category: 'Hardware', title: 'Firmware Integrity Attestation', description: 'Verify TPM 2.0 PCR registers against golden reference hashes.', status: 'advisory', completed: false }
];

const initialTasks: Task[] = [
  { id: 'tsk-1', title: 'Rotate TLS certificates for Gateway 7', priority: 'high', completed: false, timestamp: '10:00 AM' },
  { id: 'tsk-2', title: 'Run vulnerability scan on secondary storage cluster', priority: 'normal', completed: true, timestamp: 'Yesterday' },
  { id: 'tsk-3', title: 'Review neural net anomaly thresholds', priority: 'critical', completed: false, timestamp: 'Yesterday' },
  { id: 'tsk-4', title: 'Archive quarterly security compliance logs', priority: 'low', completed: true, timestamp: '3 days ago' }
];

const initialNotes: Note[] = [
  { id: 'note-1', title: 'Protocol Zero Incident Response', content: 'In case of active perimeter breach: 1. Isolate subnet alpha. 2. Purge volatile memory caches. 3. Notify Chief Security Officer via encrypted channel.', category: 'Security', updatedAt: '2026-10-18' },
  { id: 'note-2', title: 'AI Cluster Optimization Ideas', content: 'Increase vector embedding dimensions from 1536 to 3072 for higher precision threat correlation. Monitor VRAM usage during peak inference.', category: 'AI Lab', updatedAt: '2026-10-19' }
];

const initialMessages: ChatMessage[] = [
  { id: 'msg-1', sender: 'nexus', text: 'NEXUS Neural Assistant online. Ready for cyber intelligence queries or system diagnostics.', timestamp: '14:00' }
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<SystemStats>(initialStats);
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents);
  const [checklist, setChecklist] = useState<SecurityCheckItem[]>(initialChecklist);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_tasks_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // In case of parsing error or corruption, fall back gracefully
    }
    return initialTasks;
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // In case of parsing error or corruption, fall back gracefully
    }
    return initialNotes;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'success' | 'alert' }[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command Console state
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<{ type: 'input' | 'output' | 'error' | 'success'; text: string }[]>([
    { type: 'output', text: 'NEXUS Cyber-OS v4.9.2 [Secure Shell]' },
    { type: 'output', text: 'Type "help" to view available commands. All actions verified & sandboxed.' }
  ]);

  // Task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'normal' | 'high' | 'critical'>('normal');

  // Note input state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('General');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Save notes and tasks to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nexus_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  // Check backend proxy and FreeLLMAPI gateway health
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (data.isConfigured) {
            setAiStatus('connected');
          } else {
            setAiStatus('disconnected');
          }
        } else {
          setAiStatus('disconnected');
        }
      } catch {
        setAiStatus('disconnected');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Live Clock & Stats fluctuation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));

      // Slight realistic fluctuations in stats
      setStats(prev => ({
        ...prev,
        cpuUsage: Math.min(95, Math.max(15, Math.round(prev.cpuUsage + (Math.random() * 10 - 5)))),
        memoryUsage: Math.min(90, Math.max(40, Math.round(prev.memoryUsage + (Math.random() * 4 - 2)))),
        neuralLatency: +(prev.neuralLatency + (Math.random() * 2 - 1)).toFixed(1),
        networkTraffic: +(prev.networkTraffic + (Math.random() * 20 - 10)).toFixed(1)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Periodic random security event simulation
  useEffect(() => {
    const eventTimer = setInterval(() => {
      const types: SecurityEvent['type'][] = ['INTRUSION_ATTEMPT', 'PORT_SCAN', 'FIREWALL_BLOCK', 'AI_ANOMALY'];
      const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      const ip = `${Math.floor(Math.random()*200)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

      const newEvt: SecurityEvent = {
        id: 'evt-' + Date.now(),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: randomType,
        source: ip,
        destination: 'Zone-' + ['Alpha', 'Beta', 'Gamma', 'Core'][Math.floor(Math.random()*4)],
        severity: randomSeverity,
        details: `Automated telemetry detected ${randomType.toLowerCase().replace('_', ' ')} from external peer.`
      };

      setEvents(prev => [newEvt, ...prev.slice(0, 19)]);

      if (randomSeverity === 'high') {
        addNotification(`High severity ${randomType} detected from ${ip}!`, 'alert');
      }
    }, 15000);
    return () => clearInterval(eventTimer);
  }, []);

  const addNotification = (text: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = 'notif-' + Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Command Console handler
  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim().toLowerCase();
    const newHistory = [...consoleOutput, { type: 'input' as const, text: `nexus@ai-core:~$ ${consoleInput}` }];

    setConsoleInput('');

    const args = cmd.split(' ');
    const mainCmd = args[0];

    switch (mainCmd) {
      case 'help':
        newHistory.push({ type: 'output', text: 'AVAILABLE COMMANDS:\n  help        - Display this command reference\n  status      - Display detailed core system telemetry\n  scan        - Run simulated rapid vulnerability scan\n  matrix      - Stream neural matrix packets\n  nodes       - List active security subnets\n  clear       - Clear console buffer\n  ai-diag     - Run neural network diagnostic\n  ping <host> - Test quantum ping latency' });
        break;
      case 'status':
        newHistory.push({ type: 'output', text: `SYSTEM STATUS REPORT:\n- CPU Load: ${stats.cpuUsage}%\n- Memory Allocated: ${stats.memoryUsage}%\n- Neural Latency: ${stats.neuralLatency}ms\n- Threat Level: ${stats.threatLevel}\n- Active Subnet Nodes: ${stats.activeNodes}\n- Secure Uptime: ${stats.uptime}` });
        break;
      case 'scan':
        newHistory.push({ type: 'success', text: '[+] Initiating rapid local hardening scan...\n[+] Checking port bindings... All secure.\n[+] Verifying kernel integrity... PASSED.\n[+] Scan complete. 0 vulnerabilities found.' });
        addNotification('Rapid security scan completed successfully.', 'success');
        break;
      case 'matrix':
        newHistory.push({ type: 'success', text: '01001110 01000101 01011000 01010101 01010011 -- NEURAL MATRIX STREAM ACTIVE -- 99.8% FIDELITY' });
        break;
      case 'nodes':
        newHistory.push({ type: 'output', text: 'ACTIVE SUBNET NODES:\n[01] Core-Relay-Alpha (ONLINE - 2.1ms)\n[02] Perimeter-Defense-Beta (SECURE - 4.5ms)\n[03] Vault-Storage-Gamma (ENCRYPTED - 1.8ms)\n[04] Neural-Inference-Delta (ACTIVE - 0.9ms)' });
        break;
      case 'clear':
        setConsoleOutput([]);
        return;
      case 'ai-diag':
        newHistory.push({ type: 'success', text: '[AI DIAGNOSTIC]: Neural weights optimal. Attention heads synchronized. Zero gradient drift detected.' });
        break;
      case 'ping':
        const target = args[1] || 'gateway.nexus.internal';
        newHistory.push({ type: 'output', text: `PING ${target} (127.0.0.1) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=118 time=0.412 ms\n64 bytes from ${target}: icmp_seq=2 ttl=118 time=0.389 ms\n--- ${target} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss` });
        break;
      default:
        newHistory.push({ type: 'error', text: `Command not recognized: "${consoleInput}". Type "help" for a list of valid commands.` });
    }

    setConsoleOutput(newHistory);
  };

  // AI Chat handler
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // Build conversation payload formatted for standard chat completions
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Proxy error: HTTP ${res.status}`);
      }

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'nexus',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setAiStatus('connected');
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'nexus',
        text: `[SYSTEM ALERT - NEURAL LINK ERROR]: ${err.message || 'Unable to communicate with FreeLLMAPI gateway.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setAiStatus('disconnected');
      addNotification('AI request failed: Check backend & FreeLLMAPI status.', 'alert');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setChatInput(promptText);
  };

  // Task actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: 'tsk-' + Date.now(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      timestamp: 'Just now'
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    addNotification('New operational task created.', 'success');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Note actions
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    if (editingNoteId) {
      setNotes(prev => prev.map(n => n.id === editingNoteId ? {
        ...n,
        title: newNoteTitle,
        content: newNoteContent,
        category: newNoteCategory,
        updatedAt: new Date().toISOString().split('T')[0]
      } : n));
      setEditingNoteId(null);
      addNotification('Neural note updated successfully.', 'success');
    } else {
      const newNote: Note = {
        id: 'note-' + Date.now(),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        category: newNoteCategory,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setNotes(prev => [newNote, ...prev]);
      addNotification('New neural note stored.', 'success');
    }
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteCategory(note.category);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setNewNoteTitle('');
      setNewNoteContent('');
    }
    addNotification('Neural note deleted.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#c0c2ce] flex flex-col font-mono select-none relative scanlines">
      {/* Top Notification Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`pointer-events-auto px-4 py-3 rounded border text-xs flex items-center gap-3 backdrop-blur-md shadow-xl transition-all duration-300 animate-slide-in ${
              n.type === 'alert'
                ? 'bg-red-950/80 border-red-500 text-red-200 glow-violet'
                : n.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 glow-green'
                : 'bg-slate-900/90 border-[#00f0ff]/50 text-[#00f0ff] glow-cyan-sm'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0 animate-pulse" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="h-16 bg-[#090a10]/90 border-b border-[#00f0ff]/20 px-6 flex items-center justify-between z-40 backdrop-blur sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#00f0ff] hover:text-white p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/50 glow-cyan-sm">
              <Shield className="w-5 h-5 text-[#00f0ff]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-white m-0 flex items-center gap-2">
                NEXUS <span className="text-xs text-[#00f0ff] font-normal px-1.5 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30">AI COMMAND</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider">CYBERSECURITY WORKSTATION V4.9</p>
            </div>
          </div>
        </div>

        {/* System Status Ticker / Header Info */}
        <div className="hidden lg:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2 bg-[#050508] px-3 py-1.5 rounded border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">THREAT STATUS:</span>
            <span className="text-emerald-400 font-bold tracking-wider">{stats.threatLevel}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#050508] px-3 py-1.5 rounded border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-slate-400">CPU:</span>
            <span className="text-[#00f0ff] font-bold">{stats.cpuUsage}%</span>
          </div>
          <div className="flex items-center gap-2 bg-[#050508] px-3 py-1.5 rounded border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-[#b000ff]" />
            <span className="text-slate-400">NET:</span>
            <span className="text-[#b000ff] font-bold">{stats.networkTraffic} MB/s</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>{currentTime || 'Synchronizing UTC...'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] font-bold text-xs">
            NX
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#07080e] border-r border-[#00f0ff]/20 flex flex-col transition-transform duration-300 transform
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-16 md:pt-0
        `}>
          <div className="p-4 border-b border-slate-800/80">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest px-2 mb-2">Navigation Matrix</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
                { id: 'security', label: 'Cyber Defense', icon: Shield, badge: events.length },
                { id: 'console', label: 'Command Console', icon: Terminal },
                { id: 'tasks', label: 'Task Operations', icon: CheckSquare, badge: tasks.filter(t => !t.completed).length },
                { id: 'notes', label: 'Neural Notes', icon: FileText },
                { id: 'ai', label: 'AI Assistant', icon: Bot },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs transition-all ${
                      isActive
                        ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/40 glow-cyan-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-[#00f0ff] text-black font-bold' : 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar System Telemetry Widget */}
          <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#00f0ff]" /> ENCRYPTION
                </span>
                <span className="text-emerald-400 font-bold">AES-GCM-256</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">NEURAL LOAD</span>
                  <span className="text-[#00f0ff]">{stats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00f0ff] to-[#b000ff] h-full transition-all duration-500"
                    style={{ width: `${stats.cpuUsage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">MEMORY CACHE</span>
                  <span className="text-[#b000ff]">{stats.memoryUsage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#b000ff] to-[#00f0ff] h-full transition-all duration-500"
                    style={{ width: `${stats.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 cyber-grid">

          {/* ================= TAB 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090a10]/80 p-5 rounded-lg border border-[#00f0ff]/20 backdrop-blur">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#00f0ff]" /> CENTRAL COMMAND OVERVIEW
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry and defensive posture monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => addNotification('Manual telemetry sync executed.', 'success')}
                    className="px-3 py-1.5 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] text-xs transition flex items-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Sync Telemetry
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'CPU Load', value: `${stats.cpuUsage}%`, sub: 'Nominal frequency', icon: Cpu, color: 'text-[#00f0ff]', border: 'border-[#00f0ff]/30', bg: 'bg-[#00f0ff]/5' },
                  { label: 'Memory Allocated', value: `${stats.memoryUsage}%`, sub: '32.4 GB / 64 GB', icon: Activity, color: 'text-[#b000ff]', border: 'border-[#b000ff]/30', bg: 'bg-[#b000ff]/5' },
                  { label: 'Neural Latency', value: `${stats.neuralLatency} ms`, sub: 'Sub-quantum speed', icon: Zap, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
                  { label: 'Active Subnet Nodes', value: stats.activeNodes, sub: 'All clusters secure', icon: Shield, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`p-4 rounded-lg bg-[#090a10]/90 border ${stat.border} ${stat.bg} backdrop-blur shadow-lg flex flex-col justify-between`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400">{stat.label}</span>
                        <div className={`p-2 rounded bg-slate-900 border ${stat.border}`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Charts & Telemetry Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulated Waveform / Chart */}
                <div className="lg:col-span-2 bg-[#090a10]/90 rounded-lg border border-[#00f0ff]/20 p-5 backdrop-blur flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#00f0ff]" /> NETWORK THREAT SPECTRUM & BANDWIDTH
                    </h3>
                    <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE STREAM
                    </span>
                  </div>

                  {/* Custom SVG Area Chart */}
                  <div className="h-48 w-full bg-[#050508] rounded border border-slate-800/80 p-2 relative flex items-end">
                    <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="gradCyan" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,120 Q 50,60 100,90 T 200,40 T 300,80 T 400,30 T 500,70 L 500,150 L 0,150 Z"
                        fill="url(#gradCyan)"
                      />
                      <path
                        d="M 0,120 Q 50,60 100,90 T 200,40 T 300,80 T 400,30 T 500,70"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="absolute bottom-2 left-3 text-[10px] text-slate-500">T-60s</div>
                    <div className="absolute bottom-2 right-3 text-[10px] text-slate-500">NOW ({stats.networkTraffic} MB/s)</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PACKET INSPECTION</span>
                      <span className="text-white font-bold">99.998% Clean</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">FIREWALL RULES</span>
                      <span className="text-[#00f0ff] font-bold">1,420 Active</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SYSTEM UPTIME</span>
                      <span className="text-emerald-400 font-bold">{stats.uptime}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Security Status / Feed Preview */}
                <div className="bg-[#090a10]/90 rounded-lg border border-[#b000ff]/20 p-5 backdrop-blur flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-[#b000ff]" /> SECURITY INCIDENT STREAM
                    </h3>
                    <div className="space-y-3">
                      {events.slice(0, 4).map(evt => (
                        <div key={evt.id} className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${evt.severity === 'high' ? 'text-red-400' : evt.severity === 'medium' ? 'text-amber-400' : 'text-cyan-400'}`}>
                              {evt.type}
                            </span>
                            <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{evt.source} → {evt.destination}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="w-full mt-4 py-2 bg-[#b000ff]/10 hover:bg-[#b000ff]/20 border border-[#b000ff]/40 text-[#b000ff] text-xs rounded transition font-semibold"
                  >
                    View All Threat Logs →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CYBER SECURITY ================= */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-[#090a10]/90 p-5 rounded-lg border border-[#00f0ff]/20 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#00f0ff]" /> CYBERSECURITY COMMAND & HARDENING
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live simulated threat feed, security checklist, and defensive posture hardening.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      addNotification('Simulated active threat neutralization complete.', 'success');
                    }}
                    className="px-3 py-1.5 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-xs transition flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5" /> Purge Threat Vectors
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Checklist */}
                <div className="bg-[#090a10]/90 rounded-lg border border-[#00f0ff]/20 p-5 backdrop-blur flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#00f0ff]" /> HARDENING CHECKLIST
                    </h3>
                    <span className="text-xs text-slate-400">
                      {checklist.filter(c => c.completed).length} / {checklist.length} Completed
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, completed: !c.completed } : c));
                        }}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-slate-950/40 border-emerald-500/30 opacity-75'
                            : 'bg-slate-900/80 border-slate-800 hover:border-[#00f0ff]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {}}
                              className="mt-1 accent-[#00f0ff] cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threat Feed Log */}
                <div className="bg-[#090a10]/90 rounded-lg border border-[#b000ff]/20 p-5 backdrop-blur flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#b000ff]" /> SIMULATED THREAT FEED
                    </h3>
                    <span className="text-xs text-[#b000ff] bg-[#b000ff]/10 px-2 py-0.5 rounded border border-[#b000ff]/30">
                      REAL-TIME
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {events.map(evt => (
                      <div key={evt.id} className="p-3 rounded bg-slate-950/80 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${evt.severity === 'high' ? 'bg-red-500' : evt.severity === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                            <span className="font-bold text-white">{evt.type}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{evt.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Source: <span className="text-[#00f0ff]">{evt.source}</span> → Dest: <span className="text-[#b000ff]">{evt.destination}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{evt.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: COMMAND CONSOLE ================= */}
          {activeTab === 'console' && (
            <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[#07080e] rounded-lg border border-[#00f0ff]/30 shadow-2xl overflow-hidden">
              {/* Console Window Header */}
              <div className="h-10 bg-[#090a10] border-b border-[#00f0ff]/20 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-bold">nexus@ai-core:~ (secure-shell)</span>
                </div>
                <div className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
                  SANDBOXED MODE
                </div>
              </div>

              {/* Console Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs font-mono bg-[#050508]/90">
                {consoleOutput.map((item, index) => (
                  <div key={index} className={`whitespace-pre-wrap ${
                    item.type === 'input'
                      ? 'text-[#00f0ff] font-bold'
                      : item.type === 'error'
                      ? 'text-red-400'
                      : item.type === 'success'
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Console Input Bar */}
              <form onSubmit={handleConsoleSubmit} className="p-3 bg-[#090a10] border-t border-[#00f0ff]/20 flex items-center gap-2">
                <span className="text-[#00f0ff] font-bold">nexus@ai-core:~$</span>
                <input
                  type="text"
                  value={consoleInput}
                  onChange={e => setConsoleInput(e.target.value)}
                  placeholder="Type a command (help, status, scan, matrix, nodes, ai-diag, clear, ping)..."
                  className="flex-1 bg-transparent text-white text-xs outline-none font-mono placeholder:text-slate-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 text-[#00f0ff] rounded text-xs transition font-bold"
                >
                  Execute
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 4: TASK MANAGER ================= */}
          {activeTab === 'tasks' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#090a10]/90 p-5 rounded-lg border border-[#00f0ff]/20 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#00f0ff]" /> OPERATIONAL TASK MANAGER
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage security operations, maintenance items, and deployment checklists.</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                  Total Pending: <span className="text-[#00f0ff] font-bold">{tasks.filter(t => !t.completed).length}</span>
                </div>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="bg-[#090a10]/90 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Enter new operation task title..."
                  className="flex-1 bg-[#050508] border border-slate-800 focus:border-[#00f0ff]/60 px-3 py-2 rounded text-xs text-white outline-none font-mono"
                />
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="bg-[#050508] border border-slate-800 text-slate-300 px-3 py-2 rounded text-xs outline-none font-mono"
                >
                  <option value="low">Priority: Low</option>
                  <option value="normal">Priority: Normal</option>
                  <option value="high">Priority: High</option>
                  <option value="critical">Priority: Critical</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 text-[#00f0ff] rounded text-xs transition font-bold"
                >
                  Add Task
                </button>
              </form>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg bg-[#090a10]/90 border flex items-center justify-between gap-4 transition-all ${
                      task.completed ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75' : 'border-slate-800 hover:border-[#00f0ff]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="w-4 h-4 accent-[#00f0ff] cursor-pointer"
                      />
                      <div>
                        <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">{task.timestamp}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            task.priority === 'critical' ? 'bg-red-950 text-red-300 border border-red-500/40' :
                            task.priority === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: NOTES PANEL ================= */}
          {activeTab === 'notes' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="bg-[#090a10]/90 p-5 rounded-lg border border-[#00f0ff]/20 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00f0ff]" /> NEURAL NOTES (BROWSER STORAGE)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Securely record operational findings, protocols, and architectural ideas.</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                  Saved Notes: <span className="text-[#00f0ff] font-bold">{notes.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Note Editor Form */}
                <div className="bg-[#090a10]/90 rounded-lg border border-[#00f0ff]/30 p-5 backdrop-blur flex flex-col">
                  <h3 className="text-sm font-bold text-white mb-4">
                    {editingNoteId ? 'Edit Neural Note' : 'Create New Note'}
                  </h3>
                  <form onSubmit={handleSaveNote} className="space-y-4 flex-1 flex flex-col">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Note Title</label>
                      <input
                        type="text"
                        value={newNoteTitle}
                        onChange={e => setNewNoteTitle(e.target.value)}
                        placeholder="Incident response plan..."
                        className="w-full bg-[#050508] border border-slate-800 focus:border-[#00f0ff]/60 px-3 py-2 rounded text-xs text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Category</label>
                      <select
                        value={newNoteCategory}
                        onChange={e => setNewNoteCategory(e.target.value)}
                        className="w-full bg-[#050508] border border-slate-800 text-slate-300 px-3 py-2 rounded text-xs outline-none font-mono"
                      >
                        <option value="Security">Security</option>
                        <option value="AI Lab">AI Lab</option>
                        <option value="Protocols">Protocols</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">Content</label>
                      <textarea
                        value={newNoteContent}
                        onChange={e => setNewNoteContent(e.target.value)}
                        placeholder="Type encrypted markdown/text notes here..."
                        rows={6}
                        className="w-full flex-1 bg-[#050508] border border-slate-800 focus:border-[#00f0ff]/60 p-3 rounded text-xs text-white outline-none font-mono resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/50 text-[#00f0ff] rounded text-xs transition font-bold"
                      >
                        {editingNoteId ? 'Update Note' : 'Save Note'}
                      </button>
                      {editingNoteId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNewNoteTitle('');
                            setNewNoteContent('');
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Notes Cards Grid */}
                <div className="lg:col-span-2 space-y-4">
                  {notes.length === 0 ? (
                    <div className="bg-[#090a10]/90 rounded-lg border border-slate-800 p-8 text-center text-slate-500 text-xs">
                      No neural notes stored yet. Create your first note using the form.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {notes.map(note => (
                        <div key={note.id} className="bg-[#090a10]/90 rounded-lg border border-slate-800 hover:border-[#00f0ff]/40 p-4 flex flex-col justify-between transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded border border-[#00f0ff]/30">
                                {note.category}
                              </span>
                              <span className="text-[10px] text-slate-500">{note.updatedAt}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white mb-2">{note.title}</h4>
                            <p className="text-[11px] text-slate-300 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                            <button
                              onClick={() => startEditNote(note)}
                              className="text-slate-400 hover:text-[#00f0ff] transition px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-slate-500 hover:text-red-400 transition px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: AI ASSISTANT ================= */}
          {activeTab === 'ai' && (
            <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[#07080e] rounded-lg border border-[#00f0ff]/30 shadow-2xl overflow-hidden">
              {/* AI Assistant Header Banner */}
              <div className="bg-[#090a10] border-b border-[#00f0ff]/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#b000ff]/20 border border-[#b000ff]/50 flex items-center justify-center glow-violet-sm">
                    <Bot className="w-5 h-5 text-[#b000ff]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wider">NEXUS NEURAL AI ASSISTANT</h3>
                    {aiStatus === 'connected' ? (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        NEXUS NEURAL CORE: ONLINE (FreeLLMAPI Active)
                      </p>
                    ) : aiStatus === 'checking' ? (
                      <p className="text-[10px] text-cyan-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Connecting to local AI gateway...
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        GATEWAY OFFLINE: Configure FREE_LLM_API_KEY in .env & start backend proxy
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMessages([initialMessages[0]])}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>

              {/* Quick Prompts Bar */}
              <div className="bg-[#050508] px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-slate-500 shrink-0">Quick Prompts:</span>
                {[
                  "Check system health status",
                  "What is our current threat level?",
                  "Explain zero-trust microsegmentation",
                  "How do I configure live API keys?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-[#00f0ff]/10 border border-slate-800 hover:border-[#00f0ff]/40 text-[11px] text-slate-300 hover:text-[#00f0ff] whitespace-nowrap transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#050508]/80 text-xs font-mono">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-slate-500">
                        {msg.sender === 'user' ? 'COMMANDER' : 'NEXUS AI'} • {msg.timestamp}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-lg max-w-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-white rounded-br-none'
                        : 'bg-slate-900/90 border border-[#b000ff]/30 text-slate-200 rounded-bl-none glow-violet-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-900/50 p-3 rounded-lg w-fit border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                    <span>NEXUS AI is synthesizing neural response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleChatSend} className="p-4 bg-[#090a10] border-t border-[#00f0ff]/20 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask NEXUS AI for cybersecurity insights or system telemetry..."
                  className="flex-1 bg-[#050508] border border-slate-800 focus:border-[#00f0ff]/60 px-4 py-2.5 rounded text-xs text-white outline-none font-mono"
                  disabled={isAiTyping}
                />
                <button
                  type="submit"
                  disabled={isAiTyping || !chatInput.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#b000ff] hover:opacity-90 disabled:opacity-50 text-black font-bold rounded text-xs transition glow-cyan-sm"
                >
                  Transmit
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
