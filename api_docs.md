# MKPainel Backend API Documentation

The MKPainel backend is a .NET 8 Web API implementing Clean Architecture. It uses SQLite for database storage and includes mock integrations for Google Ads, Meta Ads, and OpenAI.

## Base URL
Default local development: `http://localhost:5000` or `https://localhost:5001` (or matching ASP.NET Core port config).

---

## Authentication & Headers
For local development, endpoints that require context of the logged-in user accept an optional header:
* **`X-User-Id`**: `string (Guid)` - The internal ID of the logged-in user. If omitted, the API defaults to the seeded demo user (`d7fb473a-4efd-4e92-bc91-2a945b0a33c1`).

---

## 1. Auth Endpoints (`/api/auth`)

### Register User
* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "mySecurePassword123",
    "name": "João Silva"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "token": "mock_jwt_token_for_3ca860cb-9860-4966-bfd7-fca82d9bb4e0",
    "user": {
      "id": "3ca860cb-9860-4966-bfd7-fca82d9bb4e0",
      "email": "user@example.com",
      "name": "João Silva"
    }
  }
  ```

### Login User
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "demo@mkpainel.com.br",
    "password": "anypassword"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "token": "mock_jwt_token_for_d7fb473a-4efd-4e92-bc91-2a945b0a33c1",
    "user": {
      "id": "d7fb473a-4efd-4e92-bc91-2a945b0a33c1",
      "email": "demo@mkpainel.com.br",
      "name": "Davi Alves"
    }
  }
  ```

### Connect Platform Account (Mock)
Simulates connecting a Google or Meta Ads account through OAuth.
* **Method**: `POST`
* **Path**: `/api/auth/connect-mock`
* **Query Parameters**:
  * `userId`: `Guid` - The user ID to link the account to.
  * `platform`: `string` - `google` or `meta`.
  * `name`: `string` - The nickname/display name for the account (e.g. `Loja Bella Moda`).
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "accountId": "4b684cb3-a551-4f9e-a89e-eb18e69d76c3"
  }
  ```

---

## 2. Dashboard Endpoints (`/api/dashboard`)

### Get Dashboard Aggregated Data
Returns overall campaign performance metrics, platform breakdowns, warnings, and accounts status.
* **Method**: `GET`
* **Path**: `/api/dashboard`
* **Headers**: `X-User-Id` (optional)
* **Success Response** (`200 OK`):
  ```json
  {
    "kpis": {
      "clicks": 142,
      "conversions": 10,
      "spent": 1450.00,
      "avgRoas": 3.42,
      "impressions": 3550
    },
    "platformBreakdown": [
      {
        "platform": "GoogleAds",
        "spent": 900.00,
        "clicks": 80,
        "conversions": 6,
        "avgRoas": 3.1
      },
      {
        "platform": "MetaAds",
        "spent": 550.00,
        "clicks": 62,
        "conversions": 4,
        "avgRoas": 3.9
      }
    ],
    "warnings": [
      {
        "type": "balance_low",
        "accountName": "Imobiliária Solar",
        "accountId": "66666666-6666-6666-6666-666666666666",
        "message": "Saldo baixo na conta 'Imobiliária Solar': R$ 250.00 restantes (consumo de R$ 200.00/dia). Recarregue em menos de 48h.",
        "severity": "warning"
      },
      {
        "type": "campaign_underperforming",
        "campaignName": "Solar - Leads Apartamento Centro",
        "campaignId": "9b12c8a2-ea4b-48cf-ba95-1f9e1e2cfc3a",
        "accountName": "Imobiliária Solar",
        "message": "A campanha 'Solar - Leads Apartamento Centro' está com ROAS muito baixo (1.1x). Considere pausá-la ou ajustar a segmentação.",
        "severity": "warning"
      }
    ],
    "connectedAccounts": [
      {
        "id": "66666666-6666-6666-6666-666666666666",
        "name": "Imobiliária Solar",
        "platform": "GoogleAds",
        "externalAccountId": "111-222-3333",
        "balance": 250.00,
        "dailyBurn": 200.00,
        "status": "warning",
        "activeCampaignsCount": 2
      }
    ]
  }
  ```

---

## 3. Campaigns Endpoints (`/api/campaigns`)

### List Campaigns
Get list of campaigns with flexible filters and sorting.
* **Method**: `GET`
* **Path**: `/api/campaigns`
* **Query Parameters**:
  * `platform` (optional): `GoogleAds` or `MetaAds`.
  * `accountId` (optional): Filter campaigns by a specific connected account Guid.
  * `status` (optional): `active` or `paused`.
  * `searchTerm` (optional): Filter campaigns by name.
  * `sortBy` (optional): Sort by `roas` (default), `name`, `budget`, `spent`, `conversions`, `clicks`, `ctr`.
  * `descending` (optional): `true` (default) or `false`.
* **Success Response** (`200 OK`):
  ```json
  [
    {
      "id": "9b12c8a2-ea4b-48cf-ba95-1f9e1e2cfc3a",
      "connectedAccountId": "66666666-6666-6666-6666-666666666666",
      "accountName": "Imobiliária Solar",
      "platform": "GoogleAds",
      "externalCampaignId": "camp_sol_01",
      "name": "Solar - Leads Apartamento Centro",
      "status": "active",
      "budget": 150.00,
      "spent": 980.00,
      "conversions": 9,
      "clicks": 420,
      "ctr": 0.0210,
      "roas": 1.10,
      "lastSyncedAt": "2026-06-16T12:00:00Z"
    }
  ]
  ```

### Sync Campaigns
Simulates fetching real-time metrics updates and adjusting balances/burn-rates for the connected account.
* **Method**: `POST`
* **Path**: `/api/campaigns/sync/{accountId}`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Sincronização realizada com sucesso."
  }
  ```

### Pause Campaign (Manual)
Pauses the campaign locally and triggers the mock external API pause request.
* **Method**: `POST`
* **Path**: `/api/campaigns/{id}/pause`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "status": "paused"
  }
  ```

### Resume Campaign (Manual)
Resumes the campaign status locally.
* **Method**: `POST`
* **Path**: `/api/campaigns/{id}/resume`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "status": "active"
  }
  ```

---

## 4. AI Suggestions Endpoints (`/api/suggestions`)

### List AI Suggestions
Retrieve recommendation history.
* **Method**: `GET`
* **Path**: `/api/suggestions`
* **Query Parameters**:
  * `status` (optional): `PendingApproval`, `Approved`, `Rejected`, `Executed`, `Failed`.
* **Success Response** (`200 OK`):
  ```json
  [
    {
      "id": "e3cb88a9-4674-4b51-9efb-398d5c80bb11",
      "campaignId": "9b12c8a2-ea4b-48cf-ba95-1f9e1e2cfc3a",
      "campaignName": "Solar - Leads Apartamento Centro",
      "platform": "GoogleAds",
      "accountName": "Imobiliária Solar",
      "actionType": "PauseCampaign",
      "originalStateJson": "{\"status\":\"active\",\"budget\":150.00}",
      "suggestedStateJson": "{\"status\":\"paused\",\"budget\":150.00}",
      "reasoning": "A campanha 'Solar - Leads Apartamento Centro' está com o menor ROAS (1.1x), abaixo da meta estabelecida.",
      "projectedImpact": "Evita desperdício de R$ 150.00/dia, melhorando o ROAS médio da conta.",
      "status": "PendingApproval",
      "createdAt": "2026-06-16T12:05:00Z",
      "reviewedAt": null,
      "errorMessage": null
    }
  ]
  ```

### Approve AI Suggestion (Human-in-the-Loop)
Approves recommendation. The backend will trigger the platform mock client to pause/adjust, then flags the log as `Executed` (or `Failed`).
* **Method**: `POST`
* **Path**: `/api/suggestions/{id}/approve`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "status": "Executed",
    "errorMessage": null
  }
  ```

### Reject AI Suggestion
Rejects the suggestion, flagging it as `Rejected`.
* **Method**: `POST`
* **Path**: `/api/suggestions/{id}/reject`
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "status": "Rejected"
  }
  ```

### Prompt AI Assistant (Chat / Function Calling)
Evaluates custom user messages.
* If a real OpenAI API Key is provided, it uses the official model to analyze and trigger tool calls (`propose_pause_campaign`).
* If no key is configured, it falls back to a smart offline mock parsing the prompt text to match accounts and suggest pausing underperforming campaigns.
* **Method**: `POST`
* **Path**: `/api/suggestions/chat`
* **Request Body**:
  ```json
  {
    "message": "Pausa a campanha de menor ROAS da Imobiliária Solar"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "response": "Analisei as campanhas da conta **Imobiliária Solar** e identifiquei que a campanha **Solar - Leads Apartamento Centro** está com baixo desempenho (ROAS 1.1x).\n\nCriei uma recomendação para **Pausar** esta campanha. Você pode revisá-la e aprová-la na seção de sugestões do painel."
  }
  ```
