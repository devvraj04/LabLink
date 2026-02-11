import React from 'react';
import { Database } from 'lucide-react';

const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm border border-zinc-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-zinc-50 transition-colors duration-150">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12">
          <Database className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 text-sm font-medium text-zinc-900">No data available</p>
          <p className="mt-1 text-sm text-zinc-500">Get started by adding your first record.</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
