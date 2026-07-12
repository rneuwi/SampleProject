export interface DataTableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
}
