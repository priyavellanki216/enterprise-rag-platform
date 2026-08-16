# Project TODO

- [x] Build the elegant enterprise RAG application shell and visual design system
- [x] Implement document ingestion for PDF, DOCX, TXT, and URL sources
- [x] Implement secure S3 document storage and document download references
- [ ] Implement automatic chunking and meaningful metadata extraction
- [x] Implement semantic search with vector retrieval, relevance scoring, and source attribution
- [x] Implement multi-agent RAG chat with multi-agent reasoning and cited sources
- [ ] Implement conversation history in the UI and use prior messages for follow-up generation
- [ ] Implement knowledge base creation, organization, tagging, and deletion actions in the UI
- [ ] Connect query feedback controls to the backend and add hallucination-flag UI
- [ ] Bind evaluation dashboard cards to live evaluation procedures/results
- [ ] Bind observability traces and telemetry panels to persisted live data
- [ ] Enforce admin/analyst permissions across every protected procedure
- [ ] Wire admin user, system configuration, and ingestion-job actions end-to-end
- [x] Implement LLM-powered query rewriting, answer synthesis, and structured responses
- [x] Implement owner-targeted notifications for ingestion completion and failure
- [x] Implement owner-targeted alerts when query error rates exceed thresholds
- [ ] Add centralized error handling and structured audit logging; verify health endpoints
- [ ] Expand Vitest coverage for upload, RBAC, notifications, admin, and failure scenarios
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

- [ ] Wire conversation history retrieval into the UI
- [ ] Implement knowledge-base tag/edit/delete UI actions end-to-end
- [ ] Connect feedback UI to backend and add hallucination-flag controls
- [x] Build live evaluation run/results procedures; bind dashboard remains pending
- [ ] Use persisted trace and telemetry data in observability views instead of hardcoded entries
- [ ] Enforce admin and analyst permissions across all protected procedures
- [ ] Implement real admin user, system configuration, and ingestion-job management actions
- [x] Add LLM-based query rewriting to the Query Analyzer node
- [ ] Add centralized error handling, structured audit logging, and verified health endpoints
- [ ] Expand Vitest coverage for upload, RBAC, notifications, admin, and failure scenarios
