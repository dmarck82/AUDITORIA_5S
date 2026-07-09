import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import TableActions from "../../components/TableActions";
import { PageActions, PageHeader, StatusBadge } from "../../components/ui";
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
        <StatusBadge status={unit.active ? "active" : "inactive"}>
          {unit.active ? "Sim" : "Não"}
        </StatusBadge>
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
        <TableActions actions={[
          { label: "Ver", to: `/units/${unit.id}`, type: "view" },
          can("units.update") && { label: "Editar", to: `/units/${unit.id}/edit`, type: "edit" },
          can("units.delete") && { label: "Excluir", onClick: () => deleteUnit(unit), type: "delete" },
        ]} />
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title="Unidades"
        description="Gerencie filiais e plantas."
        actions={can("units.create") && (
          <PageActions>
            <Link className="btn btn-primary" to="/units/create">Nova Unidade</Link>
          </PageActions>
        )}
      />
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
