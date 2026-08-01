import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { Card, PageActions, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../utils/formatters";

function Local2sView() {
  const { id } = useParams();
  const { can } = useAuth();
  const [local2, setLocal2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    const loadLocal2 = async () => {
      try {
        const response = await api.get(`/local2s/${id}`);
        setLocal2(response.data.data || response.data);
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar ao Setor/OMDS.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadLocal2();
  }, [id]);
  if (loading) return <Loading message="Carregando Setor/OMDS..." />;
  return (
    <section>
      <PageHeader
        title="Detalhes dao Setor/OMDS"
        description="Informações da filial ou planta."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/local2s">
            Voltar
          </Link>
          {local2 && can("local2s.update") && (
            <Link className="btn btn-primary" to={`/local2s/${local2.id}/edit`}>
              Editar
            </Link>
          )}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {local2 && (
        <Card>
            <dl className="row mb-0">
              <dt className="col-sm-3">Nome</dt>
              <dd className="col-sm-9">{local2.name || "-"}</dd>
              <dt className="col-sm-3">Organização</dt>
              <dd className="col-sm-9">
                {local2.local_1_name || local2.local_1_id || "-"}
              </dd>
              <dt className="col-sm-3">Endereço</dt>
              <dd className="col-sm-9">{local2.address || "-"}</dd>
              <dt className="col-sm-3">Ativo</dt>
              <dd className="col-sm-9"><StatusBadge status={local2.active ? "active" : "inactive"}>{local2.active ? "Sim" : "Não"}</StatusBadge></dd>
              <dt className="col-sm-3">Criado em</dt>
              <dd className="col-sm-9">{formatDateTime(local2.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt>
              <dd className="col-sm-9">{formatDateTime(local2.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt>
              <dd className="col-sm-9">{local2.updated_by_name || "-"}</dd>
            </dl>
        </Card>
      )}
    </section>
  );
}

export default Local2sView;
