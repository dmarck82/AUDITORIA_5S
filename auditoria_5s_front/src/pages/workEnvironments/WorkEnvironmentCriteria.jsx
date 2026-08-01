import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, FormActions, PageHeader, StatusBadge } from '../../components/ui'
import { FIVE_S_SENSES } from '../../constants/fiveSSenses'

function WorkEnvironmentCriteria() {
  const { id } = useParams()
  const { can } = useAuth()
  const canUpdate = can('work_environments.update')
  const [workEnvironment, setWorkEnvironment] = useState(null)
  const [criteria, setCriteria] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const response = await api.get(`/work-environments/${id}/criteria`)
        const data = response.data.data || response.data
        setWorkEnvironment(data.work_environment)
        setCriteria(data.criteria || [])
        setSelectedIds((data.criteria || []).filter((criterion) => criterion.linked).map((criterion) => criterion.id))
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os critérios deste ambiente.' })
      } finally {
        setLoading(false)
      }
    }

    loadCriteria()
  }, [id])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const filteredCriteria = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    if (!term) return criteria

    return criteria.filter((criterion) => (
      `${criterion.code} ${criterion.question} ${criterion.sense_label}`
        .toLocaleLowerCase('pt-BR')
        .includes(term)
    ))
  }, [criteria, search])

  const groups = useMemo(() => FIVE_S_SENSES.map((sense) => ({
    ...sense,
    criteria: filteredCriteria.filter((criterion) => criterion.sense === sense.value),
  })).filter((group) => group.criteria.length > 0), [filteredCriteria])

  const toggleCriterion = (criterionId) => {
    setSelectedIds((current) => (
      current.includes(criterionId)
        ? current.filter((idValue) => idValue !== criterionId)
        : [...current, criterionId]
    ))
  }

  const selectVisible = () => {
    setSelectedIds((current) => [...new Set([...current, ...filteredCriteria.map((criterion) => criterion.id)])])
  }

  const clearVisible = () => {
    const visibleIds = new Set(filteredCriteria.map((criterion) => criterion.id))
    setSelectedIds((current) => current.filter((criterionId) => !visibleIds.has(criterionId)))
  }

  const selectAllActive = () => {
    setSelectedIds((current) => [...new Set([
      ...current,
      ...criteria.filter((criterion) => criterion.active).map((criterion) => criterion.id),
    ])])
  }

  const saveCriteria = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      const response = await api.put(`/work-environments/${id}/criteria`, {
        criterion_ids: selectedIds,
      })
      const data = response.data.data || response.data
      setCriteria(data.criteria || [])
      setSelectedIds((data.criteria || []).filter((criterion) => criterion.linked).map((criterion) => criterion.id))
      setAlert({ type: 'success', message: 'Critérios do ambiente atualizados com sucesso.' })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível atualizar os critérios do ambiente.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Carregando critérios do ambiente..." />

  const activeSelectedCount = criteria.filter((criterion) => criterion.active && selectedSet.has(criterion.id)).length

  return (
    <section>
      <PageHeader
        title={`Critérios — ${workEnvironment?.name || 'Ambiente de Trabalho'}`}
        description="Escolha quais perguntas serão usadas nas novas supervisões deste ambiente."
      />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

      {workEnvironment && (
        <Card className="mb-3" bodyClassName="py-3">
          <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center">
            <div>
              <div className="fw-semibold">{workEnvironment.local_1_name} / {workEnvironment.local_2_name} / {workEnvironment.local_3_name}</div>
              <div className="text-secondary small">Somente critérios ativos vinculados entram em novas supervisões.</div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge text-bg-primary fs-6">{selectedIds.length} vinculados</span>
              <span className="badge text-bg-success fs-6">{activeSelectedCount} ativos</span>
              <span className="badge text-bg-light border text-dark fs-6">{criteria.length} no catálogo</span>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={saveCriteria}>
        <Card className="mb-3" bodyClassName="py-3">
          <div className="row g-2 align-items-center">
            <div className="col-lg">
              <label className="visually-hidden" htmlFor="criteria-search">Buscar critérios</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search" aria-hidden="true" /></span>
                <input
                  className="form-control"
                  id="criteria-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por código, pergunta ou senso..."
                  type="search"
                  value={search}
                />
              </div>
            </div>
            {canUpdate && (
              <div className="col-lg-auto d-flex flex-wrap gap-2">
                <button className="btn btn-outline-primary" onClick={selectVisible} type="button">Selecionar visíveis</button>
                <button className="btn btn-outline-secondary" onClick={clearVisible} type="button">Limpar visíveis</button>
                <button className="btn btn-outline-success" onClick={selectAllActive} type="button">Selecionar todos os ativos</button>
              </div>
            )}
          </div>
        </Card>

        {groups.length === 0 && (
          <div className="alert alert-light border">Nenhum critério corresponde à busca.</div>
        )}

        <div className="d-grid gap-3">
          {groups.map((group) => {
            const groupSelected = group.criteria.filter((criterion) => selectedSet.has(criterion.id)).length

            return (
              <Card
                key={group.value}
                header={(
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{group.label}</span>
                    <span className="badge text-bg-light border text-dark">{groupSelected} de {group.criteria.length}</span>
                  </div>
                )}
                bodyClassName="p-0"
              >
                <div className="list-group list-group-flush">
                  {group.criteria.map((criterion) => (
                    <label className="list-group-item list-group-item-action d-flex gap-3 py-3" key={criterion.id}>
                      <input
                        checked={selectedSet.has(criterion.id)}
                        className="form-check-input flex-shrink-0 mt-1"
                        disabled={!canUpdate}
                        onChange={() => toggleCriterion(criterion.id)}
                        type="checkbox"
                      />
                      <span className="flex-grow-1">
                        <span className="d-flex flex-wrap gap-2 align-items-center mb-1">
                          <strong>{criterion.code}</strong>
                          <StatusBadge status={criterion.active ? 'active' : 'inactive'}>{criterion.active ? 'Ativo' : 'Inativo'}</StatusBadge>
                        </span>
                        <span>{criterion.question}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>

        <FormActions>
          {canUpdate && <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Salvando...' : 'Salvar vínculos'}</button>}
          <Link className="btn btn-outline-secondary" to={`/work-environments/${id}`}>Voltar ao ambiente</Link>
        </FormActions>
      </form>
    </section>
  )
}

export default WorkEnvironmentCriteria
