import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-left border-collapse', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children, className }) => {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-100', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ children, className }) => {
  return (
    <tbody className={cn('divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps & { onClick?: () => void }> = ({ 
  children, 
  className,
  onClick 
}) => {
  return (
    <tr 
      className={cn(
        'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps extends TableProps {
  header?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className,
  header = false 
}) => {
  const Component = header ? 'th' : 'td';
  return (
    <Component 
      className={cn(
        'p-4',
        header && 'text-xs font-bold uppercase tracking-wider text-gray-500',
        !header && 'text-sm',
        className
      )}
    >
      {children}
    </Component>
  );
};
