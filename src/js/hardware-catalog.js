/**
 * Hacker City // Catálogo de Hardware & Upgrades de Setup
 * Controla os componentes de máquina e seus bônus de desempenho
 */
const HARDWARE_CATALOG = {
  cpu: [
    { id: 'celeron_800', name: 'Intel Celeron 800MHz (Sucata)', price: 0, cooldown_ms: 4000, desc: 'Processador de lixão. Cooldown de 4.0s por invasão.' },
    { id: 'pentium_4', name: 'Intel Pentium 4 2.8GHz', price: 250, cooldown_ms: 3200, desc: 'Clássico socket 478. Reduz cooldown para 3.2s.' },
    { id: 'core_2_quad', name: 'Intel Core 2 Quad Q6600', price: 650, cooldown_ms: 2400, desc: '4 núcleos reais. Reduz cooldown para 2.4s.' },
    { id: 'xeon_server', name: 'Dual Xeon E5 Clandestino', price: 1800, cooldown_ms: 1600, desc: 'Poder de servidor rack. Cooldown reduzido para 1.6s.' },
    { id: 'quantum_core', name: 'Quantum Core QX-99 Prototype', price: 5500, cooldown_ms: 1000, desc: 'Processador quântico de laboratório. Cooldown mínimo de 1.0s.' }
  ],
  ram: [
    { id: 'ram_256mb', name: '256MB SDRAM PC133', price: 0, desc: 'Memória mínima. Limite de 1 tarefa em segundo plano.' },
    { id: 'ram_1gb', name: '1GB DDR 400MHz', price: 180, desc: 'Permite rodar scripts secundários no terminal.' },
    { id: 'ram_4gb', name: '4GB DDR2 Dual Channel', price: 420, desc: '+15% de velocidade geral em decodificação.' },
    { id: 'ram_16gb', name: '16GB DDR4 Corsair Vengeance', price: 1200, desc: '+25% de rendimento na rede de bots zumbi.' },
    { id: 'ram_64gb', name: '64GB ECC Server Registered', price: 3200, desc: 'Capacidade máxima para minerar em múltiplos nós.' }
  ],
  network: [
    { id: 'net_56k', name: 'Modem Discado 56kbps V.90', price: 0, desc: 'Conexão discada ruidosa. Alta latência.' },
    { id: 'net_fast_100', name: 'Placa de Rede Realtek 100Mbps', price: 140, desc: 'Banda larga inicial cabeada.' },
    { id: 'net_gigabit', name: 'Adaptador Gigabit 1000Mbps', price: 450, desc: '+20% de grana coletada por segundo em ataques.' },
    { id: 'net_fiber_10g', name: 'Fibra Óptica Direta 10Gbps Darknet', price: 2100, desc: '+40% de bônus em transações e invasões corporativas.' }
  ]
};

window.HARDWARE_CATALOG = HARDWARE_CATALOG;
