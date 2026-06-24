export type DbTarget = "local" | "work";

export type ColumnInfo = {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
  isPrimaryKey: boolean;
};

export type TableRowsResult = {
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
};
