
import React, { useState, useEffect } from 'react';
import { Student, Class, User, LessonPlan } from '../types';
import ModuleWrapper from './ModuleWrapper';
import Table from './Table';

interface BNCCData {
  codigo: string;
  descricao: string;
  componente: string;
}

interface DirectorTeacherRecordsProps {
  user: User;
  lessonPlans: LessonPlan[];
  usersList: User[];
  classes: Class[];
  students: Student[];
}

const DirectorTeacherRecords: React.FC<DirectorTeacherRecordsProps> = ({
  user,
  lessonPlans,
  usersList,
  classes,
  students
}) => {
  const [selectedRecord, setSelectedRecord] = useState<LessonPlan | null>(null);
  const [bnccData, setBnccData] = useState<BNCCData[]>([]);

  // Carrega dados da BNCC para mostrar descrições no modal
  useEffect(() => {
    fetch('./bncc.json')
      .then(res => res.json())
      .then(data => setBnccData(data))
      .catch(err => console.error("Erro ao carregar BNCC:", err));
  }, []);

  const getBNCCDescription = (code: string) => {
    return bnccData.find(b => b.codigo === code)?.descricao || "Descrição não encontrada.";
  };

  const getTeacherName = (id: string) => usersList.find(u => u.id === id)?.name || 'N/A';
  const getClassName = (id: string) => classes.find(c => c.id === id)?.name || 'N/A';

  return (
    <>
      <ModuleWrapper
        title="Registros Pedagógicos dos Professores"
        description="Visualize todas as anotações e registros de aula realizados pelo corpo docente da unidade. Clique em uma linha para ver os detalhes."
      >
        <Table<LessonPlan>
          data={lessonPlans}
          onRowClick={(r) => setSelectedRecord(r)}
          columns={[
            {
              header: 'Data',
              accessor: (r) => <span className="font-bold text-gray-700">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
            },
            {
              header: 'Professor',
              accessor: (r) => getTeacherName(r.teacherId)
            },
            {
              header: 'Turma',
              accessor: (r) => getClassName(r.classId)
            },
            {
              header: 'Tema da Aula',
              accessor: (r) => <span className="font-semibold text-indigo-600">{r.temaAula}</span>
            },
            {
              header: 'BNCC',
              accessor: (r) => (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100">
                  {r.habilidadesBNCC && r.habilidadesBNCC.length > 0 ? r.habilidadesBNCC[0] : 'N/A'}
                </span>
              )
            },
            {
              header: 'Descrição',
              accessor: (r) => <p className="text-xs text-gray-600 line-clamp-2 max-w-xs" title={r.description}>{r.description}</p>
            }
          ]}
        />
      </ModuleWrapper>

      {/* Modal de Detalhes do Registro */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRecord(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 bg-blue-50/30 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-100">
                  <i className="fa-solid fa-book-open"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Detalhes do Registro</h3>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                    Protocolado em {new Date(selectedRecord.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-all shadow-sm"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Professor Responsável</p>
                  <p className="text-sm font-bold text-gray-800">{getTeacherName(selectedRecord.teacherId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Turma / Classe</p>
                  <p className="text-sm font-bold text-gray-800">{getClassName(selectedRecord.classId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tema da Aula</p>
                  <p className="text-sm font-bold text-gray-800">{selectedRecord.temaAula}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Habilidade BNCC</p>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-md border border-blue-100 inline-block">
                    {selectedRecord.habilidadesBNCC && selectedRecord.habilidadesBNCC.length > 0 ? selectedRecord.habilidadesBNCC[0] : 'Não vinculada'}
                  </span>
                </div>
              </div>

              {selectedRecord.habilidadesBNCC && selectedRecord.habilidadesBNCC.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[11px] text-gray-500 leading-relaxed">
                  <span className="font-bold text-gray-700 not-italic block mb-1">Objetivo de Aprendizagem:</span>
                  "{getBNCCDescription(selectedRecord.habilidadesBNCC[0])}"
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Descrição Pedagógica</p>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-inner">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedRecord.description}
                  </p>
                </div>
              </div>

              {selectedRecord.adaptacoesMetodologia && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Adaptações Metodológicas</p>
                  <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                    <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap font-semibold italic">
                      {selectedRecord.adaptacoesMetodologia}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-100 transition-all shadow-sm"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectorTeacherRecords;