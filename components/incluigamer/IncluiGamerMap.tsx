import React, { useState } from 'react';
import { Student } from '../../types';
import { GAMES_CATALOG, GameDefinition } from './gamesData';

interface IncluiGamerMapProps {
  student: Student | null;
  ageGroup: string | null;
  onSelectGame: (game: GameDefinition) => void;
}

export default function IncluiGamerMap({ student, ageGroup, onSelectGame }: IncluiGamerMapProps) {
  const [selectedBioma, setSelectedBioma] = useState<'alfabetizacao' | 'cognitivo' | 'emocoes' | 'sensorial' | 'matematico' | null>(null);

  // Biomas do Mapa
  const biomas = [
    {
      id: 'alfabetizacao' as const,
      name: 'Ilha da Alfabetização',
      description: 'Língua Portuguesa e Comunicação',
      icon: 'fa-book-open',
      color: 'from-blue-600/20 to-cyan-500/20 border-blue-500/30 text-blue-400 hover:border-blue-400 hover:shadow-blue-500/10',
      glow: 'shadow-blue-900/10',
      textAccent: 'text-blue-300',
      gamesCount: GAMES_CATALOG.filter(g => g.bioma === 'alfabetizacao').length
    },
    {
      id: 'cognitivo' as const,
      name: 'Laboratório Cognitivo',
      description: 'Foco, Lógica e Raciocínio Espacial',
      icon: 'fa-microchip',
      color: 'from-indigo-600/20 to-purple-500/20 border-indigo-500/30 text-indigo-400 hover:border-indigo-400 hover:shadow-indigo-500/10',
      glow: 'shadow-indigo-900/10',
      textAccent: 'text-indigo-300',
      gamesCount: GAMES_CATALOG.filter(g => g.bioma === 'cognitivo').length
    },
    {
      id: 'emocoes' as const,
      name: 'Cidade das Emoções',
      description: 'Socioemocional, Empatia e Autonomia',
      icon: 'fa-heart-circle-bolt',
      color: 'from-rose-600/20 to-pink-500/20 border-rose-500/30 text-rose-400 hover:border-rose-400 hover:shadow-rose-500/10',
      glow: 'shadow-rose-900/10',
      textAccent: 'text-rose-300',
      gamesCount: GAMES_CATALOG.filter(g => g.bioma === 'emocoes').length
    },
    {
      id: 'sensorial' as const,
      name: 'Floresta Sensorial',
      description: 'Coordenação Motora e Sons',
      icon: 'fa-spa',
      color: 'from-emerald-600/20 to-teal-500/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:shadow-emerald-500/10',
      glow: 'shadow-emerald-900/10',
      textAccent: 'text-emerald-300',
      gamesCount: GAMES_CATALOG.filter(g => g.bioma === 'sensorial').length
    },
    {
      id: 'matematico' as const,
      name: 'Reino Matemático',
      description: 'Matemática e Contagem Lúdica',
      icon: 'fa-calculator',
      color: 'from-amber-600/20 to-yellow-500/20 border-amber-500/30 text-amber-400 hover:border-amber-400 hover:shadow-amber-500/10',
      glow: 'shadow-amber-900/10',
      textAccent: 'text-amber-300',
      gamesCount: GAMES_CATALOG.filter(g => g.bioma === 'matematico').length
    }
  ];

  // Listar os jogos do bioma selecionado
  const filteredGames = React.useMemo(() => {
    if (!selectedBioma) return [];
    return GAMES_CATALOG.filter(g => g.bioma === selectedBioma);
  }, [selectedBioma]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho do Mapa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-indigo-500"></i>
            Mapa Gamificado
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Escolha uma das regiões abaixo para explorar jogos adaptados e trilhas integradas à BNCC.
          </p>
        </div>

        {selectedBioma && (
          <button
            onClick={() => setSelectedBioma(null)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-750 transition-all active:scale-95 flex items-center gap-2 self-start md:self-center"
          >
            <i className="fa-solid fa-arrow-left"></i> Voltar ao Mapa
          </button>
        )}
      </div>

      {!selectedBioma ? (
        /* Visualização do Mapa Principal (Biomas) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {biomas.map((bioma) => {
            const isBiomaRecomendado = GAMES_CATALOG.some(
              g => g.bioma === bioma.id && g.ageGroup === ageGroup
            );

            return (
              <div
                key={bioma.id}
                onClick={() => setSelectedBioma(bioma.id)}
                className={`p-6 bg-gradient-to-br border rounded-[2.5rem] ${bioma.color} ${bioma.glow} shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[180px] relative overflow-hidden`}
              >
                {/* Indicador de Recomendação BNCC */}
                {isBiomaRecomendado && (
                  <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse flex items-center gap-1">
                    <i className="fa-solid fa-circle-check"></i>
                    Indicado BNCC
                  </span>
                )}

                <div className="space-y-3 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
                    <i className={`fa-solid ${bioma.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm group-hover:translate-x-1 transition-transform">{bioma.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">{bioma.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-slate-800/35 pt-4 z-10">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">
                    {bioma.gamesCount} {bioma.gamesCount === 1 ? 'atividade' : 'atividades'}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${bioma.textAccent} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                    Explorar <i className="fa-solid fa-chevron-right text-[8px]"></i>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização da Lista de Jogos do Bioma Selecionado */
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/20 border border-slate-800 rounded-3xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center text-indigo-400 text-xl shadow-inner z-10">
              <i className={`fa-solid ${biomas.find(b => b.id === selectedBioma)?.icon}`}></i>
            </div>
            <div className="z-10">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">{biomas.find(b => b.id === selectedBioma)?.name}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{biomas.find(b => b.id === selectedBioma)?.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGames.length === 0 ? (
              <div className="col-span-2 p-16 text-center bg-slate-800/10 border border-slate-850 rounded-[2.5rem] space-y-4">
                <i className="fa-solid fa-ghost text-slate-700 text-4xl"></i>
                <p className="text-slate-400 font-bold">Nenhuma atividade disponível para esta região.</p>
              </div>
            ) : (
              filteredGames.map((game) => {
                const isRecomendado = game.ageGroup === ageGroup;

                return (
                  <div
                    key={game.id}
                    className="p-6 bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-5 transition-all hover:shadow-xl relative overflow-hidden group"
                  >
                    {/* Glow Sutil Hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/2 to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    <div className="space-y-4 z-10">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase bg-slate-850 text-slate-400 px-3 py-1 rounded-full border border-slate-800 tracking-wider">
                          {game.ageLabel}
                        </span>
                        
                        {isRecomendado && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                            Indicado BNCC
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-white font-black text-sm group-hover:text-indigo-400 transition-colors leading-snug">{game.name}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-semibold">{game.description}</p>
                      </div>

                      {/* Metadados da BNCC */}
                      <div className="bg-slate-850/50 p-4 rounded-2xl border border-slate-850/80 space-y-2">
                        {game.fieldOfExperience && (
                          <div className="text-[9px] font-bold text-slate-400 leading-normal">
                            <span className="text-indigo-400 font-black uppercase tracking-wider block mb-0.5">Campo de Experiência</span>
                            {game.fieldOfExperience}
                          </div>
                        )}
                        {game.subject && (
                          <div className="text-[9px] font-bold text-slate-400 leading-normal">
                            <span className="text-indigo-400 font-black uppercase tracking-wider block mb-0.5">Componente Curricular</span>
                            {game.subject}
                          </div>
                        )}
                        <div className="text-[9px] font-bold text-slate-400 leading-normal">
                          <span className="text-indigo-400 font-black uppercase tracking-wider block mb-0.5">Habilidades BNCC</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.bnccSkills.map(code => (
                              <span key={code} className="bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded text-[8px] border border-indigo-900/35 font-extrabold uppercase">{code}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-slate-800/40 pt-4 z-10">
                      <div className="flex gap-1.5">
                        {game.stimuli.map(st => (
                          <span key={st} className="text-[8px] bg-slate-850 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-slate-800">{st}</span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => onSelectGame(game)}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-900/10"
                      >
                        <i className="fa-solid fa-circle-play"></i> Iniciar Atividade
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
