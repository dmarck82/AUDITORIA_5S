import { useMemo, useState } from "react";
import { EmptyState } from "./ui";

function renderValue(column, row) {
  if (column.render) {
    return column.render(row);
  }

  return row[column.key] ?? "-";
}

function getSearchValue(column, row) {
  if (column.searchValue) {
    return column.searchValue(row);
  }

  const value = column.render ? column.render(row) : row[column.key];

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}

function getSortValue(column, row) {
  if (column.sortValue) {
    return column.sortValue(row);
  }

  const value = row[column.key];

  if (typeof value === "string") {
    return value.toLocaleLowerCase("pt-BR");
  }

  return value ?? "";
}

function DataTable({
  columns,
  rows,
  emptyMessage = "Nenhum registro encontrado.",
}) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({
    key: columns[0]?.key || "",
    direction: "asc",
  });

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) =>
        getSearchValue(column, row)
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    );
  }, [columns, rows, search]);

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key);

    if (!column || column.sortable === false) {
      return filteredRows;
    }

    return [...filteredRows].sort((first, second) => {
      const firstValue = getSortValue(column, first);
      const secondValue = getSortValue(column, second);
      const result = String(firstValue).localeCompare(
        String(secondValue),
        "pt-BR",
        {
          numeric: true,
          sensitivity: "base",
        },
      );

      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visibleRows = sortedRows.slice(startIndex, startIndex + pageSize);
  const firstItem = sortedRows.length === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + pageSize, sortedRows.length);

  const updateSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const updatePageSize = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const toggleSort = (column) => {
    if (column.sortable === false) {
      return;
    }

    setSort((currentSort) => ({
      key: column.key,
      direction:
        currentSort.key === column.key && currentSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(1);
  };

  return (
    <div className="data-table app-card card">
      <div className="card-body">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <label className="d-flex align-items-center gap-2 mb-0">
          <span>Mostrar</span>
          <select
            className="form-select form-select-sm data-table-page-size"
            value={pageSize}
            onChange={updatePageSize}
          >
            <option value="50">50</option>
            <option value="75">75</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
          <span>registros</span>
        </label>

        <label className="d-flex align-items-center gap-2 mb-0">
          <span>Buscar</span>
          <input
            className="form-control form-control-sm data-table-search"
            value={search}
            onChange={updateSearch}
          />
        </label>
      </div>

      <div className="table-responsive data-table-frame">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="text-center">
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <button
                      className="data-table-sort"
                      type="button"
                      onClick={() => toggleSort(column)}
                    >
                      <span>{column.label}</span>
                      {sort.key === column.key && (
                        <span aria-hidden="true">
                          {sort.direction === "asc" ? " ▲" : " ▼"}
                        </span>
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  className="py-4"
                  colSpan={columns.length}
                >
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || ""}>
                      {renderValue(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="text-secondary">
          Mostrando {firstItem} até {lastItem} de {sortedRows.length} registros
        </div>
        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            Primeiro
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Anterior
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          >
            Próximo
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Último
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default DataTable;
