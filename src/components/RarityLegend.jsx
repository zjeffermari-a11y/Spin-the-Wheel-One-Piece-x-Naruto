import { RARITY } from '../data/rarity';
export default function RarityLegend() {
    return <details className="rarity-guide"><summary>Explore the rarities <span>＋</span></summary><div className="rarity-grid">{Object.values(RARITY).map(rarity => <div key={rarity.name}><span style={{ background: rarity.color }}/>{rarity.name}</div>)}</div><p>Each trait is selected randomly from its wheel.</p></details>;
}
