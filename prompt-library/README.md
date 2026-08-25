# Bibliothèque de prompts PromptForge

Cette bibliothèque regroupe des modèles de prompts réutilisables pour les usages les plus fréquents d’une équipe produit ou technique. Chaque modèle explicite ses variables entre doubles accolades, son résultat attendu et les critères de qualité à vérifier dans le playground.

> **Convention :** remplacer chaque variable `{{variable}}` par une valeur réelle avant l’exécution. Pour les sorties destinées à une API, conserver une structure JSON stricte et valider la réponse côté serveur.

## Catalogue

| Identifiant | Catégorie | Usage | Modèle conseillé |
| --- | --- | --- | --- |
| `code-review` | Engineering | Revue de code et risques | GPT-4o |
| `test-plan` | Engineering | Génération de tests | GPT-4o |
| `sql-generator` | Data | Requêtes SQL contrôlées | GPT-4o |
| `support-classifier` | Support | Classification de tickets | GPT-4o-mini |
| `meeting-summary` | Productivity | Synthèse de réunion | GPT-4o-mini |
| `product-copy` | Marketing | Description produit | GPT-4o |
| `prompt-optimizer` | Prompt engineering | Amélioration d’un prompt | GPT-4o |

## 1. Revue de code

**Variables :** `{{language}}`, `{{code}}`, `{{context}}`

```text
You are a senior {{language}} engineer performing a rigorous code review.

Context:
{{context}}

Code:
```{{language}}
{{code}}
```

Identify correctness bugs, security vulnerabilities, reliability risks, performance issues, and maintainability problems. Do not invent issues. For every finding, provide:
1. severity: critical, high, medium, low, or none;
2. exact location or symbol;
3. why it matters;
4. a concrete fix;
5. a corrected code snippet when useful.

Finish with a short summary of the strongest parts and the three most important next actions.
```

## 2. Plan de tests

**Variables :** `{{feature}}`, `{{requirements}}`, `{{stack}}`

```text
You are a test architect. Design a practical test plan for the following feature.

Feature:
{{feature}}

Requirements:
{{requirements}}

Technology stack:
{{stack}}

Return a table containing test id, scenario, setup, action, expected result, priority, and test type. Cover the happy path, validation errors, authorization boundaries, empty states, retries, concurrency, and regression risks. Prefer deterministic tests and identify any behavior that requires an integration or end-to-end test.
```

## 3. Générateur SQL

**Variables :** `{{schema}}`, `{{question}}`, `{{dialect}}`

```text
You are a database engineer. Write one safe, read-only {{dialect}} query answering the question below.

Schema:
{{schema}}

Question:
{{question}}

Rules:
- Use only tables and columns present in the schema.
- Never modify data or structure.
- Avoid SELECT * and qualify ambiguous columns.
- Explain assumptions in a separate comment only if the question is underspecified.
- Return the SQL query first, followed by a concise explanation and a list of required parameters.
```

## 4. Classificateur de tickets support

**Variables :** `{{ticket}}`, `{{known_categories}}`

```text
Classify the following customer-support ticket using only the allowed categories.

Allowed categories:
{{known_categories}}

Ticket:
{{ticket}}

Return valid JSON with exactly these fields:
{
  "category": "one allowed category",
  "priority": "low | medium | high | urgent",
  "suggested_team": "team name",
  "summary": "one sentence",
  "requires_human_review": true
}

Set requires_human_review to true when the ticket involves a security incident, payment dispute, legal threat, vulnerable customer, or insufficient information.
```

## 5. Synthèse de réunion

**Variables :** `{{transcript}}`, `{{audience}}`

```text
Summarize the meeting transcript for {{audience}}.

Transcript:
{{transcript}}

Produce the following sections:
- Executive summary in five sentences maximum.
- Decisions made, with owner and date when stated.
- Action items, each with owner, due date, and status.
- Open questions and risks.
- Important quotes only when they clarify a decision.

Do not attribute statements that are not supported by the transcript. Mark unknown owners or dates as "not specified".
```

## 6. Description produit

**Variables :** `{{product}}`, `{{audience}}`, `{{benefits}}`, `{{tone}}`

```text
You are an expert product copywriter. Write a concise product description for {{product}}.

Target audience:
{{audience}}

Verified benefits:
{{benefits}}

Tone:
{{tone}}

Return a title, a one-sentence value proposition, three benefit bullets, and a short call to action. Use only the verified benefits provided. Do not make unsupported performance, medical, financial, or legal claims.
```

## 7. Optimiseur de prompt

**Variables :** `{{original_prompt}}`, `{{target_model}}`, `{{success_criteria}}`

```text
Improve the following prompt for {{target_model}} while preserving its business intent.

Original prompt:
{{original_prompt}}

Success criteria:
{{success_criteria}}

Return:
1. the improved prompt;
2. the variables it expects;
3. the output format it requires;
4. the main changes and why they improve reliability;
5. two adversarial test inputs.

Do not add requirements that are not present in the original prompt or success criteria. Prefer explicit constraints, clear roles, unambiguous variable names, and a testable output contract.
```

## Règles de qualité

Avant de publier un prompt dans la bibliothèque, vérifier que son objectif est observable, que chaque variable est nécessaire et documentée, que les sorties attendues sont mesurables, et que les cas d’échec importants sont couverts. Tester au moins un cas nominal, un cas vide, un cas ambigu et un cas hostile lorsque le prompt traite des données externes.
