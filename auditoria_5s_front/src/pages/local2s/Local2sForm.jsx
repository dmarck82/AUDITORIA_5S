import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { FormActions, FormSection, PageHeader } from "../../components/ui";
import { fetchAllPages } from "../../utils/apiData";

const emptyForm = { local_1_id: "", name: "", address: "", active: true };

function Local2sForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [local1s, setLocal1s] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLocal1s(await fetchAllPages("/local1s"));
        if (isEditing) {
          const local2Response = await api.get(`/local2s/${id}`);
          const local2 = local2Response.data.data || local2Response.data;
          setForm({
            local_1_id: local2.local_1_id || "",
            name: local2.name || "",
            address: local2.address || "",
            active: Boolean(local2.active),
          });
        }
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar os dados dao Setor/OMDS.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, [id, isEditing]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const buildPayload = () => ({ ...form, address: form.address || null });
  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      if (isEditing) await api.put(`/local2s/${id}`, buildPayload());
      else await api.post("/local2s", buildPayload());
      navigate("/local2s", {
        state: {
          message: `Setor/OMDS ${isEditing ? "atualizado" : "criado"} com sucesso.`,
        },
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message:
          error.response?.data?.message || "Não foi possível salvar ao Setor/OMDS.",
        errors: error.response?.data?.errors,
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading message="Carregando Setor/OMDS..." />;
  return (
    <section>
      <PageHeader title={isEditing ? "Editar Setor/OMDS" : "Novao Setor/OMDS"} description="Vincule ao Setor/OMDS a uma organização." />
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        errors={alert?.errors}
      />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-6">
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
        <div className="col-md-6">
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
        <div className="col-md-8">
          <label className="form-label" htmlFor="address">
            Endereço
          </label>
          <input
            className="form-control"
            id="address"
            name="address"
            value={form.address}
            onChange={updateField}
          />
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
          <Link className="btn btn-outline-secondary" to="/local2s">
            Cancelar
          </Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  );
}

export default Local2sForm;
