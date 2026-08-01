import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { FormActions, FormSection, PageHeader } from "../../components/ui";
import { fetchAllPages } from "../../utils/apiData";
import { formatPhone, onlyDigits } from "../../utils/formatters";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  local_1_id: "",
  local_2_id: "",
  local_3_id: "",
  job_title: "",
  active: true,
};

function UsersForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [local1s, setLocal1s] = useState([]);
  const [local2s, setLocal2s] = useState([]);
  const [local3s, setLocal3s] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [photo, setPhoto] = useState(null);

  const availableLocal2s = useMemo(() => {
    if (!form.local_1_id) return [];
    return local2s.filter(
      (local2) => String(local2.local_1_id) === String(form.local_1_id),
    );
  }, [form.local_1_id, local2s]);

  const availableLocal3s = useMemo(() => {
    if (!form.local_2_id) return [];
    return local3s.filter(
      (local3) => String(local3.local_2_id) === String(form.local_2_id),
    );
  }, [form.local_2_id, local3s]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedLocal1s, loadedLocal2s, loadedLocal3s] =
          await Promise.all([
            fetchAllPages("/local1s"),
            fetchAllPages("/local2s"),
            fetchAllPages("/local3s"),
          ]);

        setLocal1s(loadedLocal1s);
        setLocal2s(loadedLocal2s);
        setLocal3s(loadedLocal3s);

        if (isEditing) {
          const response = await api.get(`/users/${id}`);
          const user = response.data.data || response.data;
          setForm({
            name: user.name || "",
            email: user.email || "",
            phone: formatPhone(user.phone || ""),
            local_1_id: user.local_1_id || "",
            local_2_id: user.local_2_id || "",
            local_3_id: user.local_3_id || "",
            job_title: user.job_title || "",
            active: Boolean(user.active),
          });
        }
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar os dados da usuário.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [id, isEditing]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => {
      const nextValue = name === "phone" ? formatPhone(value) : value;
      const nextForm = {
        ...currentForm,
        [name]: type === "checkbox" ? checked : nextValue,
      };

      if (name === "local_1_id") {
        nextForm.local_2_id = "";
        nextForm.local_3_id = "";
      }

      if (name === "local_2_id") {
        nextForm.local_3_id = "";
      }

      return nextForm;
    });
  };

  const updatePhoto = (event) => {
    setPhoto(event.target.files?.[0] || null);
  };

  const buildPayload = () => {
    const payload = new FormData();

    payload.append("name", form.name);
    payload.append("email", form.email || "");
    payload.append("phone", onlyDigits(form.phone) || "");
    payload.append("local_1_id", form.local_1_id || "");
    payload.append("local_2_id", form.local_2_id || "");
    payload.append("local_3_id", form.local_3_id || "");
    payload.append("job_title", form.job_title || "");
    payload.append("active", form.active ? "1" : "0");

    if (photo) {
      payload.append("photo", photo);
    }

    return payload;
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const payload = buildPayload();

      if (isEditing) {
        payload.append("_method", "PUT");
        await api.post(`/users/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/users", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/users", {
        state: {
          message: `Usuário ${isEditing ? "atualizada" : "criada"} com sucesso.`,
        },
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message:
          error.response?.data?.message || "Não foi possível salvar a usuário.",
        errors: error.response?.data?.errors,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Carregando usuário..." />;

  return (
    <section>
      <PageHeader title={isEditing ? "Editar Usuário" : "Nova Usuário"} description="Preencha os dados cadastrais." />
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        errors={alert?.errors}
      />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-8">
          <label className="form-label" htmlFor="name">
            Nome
          </label>
          <input
            className="form-control"
            id="name"
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="job_title">
            Cargo
          </label>
          <input
            className="form-control"
            id="job_title"
            name="job_title"
            value={form.job_title}
            onChange={updateField}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="email">
            E-mail
          </label>
          <input
            className="form-control"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="phone">
            Celular
          </label>
          <input
            className="form-control"
            id="phone"
            name="phone"
            inputMode="numeric"
            placeholder="(xx) 9xxxx-xxxx"
            value={form.phone}
            onChange={updateField}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="local_1_id">
            Organização
          </label>
          <select
            className="form-select"
            id="local_1_id"
            name="local_1_id"
            value={form.local_1_id}
            onChange={updateField}
            required
          >
            <option value="">Selecione uma organização</option>
            {local1s.map((local1) => (
              <option key={local1.id} value={local1.id}>
                {local1.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="local_2_id">
            Setor/OMDS
          </label>
          <select
            className="form-select"
            id="local_2_id"
            name="local_2_id"
            value={form.local_2_id}
            onChange={updateField}
            disabled={!form.local_1_id}
          >
            <option value="">Sem Setor/OMDS</option>
            {availableLocal2s.map((local2) => (
              <option key={local2.id} value={local2.id}>
                {local2.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="local_3_id">
            Subsetor/Seção
          </label>
          <select
            className="form-select"
            id="local_3_id"
            name="local_3_id"
            value={form.local_3_id}
            onChange={updateField}
            disabled={!form.local_2_id}
          >
            <option value="">Sem subsetor/seção</option>
            {availableLocal3s.map((local3) => (
              <option key={local3.id} value={local3.id}>
                {local3.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="photo">
            Foto de identificação
          </label>
          <input
            accept="image/*"
            className="form-control"
            id="photo"
            name="photo"
            type="file"
            onChange={updatePhoto}
          />
          <div className="form-text">
            A foto ficará privada e visível apenas nos detalhes do usuário.
          </div>
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              id="active"
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={updateField}
            />
            <label className="form-check-label" htmlFor="active">
              Ativo
            </label>
          </div>
        </div>
        <FormActions>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <Link className="btn btn-outline-secondary" to="/users">
            Cancelar
          </Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  );
}

export default UsersForm;
