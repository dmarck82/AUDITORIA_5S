import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { FormActions, FormSection, PageHeader } from "../../components/ui";
import { fetchAllPages } from "../../utils/apiData";

const emptyForm = { organization_id: "", name: "", address: "", active: true };

function UnitsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setOrganizations(await fetchAllPages("/organizations"));
        if (isEditing) {
          const unitResponse = await api.get(`/units/${id}`);
          const unit = unitResponse.data.data || unitResponse.data;
          setForm({
            organization_id: unit.organization_id || "",
            name: unit.name || "",
            address: unit.address || "",
            active: Boolean(unit.active),
          });
        }
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar os dados da unidade.",
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
      if (isEditing) await api.put(`/units/${id}`, buildPayload());
      else await api.post("/units", buildPayload());
      navigate("/units", {
        state: {
          message: `Unidade ${isEditing ? "atualizada" : "criada"} com sucesso.`,
        },
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message:
          error.response?.data?.message || "Não foi possível salvar a unidade.",
        errors: error.response?.data?.errors,
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading message="Carregando unidade..." />;
  return (
    <section>
      <PageHeader title={isEditing ? "Editar Unidade" : "Nova Unidade"} description="Vincule a unidade a uma organização." />
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        errors={alert?.errors}
      />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-6">
          <label className="form-label" htmlFor="organization_id">
            Organização
          </label>
          <select
            className="form-select"
            id="organization_id"
            name="organization_id"
            value={form.organization_id}
            onChange={updateField}
            required
          >
            <option value="">Selecione uma organização</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
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
          <Link className="btn btn-outline-secondary" to="/units">
            Cancelar
          </Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  );
}

export default UnitsForm;
