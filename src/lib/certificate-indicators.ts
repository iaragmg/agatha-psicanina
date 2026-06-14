// Geração determinística de indicadores psi-caninos.
// Usa a seed (diagnosisId) para que a mesma sessão sempre produza
// os mesmos valores — mesmo ao re-gerar certificados antigos.

export type Rarity = 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO'

export interface Indicators {
  rarity: Rarity
  compatibilidadePaoQueijo: number
  chanceEstudarMadrugada: number
  riscoAdotarOutroCachorro: number
}

export interface RarityMeta {
  label: string
  stars: number
  color: string
  glow: string
}

export const RARITY_META: Record<Rarity, RarityMeta> = {
  COMUM:    { label: 'COMUM',    stars: 3, color: '#8e99a4', glow: 'rgba(142,153,164,0.3)' },
  RARO:     { label: 'RARO',     stars: 4, color: '#4a90d9', glow: 'rgba(74,144,217,0.35)' },
  EPICO:    { label: 'ÉPICO',    stars: 5, color: '#c39bd3', glow: 'rgba(195,155,211,0.4)' },
  LENDARIO: { label: 'LENDÁRIO', stars: 6, color: '#e8c776', glow: 'rgba(232,199,118,0.45)' },
}

export function rarityFromDrama(nivelDrama: number): Rarity {
  if (nivelDrama <= 3) return 'COMUM'
  if (nivelDrama <= 6) return 'RARO'
  if (nivelDrama <= 8) return 'EPICO'
  return 'LENDARIO'
}

// PRNG XorShift32 seeded com o diagnosisId para determinismo total
function makeRng(seed: string): () => number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) | 0
  }
  // Garante h != 0
  if (h === 0) h = 0xdeadbeef
  return () => {
    h ^= h << 13
    h ^= h >> 17
    h ^= h << 5
    return (h >>> 0) / 0xffffffff
  }
}

// Retorna inteiro em [min, max]
function randInt(rng: () => number, min: number, max: number): number {
  return Math.round(min + rng() * (max - min))
}

// Clamp a [min, max]
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function generateIndicators(
  diagnosisId: string,
  nivelDrama: number,
  arquetipoCanino: string,
  diagnostico: string,
  prescricao: string,
  resumoAfetivo: string,
): Indicators {
  const rng = makeRng(diagnosisId)
  const text = `${arquetipoCanino} ${diagnostico} ${prescricao} ${resumoAfetivo}`.toLowerCase()

  // Bases aleatórias (determinísticas)
  let paoQueijo = randInt(rng, 70, 95)
  let estudar   = randInt(rng, 40, 90)
  let cachorro  = randInt(rng, 10, 80)

  // Boosts por palavras-chave no diagnóstico
  if (/(estud|intelectual|curios|analít|pesquis|conhec|leitur|acadêm)/.test(text)) {
    estudar = clamp(estudar + randInt(rng, 8, 18), 40, 100)
  }
  if (/(carinhos|afeto|companhia|pet|animalzinho|adot|amor|peludinho|fofo)/.test(text)) {
    cachorro = clamp(cachorro + randInt(rng, 10, 22), 10, 95)
  }
  if (/(comid|café|pão de queijo|lanche|gourmet|comer|fome|culinár|gastron)/.test(text)) {
    paoQueijo = clamp(paoQueijo + randInt(rng, 5, 12), 70, 100)
  }

  // Nível de drama alto sobe o risco de tudo
  if (nivelDrama >= 8) {
    estudar   = clamp(estudar   + 5, 40, 100)
    cachorro  = clamp(cachorro  + 8, 10, 95)
    paoQueijo = clamp(paoQueijo + 3, 70, 100)
  }

  return {
    rarity: rarityFromDrama(nivelDrama),
    compatibilidadePaoQueijo: paoQueijo,
    chanceEstudarMadrugada:   estudar,
    riscoAdotarOutroCachorro: cachorro,
  }
}
