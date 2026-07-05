import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import defaultUserPhoto from "../../assets/user.jpeg";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
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

function PeopleView() {
  const { id } = useParams();
  const { can } = useAuth();
  const [person, setPerson] = useState(null);
  const [photoSrc, setPhotoSrc] = useState(defaultUserPhoto);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadPerson = async () => {
      try {
        const response = await api.get(`/people/${id}`);
        setPerson(response.data.data || response.data);
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar a pessoa.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [id]);

  useEffect(() => {
    if (!person?.has_photo) {
      setPhotoSrc(defaultUserPhoto);
      return undefined;
    }

    let objectUrl = null;
    let cancelled = false;

    const loadPhoto = async () => {
      try {
        const response = await api.get(`/people/${person.id}/photo`, {
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
  }, [person]);

  if (loading) return <Loading message="Carregando pessoa..." />;

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes da Pessoa</h1>
          <p className="text-secondary mb-0">Informações cadastrais e identificação visual.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/people">
            Voltar
          </Link>
          {person && can("people.update") && (
            <Link className="btn btn-primary" to={`/people/${person.id}/edit`}>
              Editar
            </Link>
          )}
        </div>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {person && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="ratio ratio-1x1 mx-auto mb-3" style={{ maxWidth: "260px" }}>
                  <img
                    alt={`Foto de ${person.name || "pessoa"}`}
                    className="rounded border object-fit-cover"
                    src={photoSrc}
                  />
                </div>
                <h2 className="h5 mb-1">{person.name || "-"}</h2>
                <p className="text-secondary mb-3">{person.job_title || "Sem cargo informado"}</p>
                <span className={`badge text-bg-${person.active ? "success" : "secondary"}`}>
                  {person.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h2 className="h5 mb-0">Dados cadastrais</h2>
              </div>
              <div className="card-body">
                <dl className="row gy-2 mb-0">
                  {detail("Nome", person.name)}
                  {detail("E-mail", person.email)}
                  {detail("Celular", formatPhone(person.phone || ""))}
                  {detail("Organização", person.organization?.name)}
                  {detail("Unidade", person.unit?.name)}
                  {detail("Setor", person.sector?.name)}
                  {detail("Cargo", person.job_title)}
                  {detail("Criado em", formatDateTime(person.created_at))}
                  {detail("Atualizado em", formatDateTime(person.updated_at))}
                  {detail("Atualizado por", person.updated_by_name)}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PeopleView;
