TODO-liste for HMS Systemadministrasjon
1. Bedriftshåndtering
- [x ] Lage oversiktsside for bedrifter
[ x] Implementere søk og filtrering av bedrifter
[ x] Vise bedriftsstatus (aktiv/inaktiv)
[ x] Vise betalingsstatus
[ ] Vise moduler bedriften har tilgang til
2. Brukeradministrasjon
- [ ] Lage oversikt over alle brukere på tvers av bedrifter
[ ] Implementere filtrering på bedrift og rolle
[ ] Mulighet for å endre brukerroller
[ ] Mulighet for å deaktivere/aktivere brukere
[ ] Logg over brukerendringer
3. HMS-håndbok Administrasjon
- [ ] Lage redigeringsgrensesnitt for standard HMS-håndbok
[ ] Implementere versjonskontroll
[ ] Mulighet for å opprette bransjespesifikke maler
[ ] Oversikt over bedriftsspesifikke tilpasninger
[ ] Logg over endringer i håndbøker
4. Modul- og Tilgangsadministrasjon
- [ ] Oversikt over tilgjengelige moduler
[ ] Administrere modultilgang per bedrift
[ ] Konfigurere standardinnstillinger for moduler
[ ] Aktivere/deaktivere moduler globalt
5. Varslingssystem
- [ ] Grensesnitt for å sende systemmeldinger
[ ] Håndtere automatiske varsler om HMS-endringer
[ ] Oversikt over sendte varsler
[ ] Målretting av varsler basert på bedrift/bransje
6. Rapportering og Analyse
- [ ] Systemstatistikk og bruksanalyse
[ ] Avviksrapportering på tvers av bedrifter
[ ] Eksport av systemdata
[ ] Revisjonslogg for systemendringer
7. API-endepunkter
Bedriftshåndtering
- [ ] GET /api/admin/companies
[ ] POST /api/admin/companies
[ ] PATCH /api/admin/companies/{id}
[ ] DELETE /api/admin/companies/{id}
HMS-håndbok Administrasjon
- [ ] GET /api/admin/hms-handbook/templates
[ ] POST /api/admin/hms-handbook/templates
[ ] PATCH /api/admin/hms-handbook/templates/{id}
[ ] GET /api/admin/hms-handbook/versions
Moduladministrasjon
- [ ] GET /api/admin/modules
[ ] POST /api/admin/modules/assign
[ ] DELETE /api/admin/modules/revoke
8. Databaseendringer
- [ ] Legge til admin-spesifikke modeller
[ ] Utvide eksisterende modeller med admin-felter
[ ] Implementere relasjoner for systemadministrasjon
9. Komponenter
Bedriftsadministrasjon
- [ ] CompanyList.tsx
[ ] CompanyDetails.tsx
[ ] ModuleAssignment.tsx
HMS-håndbok Administrasjon
- [ ] TemplateEditor.tsx
[ ] VersionControl.tsx
[ ] ChangeLog.tsx
Systemovervåking
- [ ] SystemStats.tsx
[ ] UserActivity.tsx
[ ] ErrorLog.tsx