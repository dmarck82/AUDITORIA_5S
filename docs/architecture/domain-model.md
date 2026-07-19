# Modelo de domínio do SSEP

## Objetivo

O SSEP supervisiona as condições dos ambientes de trabalho nos quais processos e atividades são executados.

Ele não tem como objetivo primário auditar a execução do processo.

## Estrutura conceitual

```text
Organização
└── Unidade ou OMDS
    └── Setor
        └── Subsetor
            └── Processo
                └── Atividade
```

A metodologia é representada por:

```text
Metodologia
└── Dimensão de avaliação
    └── Critério universal
        └── Modelo de avaliação
```

A adaptação para cada atividade é representada por:

```text
Atividade
└── Critério associado
    └── Aspectos de verificação
```

## Exemplo

```text
Setor: Almoxarifado
Processo: Gestão do Almoxarifado
Atividade: Armazenamento

Metodologia: 5S
Dimensão: Organização

Critério ORG-001:
Os recursos necessários à execução das atividades encontram-se
organizados conforme o padrão estabelecido.

Aspectos:
- localização dos materiais;
- identificação das prateleiras;
- agrupamento por categoria.

Modelo M02:
- 0: Compromete a execução da atividade;
- 5: Apresenta falhas significativas;
- 10: Atende parcialmente ao padrão;
- 15: Atende plenamente ao padrão.
```

## Relacionamentos propostos

```text
setor 1:N processo
processo 1:N atividade

metodologia 1:N dimensao_avaliacao
dimensao_avaliacao 1:N criterio

modelo_avaliacao 1:N modelo_avaliacao_opcao
modelo_avaliacao 1:N criterio

atividade N:N criterio por atividade_criterio
atividade_criterio 1:N atividade_criterio_aspecto
```

## Responsabilidades

### Processo

Conjunto organizado de atividades.

### Atividade

Parte executável do processo. “Atividade” é nomenclatura provisória, mas o conceito deve permanecer estável.

### Metodologia

Abordagem de supervisão, como 5S ou Gestão Ambiental.

### Dimensão

Divisão interna de uma metodologia. No 5S, pode ser apresentada como “senso”.

### Critério universal

Regra reutilizável que não depende de setor, processo ou atividade específica.

### Associação atividade-critério

Indica que um critério é aplicável a uma atividade.

### Aspecto de verificação

Adaptação prática do critério para uma atividade específica.

### Modelo de avaliação

Forma metodológica usada para avaliar um critério.

### Opção de avaliação

Condição de atendimento ou graduação reutilizável.

## Cadastro e execução

O cadastro é mutável:

```text
metodologias
dimensões
critérios
modelos
opções
atividades
associações
aspectos
```

A execução deve preservar snapshots:

```text
supervisão
itens
critérios copiados
aspectos copiados
opções copiadas
respostas
evidências
```

Uma alteração futura na biblioteca não pode modificar uma supervisão concluída.

## Decisões atuais

- Critérios são universais.
- Aspectos são específicos da associação atividade-critério.
- O senso não deve ser repetido em `atividade_criterio`.
- Modelo de avaliação não é igual a tipo de resposta.
- Supervisões devem preservar snapshots.
- Entidades existentes devem ser reaproveitadas.
- Cadastro metodológico e execução devem ser separados.
- “Auditoria” versus “supervisão” ainda precisa ser consolidado.

## Questões em aberto

- significado definitivo de OMDS;
- entidade ambiente;
- nível organizacional do processo;
- uma ou várias atividades por supervisão;
- resposta por critério ou aspecto;
- opção não aplicável;
- pesos;
- cálculo;
- notas de não conformidade;
- NC automática ou validada;
- observação e evidência obrigatórias;
- aprovação;
- verificação;
- eficácia;
- regras do 5W2H.
