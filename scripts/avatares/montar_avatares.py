"""Retratos de perfil: registra os jobs gerados, baixa os originais, trata e monta o catálogo.

Uso, da raiz do repositório:
  python3 -I scripts/avatares/montar_avatares.py registrar <relatorio.txt> [motor]
      Lê linhas "hc-av-NN | job_id | completed | url": grava motor e job em retratos.json e guarda
      a URL em origens.local.txt (motor padrão: z_image).
  python3 -I scripts/avatares/montar_avatares.py montar <pasta-dos-originais>
      Baixa para a pasta os originais que faltam (<id>.png), trata cada retrato que tem origem,
      grava assets/avatars/<id>.webp (384 px) e assets/avatars/mini/<id>.webp (160 px), apaga o
      WebP de retrato que saiu da lista e reescreve src/js/avatar-catalog.js.

Os originais vêm de fora: deixe-os numa pasta própria, fora do repositório. As URLs de download
ficam só em origens.local.txt (fora do git): elas levam o identificador da conta que gerou.

Tratamento: corta a borda do caderno (linha reta escura perto da borda), completa até quadrado,
normaliza os níveis e pinta com a tinta e o papel do jogo, para que retratos de motores
diferentes saiam com o mesmo papel e o mesmo grafite.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps, ImageStat

RAIZ = Path(__file__).resolve().parents[2]
RETRATOS = Path(__file__).resolve().with_name("retratos.json")
ORIGENS_LOCAIS = Path(__file__).resolve().with_name("origens.local.txt")
ASSETS = RAIZ / "assets" / "avatars"
CATALOGO = RAIZ / "src" / "js" / "avatar-catalog.js"

TINTA = (20, 24, 29)      # grafite no tom escuro da interface (#14181d)
PAPEL = (238, 237, 232)   # papel levemente quente (#eeede8)
TAMANHOS = {"": 384, "mini": 160}
PASSO = 0.01
LIMITE = 0.12             # nunca corta mais de 12% de um lado
ID_VALIDO = re.compile(r"^hc-av-\d{2}$")


# ---------------------------------------------------------------------------
# Tratamento da imagem
# ---------------------------------------------------------------------------
def mediana(img, caixa):
    return ImageStat.Stat(img.crop(caixa)).median[0]


def fracao_escura(img, caixa, limiar):
    hist = img.crop(caixa).histogram()
    total = sum(hist)
    return sum(hist[:limiar]) / total if total else 0.0


def aparar_bordas(g):
    """Corta até depois da última linha reta escura perto de cada borda.

    Borda de caderno, lombada e sombra da página viram linhas que atravessam mais da
    metade da imagem; o traço do desenho nunca faz isso tão perto da borda.
    """
    w, h = g.size
    papel = mediana(g, (w // 4, h // 20, 3 * w // 4, h // 6))  # topo central: quase sempre papel
    limiar = max(1, int(papel - 18))
    lw, lh = int(w * LIMITE), int(h * LIMITE)
    coluna = lambda x: fracao_escura(g, (x, 0, x + 1, h), limiar) > 0.5
    linha = lambda y: fracao_escura(g, (0, y, w, y + 1), limiar) > 0.5
    esq = max((x + 1 for x in range(lw) if coluna(x)), default=0)
    dir_ = min((x for x in range(w - lw, w) if coluna(x)), default=w)
    topo = max((y + 1 for y in range(lh) if linha(y)), default=0)
    base = min((y for y in range(h - lh, h) if linha(y)), default=h)
    if (esq, topo, dir_, base) != (0, 0, w, h):
        folga = max(2, int(min(w, h) * PASSO * 1.5))  # tira também a sombra que acompanha a borda
        esq, topo = min(esq + folga, w - 1), min(topo + folga, h - 1)
        dir_, base = max(dir_ - folga, esq + 1), max(base - folga, topo + 1)
    return g.crop((esq, topo, dir_, base)), (esq, topo, w - dir_, h - base)


def quadrado(g):
    w, h = g.size
    if h > w and h - w <= 0.15 * h:
        return g.crop((0, 0, w, w))  # sobra pequena na altura: sai da base (roupa), nunca do cabelo
    if w > h and w - h <= 0.15 * w:
        x = (w - h) // 2
        return g.crop((x, 0, x + h, h))
    lado = max(w, h)
    fundo = int(mediana(g, (0, 0, w, max(1, h // 20))))
    tela = Image.new("L", (lado, lado), fundo)
    tela.paste(g, ((lado - w) // 2, (lado - h) // 2))
    return tela


def tratar(origem):
    g = Image.open(origem).convert("L")
    g, cortes = aparar_bordas(g)
    g = quadrado(g)
    g = ImageOps.autocontrast(g, cutoff=(0.5, 2))
    return ImageOps.colorize(g, black=TINTA, white=PAPEL), cortes


# ---------------------------------------------------------------------------
# retratos.json e catálogo
# ---------------------------------------------------------------------------
def ler():
    dados = json.loads(RETRATOS.read_text(encoding="utf-8"))
    for r in dados["retratos"]:
        if not ID_VALIDO.match(r["id"]) or r["genero"] not in ("m", "f") or not r["nome"].strip():
            raise ValueError(f"retrato inválido em retratos.json: {r}")
    return dados


def salvar(dados):
    """Um retrato por linha, para o diff mostrar só o que mudou."""
    cabeca = "".join(
        f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},\n" for k, v in dados.items() if k != "retratos"
    )
    corpo = ",\n".join("    " + json.dumps(r, ensure_ascii=False) for r in dados["retratos"])
    RETRATOS.write_text("{\n" + cabeca + '  "retratos": [\n' + corpo + "\n  ]\n}\n", encoding="utf-8")


def escrever_catalogo(prontos, total):
    linhas = ",\n".join(
        "  { id: %s, nome: %s, genero: %s }"
        % (json.dumps(r["id"]), json.dumps(r["nome"], ensure_ascii=False), json.dumps(r["genero"]))
        for r in prontos
    )
    CATALOGO.write_text(
        "/**\n"
        " * Retratos de perfil do operador. GERADO por scripts/avatares/montar_avatares.py a partir de\n"
        " * scripts/avatares/retratos.json: edite lá e rode o script, não aqui.\n"
        " * Arquivos: assets/avatars/<id>.webp (384 px, ficha e perfil) e assets/avatars/mini/<id>.webp\n"
        " * (160 px, grade e HUD). genero: 'm' | 'f', usado nos filtros da tela de escolha.\n"
        f" * {len(prontos)} de {total} retratos prontos.\n"
        " */\n"
        f"window.HC_AVATARS = [\n{linhas}\n];\n",
        encoding="utf-8",
    )


def ler_relatorio(caminho):
    """Linhas "hc-av-NN | job | completed | url" -> {id: (job, url)}; ignora o resto."""
    achados = {}
    if not Path(caminho).exists():
        return achados
    for linha in Path(caminho).read_text(encoding="utf-8").splitlines():
        partes = [p.strip() for p in linha.split("|")]
        if len(partes) >= 4 and ID_VALIDO.match(partes[0]) and partes[2] == "completed":
            achados[partes[0]] = (partes[1], partes[3])
    return achados


def baixar(url, destino):
    if not url.startswith("https://"):
        raise ValueError(f"URL recusada (só https): {url}")
    with urllib.request.urlopen(url, timeout=60) as resposta:
        destino.write_bytes(resposta.read())


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------
def registrar(relatorio, motor="z_image"):
    dados = ler()
    por_id = {r["id"]: r for r in dados["retratos"]}
    novos = {k: v for k, v in ler_relatorio(relatorio).items() if k in por_id}
    for rid, (job, _url) in novos.items():
        por_id[rid]["origem"] = {"motor": motor, "job": job}
    salvar(dados)
    urls = {**ler_relatorio(ORIGENS_LOCAIS), **novos}
    ORIGENS_LOCAIS.write_text(
        "".join(f"{rid} | {job} | completed | {url}\n" for rid, (job, url) in sorted(urls.items())), encoding="utf-8"
    )
    print(f"{len(novos)} retratos registrados; {sum(1 for r in dados['retratos'] if r.get('origem'))} com origem")


def montar(pasta):
    pasta = Path(pasta)
    pasta.mkdir(parents=True, exist_ok=True)
    (ASSETS / "mini").mkdir(parents=True, exist_ok=True)
    dados = ler()
    urls = ler_relatorio(ORIGENS_LOCAIS)
    prontos = []
    for r in dados["retratos"]:
        origem = r.get("origem")
        if not origem:
            continue
        original = pasta / f"{r['id']}.png"
        if not original.exists():
            if r["id"] not in urls:
                sys.exit(f"{r['id']}: sem original em {pasta} e sem URL em {ORIGENS_LOCAIS.name} "
                         f"(job {origem['job']} no {origem['motor']}).")
            baixar(urls[r["id"]][1], original)
        img, cortes = tratar(original)
        for sub, lado in TAMANHOS.items():
            saida = (ASSETS / sub / f"{r['id']}.webp") if sub else ASSETS / f"{r['id']}.webp"
            img.resize((lado, lado), Image.LANCZOS).save(saida, "WEBP", quality=82, method=6)
        prontos.append(r)
        print(f"{r['id']} {r['nome']}: cortes esq/topo/dir/base {cortes}")
    ids = {r["id"] for r in prontos}
    for velho in sorted(ASSETS.glob("hc-av-*.webp")) + sorted((ASSETS / "mini").glob("hc-av-*.webp")):
        if velho.stem not in ids:
            velho.unlink()
            print(f"removido {velho.relative_to(RAIZ)}")
    escrever_catalogo(prontos, len(dados["retratos"]))
    print(f"catálogo: {len(prontos)} de {len(dados['retratos'])} retratos")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "registrar":
        registrar(sys.argv[2], *(sys.argv[3:4]))
    elif len(sys.argv) == 3 and sys.argv[1] == "montar":
        montar(sys.argv[2])
    else:
        sys.exit(__doc__)
