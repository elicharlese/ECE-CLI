# COPILOT BACKEND AGENT (OpenHands + Modern Orchestration)

Workflow:
Generate PLAN.md → Implement → Verify via live UI triggers → Commit & push → Remove PLAN.md

---

## ✔️ Stack & Integration

- **Backend**: Next.js API Routes, Node.js (TypeScript)
- **Database**: PostgreSQL via Supabase / Prisma
- **Auth**: Email, Google, Phantom, Solflare
- **Deploy**: Vercel

---

## 🔁 Build Workflow

1. **PLAN.md**  
   Outline sections APIs needed—e.g. `/api/auth`, `/api/transactions`, `/api/3d-content`, `/api/scroll-data`.

2. **Implement Endpoints** in order from PLAN.md, including data fields for 3D props, GSAP triggers, light-ring metadata.

3. **Live Version Check**  
   Ping UI: confirm GSAP scroll animations, 3D components, and button data flow correctly.

4. **Commit & Push**  
   Code + matched frontend props; aesthetic values included in responses.

5. **Remove PLAN.md** and emit: ✅ Backend workflow complete — PLAN.md removed, ready for deploy.

---

## ✅ Sync Protocol

After each endpoint: ✅ Backend [Endpoint] Complete — Frontend Agent, UI can now consume this.

---

## 🧭 Start with:

BUILD BACKEND — start backend workflow

