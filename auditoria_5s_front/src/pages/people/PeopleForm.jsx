import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import AlertMessage from "../../components/AlertMessage";
import Loading from "../../components/Loading";
import { fetchAllPages } from "../../utils/apiData";
import { formatPhone, onlyDigits } from "../../utils/formatters";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  organization_id: "",
  unit_id: "",
  sector_id: "",
  job_title: "",
  active: true,
};

function PeopleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [organizations, setOrganizations] = useState([]);
  const [units, setUnits] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [photo, setPhoto] = useState(null);

  const availableUnits = useMemo(() => {
    if (!form.organization_id) return [];
    return units.filter(
      (unit) => String(unit.organization_id) === String(form.organization_id),
    );
  }, [form.organization_id, units]);

  const availableSectors = useMemo(() => {
    if (!form.unit_id) return [];
    return sectors.filter(
      (sector) => String(sector.unit_id) === String(form.unit_id),
    );
  }, [form.unit_id, sectors]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedOrganizations, loadedUnits, loadedSectors] =
          await Promise.all([
            fetchAllPages("/organizations"),
            fetchAllPages("/units"),
            fetchAllPages("/sectors"),
          ]);

        setOrganizations(loadedOrganizations);
        setUnits(loadedUnits);
        setSectors(loadedSectors);

        if (isEditing) {
          const response = await api.get(`/people/${id}`);
          const person = response.data.data || response.data;
          setForm({
            name: person.name || "",
            email: person.email || "",
            phone: formatPhone(person.phone || ""),
            organization_id: person.organization_id || "",
            unit_id: person.unit_id || "",
            sector_id: person.sector_id || "",
            job_title: person.job_title || "",
            active: Boolean(person.active),
          });
        }
      } catch {
        setAlert({
          type: "danger",
          message: "Não foi possível carregar os dados da pessoa.",
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

      if (name === "organization_id") {
        nextForm.unit_id = "";
        nextForm.sector_id = "";
      }

      if (name === "unit_id") {
        nextForm.sector_id = "";
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
    payload.append("organization_id", form.organization_id || "");
    payload.append("unit_id", form.unit_id || "");
    payload.append("sector_id", form.sector_id || "");
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
        await api.post(`/people/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/people", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/people", {
        state: {
          message: `Pessoa ${isEditing ? "atualizada" : "criada"} com sucesso.`,
        },
      });
    } catch (error) {
      setAlert({
        type: "danger",
        message:
          error.response?.data?.message || "Não foi possível salvar a pessoa.",
        errors: error.response?.data?.errors,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Carregando pessoa..." />;

  return (
    <section>
      <div className="mb-4">
        <h1 className="h3 mb-1">
          {isEditing ? "Editar Pessoa" : "Nova Pessoa"}
        </h1>
        <p className="text-secondary mb-0">Preencha os dados cadastrais.</p>
      </div>
      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        errors={alert?.errors}
      />
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
        <div className="col-md-4">
          <label className="form-label" htmlFor="unit_id">
            Unidade
          </label>
          <select
            className="form-select"
            id="unit_id"
            name="unit_id"
            value={form.unit_id}
            onChange={updateField}
            disabled={!form.organization_id}
          >
            <option value="">Sem unidade</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="sector_id">
            Setor
          </label>
          <select
            className="form-select"
            id="sector_id"
            name="sector_id"
            value={form.sector_id}
            onChange={updateField}
            disabled={!form.unit_id}
          >
            <option value="">Sem setor</option>
            {availableSectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
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
            A foto ficará privada e visível apenas nos detalhes da pessoa.
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
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <Link className="btn btn-outline-secondary" to="/people">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

export default PeopleForm;
