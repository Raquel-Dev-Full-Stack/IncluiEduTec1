import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
}

function Table<T extends { id: string }>({ columns, data, onEdit, onDelete, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col, i) => (
              <th key={i} className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((item) => (
            <tr 
              key={item.id} 
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-gray-50/50 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, i) => (
                <td key={i} className={`px-6 py-4 text-sm text-gray-600 ${col.className || ''}`}>
                  {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-12 text-center">
          <i className="fa-solid fa-folder-open text-gray-200 text-4xl mb-3"></i>
          <p className="text-gray-400 text-sm">Nenhum registro encontrado.</p>
        </div>
      )}
    </div>
  );
}

export default Table;