import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import defaultUserPhoto from "../../assets/user.jpeg";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { Card, PageActions, PageHeader, StatusBadge } from "../../components/ui";
import { useAuth } from "../../auth/useAuth";
import { formatDateTime, formatPhone } from "../../utils/formatters";

function detail(label, value) {
  return (
    <>
      <dt className="col-sm-4 text-secondary">{label}</dt>
      <dd className="col-sm-8 fw-medium">{value || "-"}</dd>
    </>
  );
}

function UsersView() {
  const { id } = useParams();
  const { can } = useAuth();
  const [user, setUser] = useState(null);
  const [photoSrc, setPhotoSrc] = useState(defaultUserPhoto);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data.data || response.data);
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar a usuário.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  useEffect(() => {
    if (!user?.has_photo) {
      setPhotoSrc(defaultUserPhoto);
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;

    const loadPhoto = async () => {
      try {
        const response = await api.get(`/users/${user.id}/photo`, {
          responseType: "blob",
        });

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(response.data);
        setPhotoSrc(objectUrl);
      } catch {
        setPhotoSrc(defaultUserPhoto);
      }
    };

    loadPhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user]);

  if (loading) return <Loading message="Carregando usuário..." />;

  return (
    <section>
      <PageHeader
        title="Detalhes da Usuário"
        description="Informações cadastrais e identificação visual."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/users">
            Voltar
          </Link>
          {user && can("users.update") && (
            <Link className="btn btn-primary" to={`/users/${user.id}/edit`}>
              Editar
            </Link>
          )}
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {user && (
        <div className="row g-4">
          <div className="col-lg-4">
            <Card className="h-100" bodyClassName="text-center">
                <div className="ratio ratio-1x1 mx-auto mb-3" style={{ maxWidth: "260px" }}>
                  <img
                    alt={`Foto de ${user.name || "usuário"}`}
                    className="rounded border object-fit-cover"
                    src={photoSrc}
                  />
                </div>
                <h2 className="h5 mb-1">{user.name || "-"}</h2>
                <p className="text-secondary mb-3">{user.job_title || "Sem cargo informado"}</p>
                <StatusBadge status={user.active ? "active" : "inactive"}>
                  {user.active ? "Ativo" : "Inativo"}
                </StatusBadge>
            </Card>
          </div>

          <div className="col-lg-8">
            <Card header={<h2 className="h5 mb-0">Dados cadastrais</h2>}>
                <dl className="row gy-2 mb-0">
                  {detail("Nome", user.name)}
                  {detail("E-mail", user.email)}
                  {detail("Celular", formatPhone(user.phone || ""))}
                  {detail("Organização", user.local1?.name)}
                  {detail("Setor/OMDS", user.local2?.name)}
                  {detail("Subsetor/Seção", user.local3?.name)}
                  {detail("Cargo", user.job_title)}
                  {detail("Criado em", formatDateTime(user.created_at))}
                  {detail("Atualizado em", formatDateTime(user.updated_at))}
                  {detail("Atualizado por", user.updated_by_name)}
                </dl>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}

export default UsersView;
