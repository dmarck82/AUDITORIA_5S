import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import { useAuth } from "../../auth/useAuth";
import { fetchAllPages } from "../../utils/apiData";

function PeopleList() {
  const location = useLocation();
  const { can } = useAuth();
  const [people, setPeople] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    location.state?.message
      ? { type: "success", message: location.state.message }
      : null,
  );

  const loadPeople = useCallback(async () => {
    setLoading(true);
    if (!location.state?.message) setAlert(null);
    try {
      setPeople(await fetchAllPages("/people"));
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível carregar as pessoas.",
      });
    } finally {
      setLoading(false);
    }
  }, [location.state?.message]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const deletePerson = async (person) => {
    if (!window.confirm(`Deseja excluir ${person.name || "esta pessoa"}?`))
      return;
    try {
      await api.delete(`/people/${person.id}`);
      setAlert({ type: "success", message: "Pessoa excluída com sucesso." });
      setPeople((currentPeople) =>
        currentPeople.filter((item) => item.id !== person.id),
      );
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível excluir a pessoa.",
      });
    }
  };

  const columns = [
    { key: "name", label: "Nome", render: (person) => person.name || "-" },
    { key: "email", label: "E-mail", render: (person) => person.email || "-" },
    {
      key: "organization",
      label: "Organização",
      render: (person) => person.organization?.name || "-",
      searchValue: (person) => person.organization?.name || "",
      sortValue: (person) => person.organization?.name || "",
    },
    {
      key: "unit",
      label: "Unidade",
      render: (person) => person.unit?.name || "-",
      searchValue: (person) => person.unit?.name || "",
      sortValue: (person) => person.unit?.name || "",
    },
    {
      key: "sector",
      label: "Setor",
      render: (person) => person.sector?.name || "-",
      searchValue: (person) => person.sector?.name || "",
      sortValue: (person) => person.sector?.name || "",
    },
    {
      key: "active",
      label: "Ativo",
      render: (person) => (
        <span
          className={`badge text-bg-${person.active ? "success" : "secondary"}`}
        >
          {person.active ? "Sim" : "Não"}
        </span>
      ),
      searchValue: (person) => (person.active ? "Sim Ativo" : "Não Inativo"),
      sortValue: (person) => (person.active ? "Sim" : "Não"),
    },
    {
      key: "actions",
      label: "Ações",
      className: "text-end",
      sortable: false,
      render: (person) => (
        <div className="btn-group btn-group-sm">
          <Link
            className="btn btn-outline-secondary"
            to={`/people/${person.id}`}
          >
            Ver
          </Link>
          {can("people.update") && (
            <Link
              className="btn btn-outline-primary"
              to={`/people/${person.id}/edit`}
            >
              Editar
            </Link>
          )}
          {can("people.delete") && (
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => deletePerson(person)}
            >
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredPeople = people.filter((person) => {
    if (statusFilter === "active") return person.active;
    if (statusFilter === "inactive") return !person.active;
    return true;
  });

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Pessoas</h1>
          <p className="text-secondary mb-0">
            Gerencie as pessoas cadastradas.
          </p>
        </div>
        {can("people.create") && (
          <Link className="btn btn-primary" to="/people/create">
            Nova Pessoa
          </Link>
        )}
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? (
        <Loading message="Carregando pessoas..." />
      ) : (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            <label className="form-label mb-0" htmlFor="people-status-filter">
              Status
            </label>
            <select
              className="form-select form-select-sm people-status-filter"
              id="people-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <DataTable
            columns={columns}
            rows={filteredPeople}
            emptyMessage="Nenhuma pessoa encontrada."
          />
        </>
      )}
    </section>
  );
}

export default PeopleList;
