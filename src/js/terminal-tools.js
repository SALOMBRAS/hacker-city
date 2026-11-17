/**
 * Hacker City // Terminal Tools & Exploitation Engine
 * Comandos avançados para o terminal CLI (Hashcat, Nmap, Botnet C2, Recon)
 */
class TerminalToolsEngine {
  constructor() {
    this.dictionary = [
      { plain: 'admin123', md5: '0192023a7bbd73250516f069df18b500' },
      { plain: 'shadow2040', md5: '3c9909afec25354d551dae21590bb26e' },
      { plain: 'p@ssword', md5: '5f4dcc3b5aa765d61d8327deb882cf99' },
      { plain: 'matrix404', md5: '827ccb0eea8a706c4c34a16891f84e7b' },
      { plain: 'root_toor', md5: 'b10a8db164e0754105b7a99be72e3fe5' },
      { plain: 'secret77', md5: '7d793037a0760186574b0282f2f435e7' },
      { plain: 'hacktheplanet', md5: '5d41402abc4b2a76b9719d911017c592' }
    ];

    this.botnetNodes = 42; // Nodos zumbi padrão
  }

  // Quebrador de Hash (Hashcat CLI Simulator)
  crackHash(hashStr, onProgress, onDone) {
    let step = 0;
    const cpuFactor = window.hardwareEngine ? (4000 / window.hardwareEngine.getCooldownMs()) : 1;
    const speedBase = Math.floor(180 * cpuFactor);

    const interval = setInterval(() => {
      step += Math.floor(15 * cpuFactor);
      if (step > 100) step = 100;

      const currentSpeed = speedBase + Math.floor(Math.random() * 30);
      onProgress(step, currentSpeed);

      if (step >= 100) {
        clearInterval(interval);
        const match = this.dictionary.find(d => d.md5.toLowerCase() === hashStr.toLowerCase());
        const result = match ? match.plain : 'KEY_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        onDone(result);
      }
    }, 120);
  }

  // Varredor de Portas (Nmap Reconnaissance)
  scanPorts(ip, onDone) {
    const knownHosts = {
      '192.168.0.14': [
        { port: '21/tcp', state: 'open', service: 'ftp', banner: 'vsftpd 2.3.4 (Backdoor Exploitável)' },
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Boa HTTPd 0.94.14 (Admin Web)' }
      ],
      '10.0.1.88': [
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Apache 2.4.41 (SQLi em /api/v1/auth)' },
        { port: '3306/tcp', state: 'filtered', service: 'mysql', banner: 'MySQL Enterprise 8.0' }
      ],
      '172.16.4.12': [
        { port: '23/tcp', state: 'open', service: 'telnet', banner: 'BusyBox telnetd (Credenciais Default)' },
        { port: '554/tcp', state: 'open', service: 'rtsp', banner: 'RTSP Stream Video H.264' }
      ],
      '192.168.0.99': [
        { port: '445/tcp', state: 'open', service: 'microsoft-ds', banner: 'SMBv1 Vulnerável a EternalBlue (MS17-010)' },
        { port: '139/tcp', state: 'open', service: 'netbios-ssn', banner: 'NetBIOS Windows NT' }
      ]
    };

    setTimeout(() => {
      const results = knownHosts[ip] || [
        { port: '80/tcp', state: 'open', service: 'http', banner: 'Nginx 1.18.0 (API Gateway)' },
        { port: '8080/tcp', state: 'open', service: 'http-proxy', banner: 'Node.js Express REST Backend' }
      ];
      onDone(results);
    }, 600);
  }

  // Status da Rede Botnet C2
  getBotnetMetrics(specialty = '') {
    const isBotmaster = (specialty.toLowerCase() === 'botmaster');
    const nodes = isBotmaster ? Math.floor(this.botnetNodes * 1.5) : this.botnetNodes;
    const hashRate = (nodes * 12.4).toFixed(1);
    const hourlyIncome = (nodes * 4.2 * (isBotmaster ? 1.3 : 1.0)).toFixed(2);

    return {
      nodes,
      hashRate: `${hashRate} MH/s`,
      hourlyIncome: `$ ${hourlyIncome} HC/hora`,
      isBotmaster
    };
  }
}

window.terminalTools = new TerminalToolsEngine();
