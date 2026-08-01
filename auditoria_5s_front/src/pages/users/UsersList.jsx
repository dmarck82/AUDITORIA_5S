import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";
import TableActions from "../../components/TableActions";
import { Card, PageActions, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";
import { fetchAllPages } from "../../utils/apiData";

function UsersList() {
  const location = useLocation();
  const { can } = useAuth();
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    location.state?.message
      ? { type: "success", message: location.state.message }
      : null,
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    if (!location.state?.message) setAlert(null);
    try {
      setUsers(await fetchAllPages("/users"));
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível carregar os usuários.",
      });
    } finally {
      setLoading(false);
    }
  }, [location.state?.message]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const deleteUser = async (user) => {
    if (!window.confirm(`Deseja excluir ${user.name || "este usuário"}?`))
      return;
    try {
      await api.delete(`/users/${user.id}`);
      setAlert({ type: "success", message: "Usuário excluído com sucesso." });
      setUsers((currentUsers) =>
        currentUsers.filter((item) => item.id !== user.id),
      );
    } catch {
      setAlert({
        type: "danger",
        message: "Não foi possível excluir o usuário.",
      });
    }
  };

  const columns = [
    { key: "name", label: "Nome", render: (user) => user.name || "-" },
    { key: "email", label: "E-mail", render: (user) => user.email || "-" },
    {
      key: "local1",
      label: "Organização",
      render: (user) => user.local1?.name || "-",
      searchValue: (user) => user.local1?.name || "",
      sortValue: (user) => user.local1?.name || "",
    },
    {
      key: "local2",
      label: "Setor/OMDS",
      render: (user) => user.local2?.name || "-",
      searchValue: (user) => user.local2?.name || "",
      sortValue: (user) => user.local2?.name || "",
    },
    {
      key: "local3",
      label: "Subsetor/Seção",
      render: (user) => user.local3?.name || "-",
      searchValue: (user) => user.local3?.name || "",
      sortValue: (user) => user.local3?.name || "",
    },
    {
      key: "active",
      label: "Ativo",
      render: (user) => (
        <StatusBadge status={user.active ? "active" : "inactive"}>
          {user.active ? "Sim" : "Não"}
        </StatusBadge>
      ),
      searchValue: (user) => (user.active ? "Sim Ativo" : "Não Inativo"),
      sortValue: (user) => (user.active ? "Sim" : "Não"),
    },
    {
      key: "actions",
      label: "Ações",
      className: "text-end",
      sortable: false,
      render: (user) => (
        <TableActions actions={[
          { label: "Ver", to: `/users/${user.id}`, type: "view" },
          can("users.update") && { label: "Editar", to: `/users/${user.id}/edit`, type: "edit" },
          can("users.delete") && { label: "Excluir", onClick: () => deleteUser(user), type: "delete" },
        ]} />
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    if (statusFilter === "active") return user.active;
    if (statusFilter === "inactive") return !user.active;
    return true;
  });

  return (
    <section>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários cadastradas."
        actions={can("users.create") && (
          <PageActions>
            <Link className="btn btn-primary" to="/users/create">Novo Usuário</Link>
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? (
        <Loading message="Carregando usuários..." />
      ) : (
        <>
          <Card className="mb-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0" htmlFor="users-status-filter">
              Status
            </label>
            <select
              className="form-select form-select-sm users-status-filter"
              id="users-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="all">Todos</option>
            </select>
          </div>
          </Card>
          <DataTable
            columns={columns}
            rows={filteredUsers}
            emptyMessage="Nenhumo usuário encontrada."
          />
        </>
      )}
    </section>
  );
}

export default UsersList;
