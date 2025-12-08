# Phase 2: Load Balancing Architecture

## Current Problem (Phase 1)

```mermaid
flowchart TD
    subgraph "Phase 1 - Single Server ❌"
        U1[User 1] --> S[Server :5001]
        U2[User 2] --> S
        U3[User 3] --> S
        U4[User 10000] --> S
        S --> DB[(MongoDB)]
        S -.-> X[💥 Server Overload!]
    end
```

## Phase 2 Solution - Load Balancer

```mermaid
flowchart TD
    subgraph "Clients"
        U1[User 1]
        U2[User 2]
        U3[User 3]
        U4[User 4]
    end

    subgraph "Load Balancer"
        LB[Nginx :80]
    end

    subgraph "Server Instances"
        S1[Node Server 1 :5001]
        S2[Node Server 2 :5002]
        S3[Node Server 3 :5003]
    end

    subgraph "Database"
        DB[(MongoDB)]
    end

    U1 --> LB
    U2 --> LB
    U3 --> LB
    U4 --> LB

    LB --> S1
    LB --> S2
    LB --> S3

    S1 --> DB
    S2 --> DB
    S3 --> DB
```

## Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Nginx as Nginx (LB)
    participant S1 as Server 1
    participant S2 as Server 2
    participant S3 as Server 3
    participant DB as MongoDB

    User->>Nginx: Request 1
    Nginx->>S1: Route (Round Robin)
    S1->>DB: Query
    DB-->>S1: Response
    S1-->>Nginx: Response
    Nginx-->>User: Response

    User->>Nginx: Request 2
    Nginx->>S2: Route (Round Robin)
    S2->>DB: Query
    DB-->>S2: Response
    S2-->>Nginx: Response
    Nginx-->>User: Response

    User->>Nginx: Request 3
    Nginx->>S3: Route (Round Robin)
    S3-->>Nginx: Response
    Nginx-->>User: Response
```

## Load Balancing Strategies

```mermaid
flowchart LR
    subgraph "Round Robin"
        RR[Request] --> A1[Server 1]
        RR --> A2[Server 2]
        RR --> A3[Server 3]
        A1 -.-> |Next| A2
        A2 -.-> |Next| A3
        A3 -.-> |Next| A1
    end
```

| Strategy | Kaise kaam karta |
|----------|------------------|
| **Round Robin** | 1 → 2 → 3 → 1 → 2 → 3... |
| **Least Connections** | Jis server pe kam load, usko bhejo |
| **IP Hash** | Same user always same server |

## WebSocket Problem ⚠️

```mermaid
flowchart TD
    subgraph "Problem: Socket Connection Lost"
        U[User] --> LB[Nginx]
        LB --> |Request 1| S1[Server 1 - Socket Connected]
        LB --> |Request 2| S2[Server 2 - Socket NOT here!]
        S2 -.-> X[❌ Connection Lost]
    end
```

## Solution: Sticky Sessions

```mermaid
flowchart TD
    subgraph "Sticky Sessions"
        U[User] --> LB[Nginx]
        LB --> |All Requests| S1[Server 1]
        S1 --> |Socket.io| WS[WebSocket Active ✅]
    end
```

## Folder Structure (Phase 2)

```
system_design_pract/
├── nginx/
│   └── nginx.conf          # Load balancer config
├── server/
│   └── server.js           # Same code, multiple instances
├── client/
└── docker-compose.yml      # (Optional) Run all together
```

## What We'll Learn

| Concept | Implementation |
|---------|----------------|
| Load Balancing | Nginx |
| Multiple Instances | PM2 or manual |
| Sticky Sessions | For WebSocket |
| Health Checks | Server monitoring |
| Horizontal Scaling | Add more servers |

## Commands Preview

```bash
# Run 3 server instances
PORT=5001 node server.js
PORT=5002 node server.js
PORT=5003 node server.js

# Nginx routes traffic to all 3
```

---

Ready to implement? 🚀
