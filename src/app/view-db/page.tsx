"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import type { ColumnInfo, DbTarget, TableRowsResult } from "@/lib/view-db/types";

import "./view-db.css";

type ModalMode = "create" | "edit" | null;

function editableColumns(columns: ColumnInfo[]): ColumnInfo[] {
  return columns.filter(
    (column) =>
      !column.isPrimaryKey &&
      !(
        column.hasDefault &&
        (column.name === "createdAt" ||
          column.name === "updatedAt" ||
          column.name === "id")
      ),
  );
}

function getPrimaryKey(columns: ColumnInfo[]): string {
  return columns.find((column) => column.isPrimaryKey)?.name ?? "id";
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function inputType(column: ColumnInfo): string {
  if (column.dataType === "boolean") {
    return "checkbox-boolean";
  }
  if (
    column.dataType.includes("timestamp") ||
    column.dataType === "date"
  ) {
    return "datetime-local";
  }
  if (
    column.dataType.includes("int") ||
    column.dataType === "numeric" ||
    column.dataType === "double precision"
  ) {
    return "number";
  }
  if (column.dataType === "text" || column.dataType === "character varying") {
    return column.name === "content" ? "textarea" : "text";
  }
  return "text";
}

function toInputValue(value: unknown, column: ColumnInfo): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (
    column.dataType.includes("timestamp") ||
    column.dataType === "date"
  ) {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 16);
  }
  return String(value);
}

async function readError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return data?.error ?? `Ошибка ${response.status}`;
}

export default function ViewDbPage() {
  const [db, setDb] = useState<DbTarget | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRowsResult | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const columns = useMemo(
    () => tableData?.columns ?? [],
    [tableData?.columns],
  );
  const pkColumn = useMemo(() => getPrimaryKey(columns), [columns]);
  const formColumns = useMemo(() => editableColumns(columns), [columns]);

  const loadTables = useCallback(async (target: DbTarget) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/view-db/tables?db=${target}`);
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      const data = (await response.json()) as { tables: string[] };
      setTables(data.tables);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки");
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTableData = useCallback(
    async (target: DbTarget, table: string, nextPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/view-db/tables/${encodeURIComponent(table)}?db=${target}&page=${nextPage}&pageSize=20`,
        );
        if (!response.ok) {
          throw new Error(await readError(response));
        }
        const data = (await response.json()) as TableRowsResult;
        setTableData(data);
        setPage(data.page);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Ошибка загрузки");
        setTableData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!db || !selectedTable) {
      return;
    }
    void loadTableData(db, selectedTable, page);
  }, [db, selectedTable, page, loadTableData]);

  function selectDatabase(target: DbTarget) {
    setDb(target);
    setSelectedTable(null);
    setTableData(null);
    setPage(1);
    setModalMode(null);
    void loadTables(target);
  }

  function openTable(table: string) {
    setSelectedTable(table);
    setPage(1);
    setModalMode(null);
  }

  function backToTables() {
    setSelectedTable(null);
    setTableData(null);
    setPage(1);
    setModalMode(null);
  }

  function openCreateModal() {
    const initial: Record<string, string> = {};
    for (const column of formColumns) {
      initial[column.name] = "";
    }
    setFormValues(initial);
    setEditingRow(null);
    setModalMode("create");
  }

  function openEditModal(row: Record<string, unknown>) {
    const initial: Record<string, string> = {};
    for (const column of formColumns) {
      initial[column.name] = toInputValue(row[column.name], column);
    }
    setFormValues(initial);
    setEditingRow(row);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingRow(null);
    setFormValues({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !selectedTable) {
      return;
    }

    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {};
    for (const column of formColumns) {
      const raw = formValues[column.name] ?? "";
      if (column.dataType === "boolean") {
        payload[column.name] = raw === "true";
      } else if (raw !== "") {
        payload[column.name] = raw;
      } else if (column.isNullable) {
        payload[column.name] = null;
      }
    }

    try {
      if (modalMode === "create") {
        const response = await fetch(
          `/api/view-db/tables/${encodeURIComponent(selectedTable)}?db=${db}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) {
          throw new Error(await readError(response));
        }
      }

      if (modalMode === "edit" && editingRow) {
        const id = String(editingRow[pkColumn]);
        const response = await fetch(
          `/api/view-db/tables/${encodeURIComponent(selectedTable)}/${encodeURIComponent(id)}?db=${db}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) {
          throw new Error(await readError(response));
        }
      }

      closeModal();
      await loadTableData(db, selectedTable, page);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Ошибка сохранения",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(row: Record<string, unknown>) {
    if (!db || !selectedTable) {
      return;
    }

    const id = String(row[pkColumn]);
    if (!window.confirm(`Удалить запись ${id}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/view-db/tables/${encodeURIComponent(selectedTable)}/${encodeURIComponent(id)}?db=${db}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      await loadTableData(db, selectedTable, page);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Ошибка удаления",
      );
    } finally {
      setLoading(false);
    }
  }

  const totalPages = tableData
    ? Math.max(1, Math.ceil(tableData.total / tableData.pageSize))
    : 1;

  return (
    <main className="view-db">
      <h1>view-db</h1>
      <p className="subtitle">Просмотр и CRUD для локальной или рабочей PostgreSQL</p>

      {error && <div className="error">{error}</div>}

      <section className="panel">
        <h2>База данных</h2>
        <div className="db-switch">
          <button
            type="button"
            className={db === "local" ? "active" : ""}
            onClick={() => selectDatabase("local")}
          >
            Локальная
          </button>
          <button
            type="button"
            className={db === "work" ? "active" : ""}
            onClick={() => selectDatabase("work")}
          >
            Рабочая
          </button>
        </div>
        {db && (
          <p className="meta" style={{ marginTop: "0.75rem" }}>
            Выбрано:{" "}
            {db === "local"
              ? "локальная (DATABASE_URL_LOCAL → DIRECT_URL → DATABASE_URL)"
              : "рабочая (DATABASE_URL_WORK → DATABASE_URL)"}
          </p>
        )}
      </section>

      {db && !selectedTable && (
        <section className="panel">
          <h2>Таблицы</h2>
          {loading && <p className="meta">Загрузка…</p>}
          {!loading && tables.length === 0 && (
            <p className="meta">Таблицы не найдены</p>
          )}
          <ul className="table-list">
            {tables.map((table) => (
              <li key={table} className="table-item">
                <span>{table}</span>
                <button type="button" className="primary" onClick={() => openTable(table)}>
                  Открыть
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {db && selectedTable && (
        <section className="panel">
          <div className="toolbar">
            <div>
              <h2>{selectedTable}</h2>
              {tableData && (
                <p className="meta">
                  Всего записей: {tableData.total} · страница {tableData.page} из {totalPages}
                </p>
              )}
            </div>
            <div className="toolbar-actions">
              <button type="button" onClick={backToTables}>
                К таблицам
              </button>
              <button type="button" className="primary" onClick={openCreateModal}>
                Создать
              </button>
            </div>
          </div>

          <div className="pagination" style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Назад
            </button>
            <span className="meta">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Вперёд
            </button>
          </div>

          {loading && !tableData && <p className="meta">Загрузка…</p>}

          {tableData && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.name}>{column.name}</th>
                    ))}
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row) => {
                    const rowId = String(row[pkColumn]);
                    return (
                      <tr key={rowId}>
                        {columns.map((column) => (
                          <td key={column.name}>{formatCell(row[column.name])}</td>
                        ))}
                        <td>
                          <div className="row-actions">
                            <button type="button" onClick={() => openEditModal(row)}>
                              Изменить
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => void handleDelete(row)}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {modalMode && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>{modalMode === "create" ? "Создать запись" : "Изменить запись"}</h3>
            <form className="form-grid" onSubmit={(event) => void handleSubmit(event)}>
              {formColumns.map((column) => {
                const type = inputType(column);
                const value = formValues[column.name] ?? "";

                if (type === "checkbox-boolean") {
                  return (
                    <label key={column.name}>
                      {column.name}
                      <select
                        value={value}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            [column.name]: event.target.value,
                          }))
                        }
                      >
                        <option value="">—</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </label>
                  );
                }

                if (type === "textarea") {
                  return (
                    <label key={column.name}>
                      {column.name}
                      <textarea
                        value={value}
                        onChange={(event) =>
                          setFormValues((current) => ({
                            ...current,
                            [column.name]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  );
                }

                return (
                  <label key={column.name}>
                    {column.name}
                    <input
                      type={type === "datetime-local" ? "datetime-local" : type}
                      value={value}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [column.name]: event.target.value,
                        }))
                      }
                    />
                  </label>
                );
              })}
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Отмена
                </button>
                <button type="submit" className="primary" disabled={loading}>
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
