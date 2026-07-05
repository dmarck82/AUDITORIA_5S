import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import { useAuth } from "../../auth/useAuth";
import { fetchAllPages } from "../../utils/apiData";

function UnitsList() {
  const location = useLocation();
  const { can } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    location.state?.message
      ? { type: "success", message: location.state.message }
      : null,
  );

  const loadUnits = useCallback(async () => {
    setLoading(true);
    if (!location.state?.message) setAlert(null);
    try {
      setUnits(await fetchAllPages("/units"));
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível carregar as unidades.",
      });
    } finally {
      setLoading(false);
    }
  }, [location.state?.message]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const deleteUnit = async (unit) => {
    if (!window.confirm(`Deseja excluir ${unit.name || "esta unidade"}?`))
      return;
    try {
      await api.delete(`/units/${unit.id}`);
      setAlert({ type: "success", message: "Unidade excluída com sucesso." });
      setUnits((currentUnits) =>
        currentUnits.filter((item) => item.id !== unit.id),
      );
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível excluir a unidade.",
      });
    }
  };

  const columns = [
    { key: "name", label: "Nome", render: (unit) => unit.name || "-" },
    {
      key: "organization_name",
      label: "Organização",
      render: (unit) => unit.organization_name || unit.organization_id || "-",
    },
    {
      key: "active",
      label: "Ativo",
      render: (unit) => (
        <span className={`badge text-bg-${unit.active ? "success" : "secondary"}`}>
          {unit.active ? "Sim" : "Não"}
        </span>
      ),
      searchValue: (unit) => (unit.active ? "Sim Ativo" : "Não Inativo"),
      sortValue: (unit) => (unit.active ? "Sim" : "Não"),
    },
    {
      key: "actions",
      label: "Ações",
      className: "text-end",
      sortable: false,
      render: (unit) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/units/${unit.id}`}>
            Ver
          </Link>
          {can("units.update") && <Link className="btn btn-outline-primary" to={`/units/${unit.id}/edit`}>
            Editar
          </Link>}
          {can("units.delete") && <button className="btn btn-outline-danger" type="button" onClick={() => deleteUnit(unit)}>
            Excluir
          </button>}
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Unidades</h1>
          <p className="text-secondary mb-0">Gerencie filiais e plantas.</p>
        </div>
        {can("units.create") && <Link className="btn btn-primary" to="/units/create">
          Nova Unidade
        </Link>}
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? (
        <Loading message="Carregando unidades..." />
      ) : (
        <DataTable columns={columns} rows={units} emptyMessage="Nenhuma unidade encontrada." />
      )}
    </section>
  );
}

export default UnitsList;
