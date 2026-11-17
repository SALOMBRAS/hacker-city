/**
 * Hacker City // Terminal Tools & Hash Cracker Engine
 * Comandos avançados para o terminal CLI
 */
class TerminalToolsEngine {
  constructor() {
    this.dictionary = [
      { plain: 'admin123', md5: '0192023a7bbd73250516f069df18b500' },
      { plain: 'shadow2040', md5: '3c9909afec25354d551dae21590bb26e' },
      { plain: 'p@ssword', md5: '5f4dcc3b5aa765d61d8327deb882cf99' },
      { plain: 'matrix404', md5: '827ccb0eea8a706c4c34a16891f84e7b' },
      { plain: 'root_toor', md5: 'b10a8db164e0754105b7a99be72e3fe5' }
    ];
  }

  // Quebrador de Hash Clandestino
  crackHash(hashStr, onProgress, onDone) {
    let step = 0;
    const interval = setInterval(() => {
      step += 20;
      const speed = Math.floor(180 + Math.random() * 40);
      onProgress(step, speed);

      if (step >= 100) {
        clearInterval(interval);
        const match = this.dictionary.find(d => d.md5.toLowerCase() === hashStr.toLowerCase());
        onDone(match ? match.plain : 'PALAVRA_CHAVE_FORCA_BRUTA_' + Math.floor(1000 + Math.random() * 8999));
      }
    }, 150);
  }
}

window.terminalTools = new TerminalToolsEngine();
