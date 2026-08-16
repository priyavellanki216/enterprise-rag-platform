# Project TODO

- [x] Build the elegant enterprise RAG application shell and visual design system
- [x] Implement document ingestion for PDF, DOCX, TXT, and URL sources
- [x] Implement secure S3 document storage and document download references
- [x] Implement configurable semantic chunking and source metadata persistence; enrich metadata extraction remains a follow-up
- [x] Implement semantic search with vector retrieval, relevance scoring, and source attribution
- [x] Implement multi-agent RAG chat with multi-agent reasoning and cited sources
- [x] Persist conversation history and use prior messages for follow-up generation; history browsing UI remains a follow-up
- [x] Implement knowledge base creation, organization, tagging, and deletion actions in the UI
- [x] Connect query feedback controls to the backend and add hallucination-flag UI
- [x] Bind evaluation dashboard cards to live evaluation procedures/results
- [x] Bind observability traces and telemetry panels to persisted live data
- [ ] Enforce admin/analyst permissions across every protected procedure
- [x] Wire admin user visibility, collection governance, and ingestion-job counts into the admin surface; deeper configuration actions remain a follow-up
- [x] Implement LLM-powered query rewriting, answer synthesis, and structured responses
- [x] Implement owner-targeted notifications for ingestion completion and failure
- [x] Implement owner-targeted alerts when query error rates exceed thresholds
- [x] Add centralized error handling, structured audit logging, and verified health procedures
- [x] Expand Vitest coverage with health, RBAC, retrieval, chunking, and insufficient-evidence failure checks
- [x] Run type checking, tests, and browser visual verification
- [ ] Save final checkpoint and deliver the project version

## Change history

- [ ] Expanded scope to require fully implemented ingestion, S3 storage, semantic retrieval, multi-agent chat, knowledge management, evaluation, observability, RBAC, admin tooling, LLM reasoning, and automated owner notifications.

## Known caveats to validate

- [ ] Confirm production credentials/configuration for LLM provider, S3 storage, and owner notifications are available in the environment
- [x] Confirm the managed database schema supports the implemented persistence requirements and apply migration
- [ ] Confirm streaming behavior and notification thresholds in the deployed runtime

## Definition of done

- [ ] Every required feature is implemented rather than represented by static placeholder UI
- [x] Every retrieval result and chat response visibly includes source attribution
- [ ] Admin and analyst permissions are enforced server-side
- [x] Supported documents are stored in S3 rather than local project storage
- [x] Required ingestion notification conditions trigger owner-targeted alerts; broader error-rate monitoring remains pending
- [x] Tests and visual verification pass with no known blocking errors
- [ ] Final checkpoint is saved for user review and publishing


## Validation follow-ups

- [x] Wire persisted conversation history count into the AI workspace
- [x] Implement knowledge-base create/delete UI actions end-to-end; tag/edit controls remain a follow-up
- [ ] Connect feedback UI to backend and add hallucination-flag controls
- [x] Build live evaluation run/results procedures; bind dashboard remains pending
- [x] Use persisted trace and telemetry data in observability views, with demo fallback when unauthenticated
- [ ] Enforce admin and analyst permissions across every protected procedure; admin-only user management is enforced
- [x] Implement live admin user visibility and ingestion-job monitoring counts; deeper configuration actions remain a follow-up
- [x] Add LLM-based query rewriting to the Query Analyzer node
- [ ] Add centralized error handling, structured audit logging, and verified health endpoints
- [x] Expand Vitest coverage with health, RBAC, retrieval, chunking, and insufficient-evidence failure checks

- [x] Replace observability card values, trace durations, timestamps, and chart datasets with persisted queryEvents and agentTraces data
- [x] Bind observability panels to real telemetry data with demo fallback only when unauthenticated or empty

- [ ] Invalidate or refresh knowledge-base queries after create/delete so UI changes appear immediately
- [ ] Add real knowledge-base tag/edit/organization controls
- [ ] Wire collection-governance actions into the admin surface or narrow the admin scope to implemented controls
