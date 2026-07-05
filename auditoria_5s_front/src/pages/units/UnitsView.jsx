import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime } from "../../utils/formatters";

function UnitsView() {
  const { id } = useParams();
  const { can } = useAuth();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    const loadUnit = async () => {
      try {
        const response = await api.get(`/units/${id}`);
        setUnit(response.data.data || response.data);
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar a unidade.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadUnit();
  }, [id]);
  if (loading) return <Loading message="Carregando unidade..." />;
  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes da Unidade</h1>
          <p className="text-secondary mb-0">
            Informações da filial ou planta.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/units">
            Voltar
          </Link>
          {unit && can("units.update") && (
            <Link className="btn btn-primary" to={`/units/${unit.id}/edit`}>
              Editar
            </Link>
          )}
        </div>
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {unit && (
        <div className="card">
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-sm-3">Nome</dt>
              <dd className="col-sm-9">{unit.name || "-"}</dd>
              <dt className="col-sm-3">Organização</dt>
              <dd className="col-sm-9">
                {unit.organization_name || unit.organization_id || "-"}
              </dd>
              <dt className="col-sm-3">Endereço</dt>
              <dd className="col-sm-9">{unit.address || "-"}</dd>
              <dt className="col-sm-3">Ativo</dt>
              <dd className="col-sm-9">{unit.active ? "Sim" : "Não"}</dd>
              <dt className="col-sm-3">Criado em</dt>
              <dd className="col-sm-9">{formatDateTime(unit.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt>
              <dd className="col-sm-9">{formatDateTime(unit.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt>
              <dd className="col-sm-9">{unit.updated_by_name || "-"}</dd>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}

export default UnitsView;
