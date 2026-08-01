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

function Local2sList() {
  const location = useLocation();
  const { can } = useAuth();
  const [local2s, setLocal2s] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    location.state?.message
      ? { type: "success", message: location.state.message }
      : null,
  );

  const loadLocal2s = useCallback(async () => {
    setLoading(true);
    if (!location.state?.message) setAlert(null);
    try {
      setLocal2s(await fetchAllPages("/local2s"));
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível carregar os Setores/OMDS.",
      });
    } finally {
      setLoading(false);
    }
  }, [location.state?.message]);

  useEffect(() => {
    loadLocal2s();
  }, [loadLocal2s]);

  const deleteLocal2 = async (local2) => {
    if (!window.confirm(`Deseja excluir ${local2.name || "este Setor/OMDS"}?`))
      return;
    try {
      await api.delete(`/local2s/${local2.id}`);
      setAlert({ type: "success", message: "Setor/OMDS excluído com sucesso." });
      setLocal2s((currentLocal2s) =>
        currentLocal2s.filter((item) => item.id !== local2.id),
      );
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível excluir ao Setor/OMDS.",
      });
    }
  };

  const columns = [
    { key: "name", label: "Nome", render: (local2) => local2.name || "-" },
    {
      key: "local_1_name",
      label: "Organização",
      render: (local2) => local2.local_1_name || local2.local_1_id || "-",
    },
    {
      key: "active",
      label: "Ativo",
      render: (local2) => (
        <StatusBadge status={local2.active ? "active" : "inactive"}>
          {local2.active ? "Sim" : "Não"}
        </StatusBadge>
      ),
      searchValue: (local2) => (local2.active ? "Sim Ativo" : "Não Inativo"),
      sortValue: (local2) => (local2.active ? "Sim" : "Não"),
    },
    {
      key: "actions",
      label: "Ações",
      className: "text-end",
      sortable: false,
      render: (local2) => (
        <TableActions actions={[
          { label: "Ver", to: `/local2s/${local2.id}`, type: "view" },
          can("local2s.update") && { label: "Editar", to: `/local2s/${local2.id}/edit`, type: "edit" },
          can("local2s.delete") && { label: "Excluir", onClick: () => deleteLocal2(local2), type: "delete" },
        ]} />
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title="Setor/OMDS"
        description="Gerencie filiais e plantas."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/cadastros"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos Cadastros</Link>
            {can("local2s.create") && <Link className="btn btn-primary" to="/local2s/create">Novao Setor/OMDS</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? (
        <Loading message="Carregando Setor/OMDS..." />
      ) : (
        <DataTable centered columns={columns} rows={local2s} emptyMessage="Nenhumao Setor/OMDS encontrado." />
      )}
    </section>
  );
}

export default Local2sList;
