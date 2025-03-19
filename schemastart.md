generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(cuid())
  email         String        @unique
  name          String?
  password      String
  role          Role          @default(EMPLOYEE)
  companyId     String
  company       Company       @relation(fields: [companyId], references: [id])
  notifications Notification[]
  metadata      Json? @default("{}")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  emailQueue    EmailQueue[]
  documents     Document[]

  Stoffkartotek Stoffkartotek[] @relation("StoffkartotekCreator")

  SJAKommentar SJAKommentar[]

  SJABilde SJABilde[]

  SJARevisjon SJARevisjon[]

  SJAGodkjenning SJAGodkjenning[]

  SJA SJA[] @relation("SJACreator")

  SJAMal SJAMal[]

  SJAVedlegg SJAVedlegg[]

  createdSafetyRounds SafetyRound[] @relation("CreatedSafetyRounds")
  assignedSafetyRounds SafetyRound[] @relation("AssignedSafetyRounds")
  trainings    Training[] @relation("TrainingParticipants")
  notificationSettings NotificationSettings?
  isActive    Boolean   @default(true)
  phone         String?
  avatar        String?
  settings UserSettings?
  image               String?
  address       Json?    // Lagrer adresse som JSON { street, postalCode, city }
  

  PasswordResetToken PasswordResetToken[]

  SafetyRoundImage SafetyRoundImage[]

  SafetyRoundParticipant SafetyRoundParticipant[]

  SafetyRoundFinding SafetyRoundFinding[] @relation("FindingStatusUpdatedBy")

  certifications Json? @default("{\"machineCards\": [], \"driverLicenses\": []}")

  HMSHandbook HMSHandbook[]

  EquipmentInspection EquipmentInspection[] @relation("Inspections")

  DocumentVersion DocumentVersion[]
}

model Company {
  id                   String           @id @default(cuid())
  orgNumber           String           @unique
  name                String
  organizationType     String          // organisasjonsform.beskrivelse
  organizationCode     String          // organisasjonsform.kode
  website             String?
  address             Address?
  users               User[]
  modules             Module[]
  hmsHandbooks        HMSHandbook[]
  riskAssessments     RiskAssessment[]
  deviations          Deviation[]
  isVerified          Boolean          @default(false)
  verificationDate    DateTime?
  lastBrregUpdate     DateTime?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  documents           Document[]

  Stoffkartotek Stoffkartotek[]

  SJA SJA[]

  SJAMal SJAMal[]

  HMSChange HMSChange[]

  isActive         Boolean  @default(true)
  paymentStatus    PaymentStatus @default(PENDING)
  lastPaymentDate  DateTime?
  trainings    Training[]
  goals       HMSGoal[]

  SafetyRound SafetyRound[]

  // Legg til nye felt for pakkeinfo
  subscriptionPlan    String    @default("STANDARD") // STANDARD, STANDARD_PLUS, PREMIUM
  employeeCount       Int       @default(1)
  storageLimit        Int       @default(1) // i GB
  includeVernerunde   Boolean   @default(false)
  vernerundeDate      DateTime? // Dato for siste vernerunde

  SafetyRoundTemplate SafetyRoundTemplate[]

  Equipment Equipment[]

  EquipmentInspection EquipmentInspection[]

  Category Category[]
}

model Address {
  id          String   @id @default(cuid())
  street      String?
  streetNo    String?
  postalCode  String
  city        String
  country     String   @default("Norge")
  companyId   String   @unique
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Module {
  id          String    @id @default(cuid())
  key         String    // Fjern @unique her
  label       String    
  description String?   
  isActive    Boolean   @default(true)
  isDefault   Boolean   @default(false)
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relasjoner til modul-spesifikke data
  safetyRounds     SafetyRound[]
  hmsConsultations HMSConsultation[]
  
  @@unique([companyId, key]) // Legg til denne for å sikre unik kombinasjon av bedrift og modul
  @@index([companyId])
}

model HMSHandbook {
  id          String      @id @default(cuid())
  version     Int
  status      String      @default("DRAFT")  // DRAFT, ACTIVE, ARCHIVED
  companyId   String
  company     Company     @relation(fields: [companyId], references: [id])
  createdById String
  createdBy   User        @relation(fields: [createdById], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  title       String
  description String?
  publishedAt DateTime?
  publishedBy String?
  sections    HMSSection[]
  releases    HMSRelease[]

  @@index([companyId])
  @@index([createdById])
}

enum HMSStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model HMSRelease {
  id          String       @id @default(cuid())
  version     Int
  handbookId  String
  handbook    HMSHandbook  @relation(fields: [handbookId], references: [id])
  changes     String       // Beskrivelse av endringer
  reason      String       // Årsak til endringen
  approvedBy  String       // Bruker-ID som godkjente endringen
  approvedAt  DateTime     @default(now())
  content     Json         // Snapshot av hele håndboken ved release
  changelog   Json?        // Detaljert endringslogg
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@unique([handbookId, version])
}

model HMSSection {
  id          String   @id @default(cuid())
  title       String
  content     Json
  order       Int
  parentId    String?  // For underseksjoner
  parent      HMSSection? @relation("SectionToSection", fields: [parentId], references: [id])
  subsections HMSSection[] @relation("SectionToSection")
  handbookId  String
  handbook    HMSHandbook @relation(fields: [handbookId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  changes     HMSChange[]

  // Kobling til risikovurderinger
  relatedRiskAssessments RiskAssessment[]

  @@index([handbookId])
  @@index([parentId])
}


model RiskAssessment {
  id          String        @id @default(cuid())
  title       String
  description String        @db.Text
  department  String?       // Avdeling/område
  activity    String        // Aktivitet som vurderes
  status      Status        @default(DRAFT)
  dueDate     DateTime?     // Frist for gjennomføring
  companyId   String
  company     Company       @relation(fields: [companyId], references: [id])
  createdBy   String       // Bruker-ID som opprettet
  updatedBy   String?      // Bruker-ID som sist oppdaterte
  hazards     Hazard[]     // Risikofaktorer
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  hmsChanges    RiskAssessmentHMSChange[]
  measures      RiskAssessmentMeasure[]

  // Kobling til HMS-seksjoner
  relatedHMSSections HMSSection[]

  // Legg til equipment-relasjon
  equipmentId String?
  equipment   Equipment? @relation(fields: [equipmentId], references: [id])

  @@index([companyId])
  @@index([equipmentId])
}

model Hazard {
  id                String          @id @default(cuid())
  description       String          @db.Text
  consequence       String          @db.Text
  probability       Int             // 1-5
  severity         Int             // 1-5
  riskLevel        Int             // Beregnet: probability * severity
  existingMeasures String?         @db.Text  // Eksisterende tiltak
  riskAssessmentId String
  riskAssessment   RiskAssessment  @relation(fields: [riskAssessmentId], references: [id], onDelete: Cascade)
  measures         Measure[]       // Beholder eksisterende tiltak-relasjon
  hmsChanges       HazardHMSChange[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  riskMeasures     RiskAssessmentMeasure[]  // Ny relasjon for risikovurderingstiltak

  @@index([riskAssessmentId])
}

model Measure {
  id          String    @id @default(cuid())
  description String    @db.Text
  type        MeasureType
  status      Status    @default(OPEN)
  priority    Priority
  dueDate     DateTime?
  completedAt DateTime?
  hazardId    String
  hazard      Hazard    @relation(fields: [hazardId], references: [id], onDelete: Cascade)
  assignedTo  String?   // Bruker-ID
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  hmsChangeId String?
  hmsChange   HMSChange? @relation(fields: [hmsChangeId], references: [id])

  @@index([hazardId])
  @@index([hmsChangeId])
  SafetyRoundFinding SafetyRoundFinding[]
}

model Deviation {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  type        DeviationType
  category    String    
  severity    Severity
  status      Status    @default(OPEN)
  dueDate     DateTime?
  location    String?   // Hvor skjedde avviket
  reportedBy  String    // Bruker-ID som rapporterte
  assignedTo  String?   // Bruker-ID som er ansvarlig
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])
  measures    DeviationMeasure[]
  images      DeviationImage[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  closedAt    DateTime?
  closedBy    String?   // Bruker-ID som lukket avviket
  hmsChanges    DeviationHMSChange[]
  closeComment String?   // Legg til dette feltet

  // Legg til source-felt for å spore opphavet
  source      String?   // F.eks. "SAFETY_ROUND", "INCIDENT_REPORT" etc.
  sourceId    String?   // ID til kilden (f.eks. safety round ID)
  
  // Kobling til SafetyRoundFinding
  safetyRoundFinding SafetyRoundFinding[]

  // Nye felter for objektavvik
  equipmentId String?   // Nytt felt for å koble til utstyr
  equipment   Equipment? @relation(fields: [equipmentId], references: [id])
  
  // Nye felter for objektavvik
  objectType  String?   // EQUIPMENT, FACILITY, TOOL etc
  objectId    String?   // ID til det spesifikke objektet
  partAffected String?  // Hvilken del er berørt
  maintenanceRequired Boolean @default(false)
  
  statusHistory DeviationStatusHistory[]

  @@index([companyId])
  @@index([status])
  @@index([source, sourceId])
  @@index([equipmentId])
}

model DeviationMeasure {
  id          String    @id @default(cuid())
  description String
  type        String    // ELIMINATION, SUBSTITUTION, ENGINEERING, ADMINISTRATIVE, PPE
  status      String    @default("OPEN")  // OPEN, CLOSED
  priority    String    // LOW, MEDIUM, HIGH, CRITICAL
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?
  assignedTo  String?
  createdBy   String
  deviationId String
  deviation   Deviation @relation(fields: [deviationId], references: [id])
  closedAt    DateTime?
  closedBy    String?
  closeComment String?   // Begrunnelse for lukking av tiltaket
  closureVerifiedBy String? // Person som har verifisert at tiltaket er gjennomført
  closureVerifiedAt DateTime?

  @@index([deviationId])
}

model DeviationImage {
  id          String    @id @default(cuid())
  url         String
  caption     String?
  deviationId String
  deviation   Deviation @relation(fields: [deviationId], references: [id], onDelete: Cascade)
  uploadedBy  String    // Bruker-ID
  createdAt   DateTime  @default(now())

  @@index([deviationId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("notifications")
}

enum NotificationType {
  DEVIATION_CREATED
  DEVIATION_ASSIGNED
  DEVIATION_UPDATED
  DEVIATION_CLOSED
  SJA_CREATED
  SJA_ASSIGNED
  SJA_UPDATED
  SJA_APPROVED
}

model EmailQueue {
  id        String   @id @default(cuid())
  userId    String
  type      String
  payload   Json
  attempts  Int      @default(0)
  status    String   @default("PENDING") // PENDING, SENT, FAILED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])

  @@index([status])
  @@index([userId])
}

model Document {
  id          String   @id @default(cuid())
  name        String
  description String?
  type        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relasjoner
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  company     Company  @relation(fields: [companyId], references: [id])
  companyId   String
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  versions    DocumentVersion[]

  @@index([userId])
  @@index([companyId])
  @@index([categoryId])
}

// Ny modell for dokumentkategorier
model Category {
  id          String     @id @default(cuid())
  name        String
  description String?
  documents   Document[]
  company     Company    @relation(fields: [companyId], references: [id])
  companyId   String

  @@unique([name, companyId])  // Legg til denne
  @@index([companyId])
}

// Ny modell for dokumentversjoner
model DocumentVersion {
  id          String   @id @default(cuid())
  version     Int
  fileName    String
  fileSize    Int
  fileUrl     String
  createdAt   DateTime @default(now())
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId  String
  uploadedBy  User     @relation(fields: [uploadedById], references: [id])
  uploadedById String

  @@index([documentId])
  @@index([uploadedById])
}

enum Role {
  ADMIN
  SUPPORT
  COMPANY_ADMIN
  EMPLOYEE
}

enum Status {
  DRAFT
  OPEN
  IN_PROGRESS
  SCHEDULED
  CLOSED
  COMPLETED
  CANCELLED
  AAPEN
  PAAGAAR
  LUKKET
}

enum MeasureType {
  ELIMINATION      // Eliminering
  SUBSTITUTION     // Substitusjon
  ENGINEERING      // Tekniske tiltak
  ADMINISTRATIVE   // Administrative tiltak
  PPE             // Personlig verneutstyr
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum DeviationType {
  NEAR_MISS     // Nestenulykke
  INCIDENT      // Hendelse
  ACCIDENT      // Ulykke
  IMPROVEMENT   // Forbedringsforslag
  OBSERVATION   // Observasjon
}

enum Severity {
  LOW      // Lav alvorlighetsgrad
  MEDIUM   // Middels alvorlighetsgrad
  HIGH     // Høy alvorlighetsgrad
  CRITICAL // Kritisk alvorlighetsgrad
}

enum FareSymbol {
  BRANNFARLIG
  ETSENDE
  GIFTIG
  HELSEFARE
  MILJØFARE
  EKSPLOSJONSFARLIG
  OKSIDERENDE
  GASS_UNDER_TRYKK
  AKUTT_GIFTIG
}

// Oppdater PPESymbol enum med alle ISO 7010 M-symboler
enum PPESymbol {
  M001_GENERAL_MANDATORY
  M002_READ_INSTRUCTIONS
  M003_WEAR_EAR_PROTECTION
  M004_WEAR_EYE_PROTECTION
  M005_CONNECT_EARTH_TERMINAL
  M006_DISCONNECT_MAINS
  M007_WEAR_OPAQUE_EYE_PROTECTION
  M008_WEAR_FOOT_PROTECTION
  M009_WEAR_PROTECTIVE_GLOVES
  M010_WEAR_PROTECTIVE_CLOTHING
  M011_WASH_HANDS
  M012_USE_HANDRAIL
  M013_WEAR_FACE_SHIELD
  M014_WEAR_HEAD_PROTECTION
  M015_WEAR_HIGH_VISIBILITY
  M016_WEAR_MASK
  M017_WEAR_RESPIRATORY_PROTECTION
  M018_WEAR_SAFETY_HARNESS
  M019_WEAR_WELDING_MASK
  M020_WEAR_SAFETY_BELTS
  M021_DISCONNECT_BEFORE_MAINTENANCE
  M022_USE_BARRIER_CREAM
  M023_USE_FOOTBRIDGE
  M024_USE_WALKWAY
  M025_PROTECT_INFANTS_EYES
  M026_USE_PROTECTIVE_APRON
  M027_INSTALL_GUARD
  M028_KEEP_LOCKED
  M029_SOUND_HORN
  M030_PLACE_TRASH_IN_BIN
  M031_USE_TABLE_SAW_GUARD
  M032_USE_ANTISTATIC_FOOTWEAR
  M033_LOWER_SKI_RESTRAINT
  M034_RAISE_SKI_RESTRAINT
  M035_EXIT_TOWPATH
  M036_KEEP_SKI_TIPS_UP
  M037_SECURE_LIFEBOAT_HATCH
  M038_START_LIFEBOAT_MOTOR
  M039_LOWER_LIFEBOAT
  M040_LOWER_LIFEBOAT_TO_WATER
  M041_LOWER_RESCUE_BOAT
  M042_RELEASE_LIFEBOAT_HOOKS
  M043_START_WATER_SPRAY
  M044_START_AIR_SUPPLY
  M045_RELEASE_GRIPES
  M046_SECURE_GAS_CYLINDERS
  M047_USE_BREATHING_EQUIPMENT
  M048_USE_GAS_DETECTOR
  M049_USE_SPORTS_PROTECTION
  M050_EXIT_SLED_LEFT
  M051_EXIT_SLED_RIGHT
  M052_KEEP_SLED_DISTANCE
  M053_WEAR_LIFEJACKET
  M054_SUPERVISE_CHILDREN
  M055_KEEP_FROM_CHILDREN
  M056_VENTILATE_BEFORE_ENTERING
  M057_ENSURE_VENTILATION
  M058_ENTRY_WITH_SUPERVISOR
  M059_WEAR_LAB_COAT
  M060_HOLD_TROLLEY_HANDLE
  M061_DISINFECT_HANDS
  M062_DISINFECT_SURFACE
}

// Legg til ny junction-tabell
model PPESymbolMapping {
  id               String        @id @default(cuid())
  symbol           PPESymbol
  stoffkartotek    Stoffkartotek @relation(fields: [stoffkartotekId], references: [id], onDelete: Cascade)
  stoffkartotekId  String

  @@index([stoffkartotekId])
}

model Stoffkartotek {
  id            String      @id @default(cuid())
  produktnavn   String
  produsent     String?
  databladUrl   String?     @db.Text
  beskrivelse   String?     @db.Text
  bruksomrade   String?     @db.Text
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  companyId     String      
  company       Company     @relation(fields: [companyId], references: [id])
  opprettetAv   User?       @relation("StoffkartotekCreator", fields: [opprettetAvId], references: [id])
  opprettetAvId String?
  fareSymboler  FareSymbolMapping[]
  ppeSymboler   PPESymbolMapping[]  // Endret til relation istedenfor JSON

  @@index([companyId])
  SJAProdukt SJAProdukt[]
}

model FareSymbolMapping {
  id               String        @id @default(cuid())
  symbol           FareSymbol
  stoffkartotek    Stoffkartotek @relation(fields: [stoffkartotekId], references: [id], onDelete: Cascade)
  stoffkartotekId  String

  @@index([stoffkartotekId])
}

// SJA modeller
enum SJAStatus {
  UTKAST
  SENDT_TIL_GODKJENNING
  GODKJENT
  AVVIST
  UTGATT
}

model SJA {
  id            String      @id @default(cuid())
  tittel        String
  arbeidssted   String
  beskrivelse   String      @db.Text
  deltakere     String      @db.Text
  startDato     DateTime
  sluttDato     DateTime?
  status        SJAStatus  @default(UTKAST)
  
  // ISO 45001: Risikovurdering og tiltak
  risikoer      Risiko[]
  tiltak        Tiltak[]
  
  // Stoffkartotek-produkter
  produkter     SJAProdukt[]
  
  // ISO 9001: Sporbarhet
  opprettetAv   User       @relation("SJACreator", fields: [opprettetAvId], references: [id])
  opprettetAvId String
  opprettetDato DateTime   @default(now())
  oppdatertDato DateTime   @updatedAt
  
  // ISO 27001: Tilgangskontroll
  company       Company    @relation(fields: [companyId], references: [id])
  companyId     String
  
  // Godkjenning og historikk
  godkjenninger SJAGodkjenning[]
  revisjoner    SJARevisjon[]
  bilder        SJABilde[]
  kommentarer   SJAKommentar[]
  vedlegg       SJAVedlegg[]
  kundeGodkjenning SJAKundeGodkjenning[]

  @@index([companyId])
  @@index([opprettetAvId])
}

// Ny modell for å koble SJA med stoffkartotek-produkter
model SJAProdukt {
  id          String      @id @default(cuid())
  mengde      String?
  
  // Relasjoner
  sja         SJA        @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  sjaId       String
  produkt     Stoffkartotek @relation(fields: [produktId], references: [id])
  produktId   String

  @@index([sjaId])
  @@index([produktId])
}

model Risiko {
  id          String    @id @default(cuid())
  aktivitet   String
  fare        String
  konsekvens  String
  sannsynlighet Int
  alvorlighet Int
  risikoVerdi Int
  sjaId       String
  sja         SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  tiltak      Tiltak[]  // Legg til denne

  @@index([sjaId])
}

model Tiltak {
  id          String    @id @default(cuid())
  beskrivelse String
  ansvarlig   String
  frist       DateTime?
  status      String
  sjaId       String
  sja         SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  risikoId    String?   // Gjør denne valgfri med ?
  risiko      Risiko?   @relation(fields: [risikoId], references: [id], onDelete: Cascade) // Gjør denne valgfri med ?

  @@index([sjaId])
  @@index([risikoId])
}

model SJAGodkjenning {
  id            String    @id @default(cuid())
  sjaId         String
  sja           SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  godkjentAv    User      @relation(fields: [godkjentAvId], references: [id])
  godkjentAvId  String
  godkjentDato  DateTime  @default(now())
  rolle         String    // f.eks. "HMS-ansvarlig", "Prosjektleder", "Kunde"
  status        SJAStatus // Nytt felt
  kommentar     String?   @db.Text
  
  @@index([sjaId])
  @@index([godkjentAvId])
}

model SJARevisjon {
  id          String    @id @default(cuid())
  sjaId       String
  sja         SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  endretAv    User      @relation(fields: [endretAvId], references: [id])
  endretAvId  String
  endretDato  DateTime  @default(now())
  endringer   String    @db.Text // JSON-struktur med endringer
  
  @@index([sjaId])
  @@index([endretAvId])
}

model SJABilde {
  id          String    @id @default(cuid())
  sjaId       String
  sja         SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  url         String    @db.Text
  beskrivelse String?
  lastetOppAv User      @relation(fields: [lastetOppAvId], references: [id])
  lastetOppAvId String
  lastetOppDato DateTime @default(now())
  
  @@index([sjaId])
  @@index([lastetOppAvId])
}

model SJAKommentar {
  id          String    @id @default(cuid())
  sjaId       String
  sja         SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  forfatter   User      @relation(fields: [forfatterId], references: [id])
  forfatterId String
  innhold     String    @db.Text
  opprettetDato DateTime @default(now())
  
  @@index([sjaId])
  @@index([forfatterId])
}

model SJAMal {
  id            String    @id @default(cuid())
  navn          String
  beskrivelse   String?   @db.Text
  
  // Grunnleggende informasjon
  tittel        String
  arbeidssted   String
  
  // Deltakere og ansvarlige
  deltakere     String    @db.Text
  ansvarlig     String
  
  // Risikovurdering
  arbeidsoppgaver String  @db.Text
  risikoer      SJAMalRisiko[]
  tiltak        SJAMalTiltak[]
  
  // ISO 9001: Sporbarhet
  opprettetAv   User     @relation(fields: [opprettetAvId], references: [id])
  opprettetAvId String
  opprettetDato DateTime @default(now())
  
  // ISO 27001: Tilgangskontroll
  company       Company  @relation(fields: [companyId], references: [id])
  companyId     String

  @@index([companyId])
  @@index([opprettetAvId])
}

model SJAMalRisiko {
  id            String    @id @default(cuid())
  aktivitet     String
  fare          String
  konsekvens    String
  sannsynlighet Int
  alvorlighet   Int
  risikoVerdi   Int
  tiltak        String    @db.Text
  
  mal           SJAMal    @relation(fields: [malId], references: [id], onDelete: Cascade)
  malId         String

  @@index([malId])
}

model SJAMalTiltak {
  id            String    @id @default(cuid())
  beskrivelse   String    @db.Text
  ansvarlig     String
  frist         DateTime?
  
  mal           SJAMal    @relation(fields: [malId], references: [id], onDelete: Cascade)
  malId         String

  @@index([malId])
}


model SJAVedlegg {
  id            String    @id @default(cuid())
  navn          String
  url           String    @db.Text
  type          String    // f.eks. "sikkerhetsdatablad", "prosedyre", etc.
  
  sja           SJA       @relation(fields: [sjaId], references: [id], onDelete: Cascade)
  sjaId         String
  
  lastetOppAv   User      @relation(fields: [lastetOppAvId], references: [id])
  lastetOppAvId String
  lastetOppDato DateTime  @default(now())

  @@index([sjaId])
  @@index([lastetOppAvId])
}

model SJAKundeGodkjenning {
  id            String    @id @default(cuid())
  sja           SJA       @relation(fields: [sjaId], references: [id])
  sjaId         String    @unique
  
  kundeNavn     String
  kundeEpost    String
  godkjentDato  DateTime?
  avvistDato    DateTime?
  kommentar     String?   @db.Text
  
  // For sporbarhet
  opprettetDato DateTime  @default(now())
  oppdatertDato DateTime  @updatedAt

  @@index([sjaId])
}

// Ny modell for HMS-endringer
model HMSChange {
  id            String    @id @default(cuid())
  title         String
  description   String    @db.Text
  changeType    String    // f.eks. "POLICY", "PROCEDURE", "TRAINING"
  status        String    // f.eks. "PLANNED", "IN_PROGRESS", "COMPLETED"
  priority      Priority  // Legger til prioritet
  dueDate       DateTime? // Legger til frist
  implementedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Eksisterende relasjoner beholdes
  section       HMSSection? @relation(fields: [sectionId], references: [id])
  sectionId     String?
  
  // Beholder eksisterende koblinger
  deviations    DeviationHMSChange[]
  riskAssessments RiskAssessmentHMSChange[]
  measures     Measure[]
  
  // Metadata beholdes
  createdBy     String
  assignedTo    String?    // Legger til ansvarlig person
  companyId     String
  company       Company    @relation(fields: [companyId], references: [id])
  hazards       HazardHMSChange[]

  // Legger til godkjenning
  approvedBy    String?
  approvedAt    DateTime?

  @@index([companyId])
  @@index([sectionId])
  @@index([status])
}

// Koblingstabeller
model DeviationHMSChange {
  id          String     @id @default(cuid())
  deviation   Deviation  @relation(fields: [deviationId], references: [id])
  deviationId String
  hmsChange   HMSChange  @relation(fields: [hmsChangeId], references: [id])
  hmsChangeId String
  createdAt   DateTime   @default(now())

  @@unique([deviationId, hmsChangeId])
  @@index([deviationId])
  @@index([hmsChangeId])
}

model RiskAssessmentHMSChange {
  id               String         @id @default(cuid())
  riskAssessment   RiskAssessment @relation(fields: [riskAssessmentId], references: [id])
  riskAssessmentId String
  hmsChange        HMSChange      @relation(fields: [hmsChangeId], references: [id])
  hmsChangeId      String
  createdAt        DateTime       @default(now())

  @@unique([riskAssessmentId, hmsChangeId])
  @@index([riskAssessmentId])
  @@index([hmsChangeId])
}

// Ny koblingstabell mellom Hazard og HMSChange
model HazardHMSChange {
  id          String    @id @default(cuid())
  hazard      Hazard    @relation(fields: [hazardId], references: [id])
  hazardId    String
  hmsChange   HMSChange @relation(fields: [hmsChangeId], references: [id])
  hmsChangeId String
  createdAt   DateTime  @default(now())

  @@unique([hazardId, hmsChangeId])
  @@index([hazardId])
  @@index([hmsChangeId])
}

enum PaymentStatus {
  PAID
  PENDING
  OVERDUE
  CANCELLED
}


// HMS Rådgivning-modeller
model HMSConsultation {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  type        String    // MEETING, PHONE, EMAIL, etc.
  status      Status    @default(SCHEDULED)
  scheduledAt DateTime
  completedAt DateTime?
  summary     String?   @db.Text
  
  // Metadata
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String    // Bruker-ID
  consultantId String   // Bruker-ID for HMS-rådgiver
  
  // Relasjoner
  module      Module    @relation(fields: [moduleId], references: [id])
  moduleId    String
  actions     HMSConsultationAction[]
  
  @@index([moduleId])
}

model HMSConsultationAction {
  id          String    @id @default(cuid())
  description String    @db.Text
  status      Status    @default(OPEN)
  dueDate     DateTime?
  completedAt DateTime?
  
  // Metadata
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relasjoner
  consultation HMSConsultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  consultationId String
  
  @@index([consultationId])
}



model HMSTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  industry    String?  // For bransjespesifikke maler
  isDefault   Boolean  @default(false)
  sections    HMSTemplateSection[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model HMSTemplateSection {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  order         Int
  version       Int      @default(1)
  lastEditedBy  String
  lastEditedAt  DateTime @default(now())
  templateId    String
  template      HMSTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  parentId      String?
  parent        HMSTemplateSection? @relation("SubSections", fields: [parentId], references: [id])
  subsections   HMSTemplateSection[] @relation("SubSections")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([templateId])
  @@index([parentId])
  @@index([lastEditedAt])
}

model Training {
  id           String    @id @default(cuid())
  name         String
  description  String?
  date         DateTime
  companyId    String
  company      Company   @relation(fields: [companyId], references: [id])
  participants User[]    @relation("TrainingParticipants")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([companyId])
}

model HMSGoal {
  id          String    @id @default(cuid())
  description String
  year        Int
  status      GoalStatus @default(IN_PROGRESS)
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([companyId])
  @@index([year])
}

enum GoalStatus {
  IN_PROGRESS
  ACHIEVED
  CANCELLED
}

model AuditLog {
  id          String    @id @default(cuid())
  action      String    // f.eks. "CLOSE_MEASURE"
  entityType  String    // f.eks. "DEVIATION_MEASURE"
  entityId    String
  userId      String
  companyId   String
  details     Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([entityType, entityId])
  @@index([userId])
  @@index([companyId])
}

model RiskAssessmentMeasure {
  id                String         @id @default(cuid())
  description       String
  type             String         // f.eks. "ELIMINATION", "SUBSTITUTION", etc.
  status           String         @default("OPEN")
  priority         String
  dueDate          DateTime?
  completedAt      DateTime?
  assignedTo       String?
  createdBy        String
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  // Relasjoner
  riskAssessment   RiskAssessment @relation(fields: [riskAssessmentId], references: [id])
  riskAssessmentId String
  hazard          Hazard?        @relation(fields: [hazardId], references: [id])
  hazardId        String?

  @@index([riskAssessmentId])
  @@index([hazardId])
}

model NotificationSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  emailDigestFrequency  String   @default("INSTANT") // INSTANT, DAILY, WEEKLY, NONE
  
  // Spesifikke innstillinger for ulike varslingstyper
  deviationCreated     Boolean  @default(true)
  deviationAssigned    Boolean  @default(true)
  sjaCreated           Boolean  @default(true)
  sjaAssigned          Boolean  @default(true)
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([userId])
}

model UserSettings {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id])
  emailNotifications Boolean  @default(true)
  pushNotifications  Boolean  @default(true)
  dailyDigest        Boolean  @default(false)
  weeklyDigest       Boolean  @default(true)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  theme              String    @default("system") // "light", "dark", "system"

  @@map("user_settings")
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Booking {
  id          String      @id @default(cuid())
  date        DateTime
  time        String
  status      BookingStatus @default(PENDING)
  meetingType MeetingType
  name        String
  email       String
  company     String
  phone       String
  participants String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([date, time])
  @@index([status])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum MeetingType {
  online
  physical
}

// Vernerunde-modeller
model SafetyRound {
  id            String            @id @default(cuid())
  title         String
  description   String?
  status        SafetyRoundStatus @default(DRAFT)
  scheduledDate DateTime?
  dueDate       DateTime?
  completedAt   DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  moduleId      String
  createdBy     String
  assignedTo    String?
  approvedAt    DateTime?
  approvedBy    String?
  companyId     String
  templateId    String?

  // Relasjoner
  company       Company     @relation(fields: [companyId], references: [id])
  module        Module      @relation(fields: [moduleId], references: [id])
  creator       User        @relation("CreatedSafetyRounds", fields: [createdBy], references: [id])
  assignedUser  User?       @relation("AssignedSafetyRounds", fields: [assignedTo], references: [id])
  template      SafetyRoundTemplate? @relation(fields: [templateId], references: [id])
  
  // Innhold
  findings      SafetyRoundFinding[]
  checklistItems SafetyRoundChecklistItem[]
  approvals     SafetyRoundApproval[]
  report        SafetyRoundReport?
  participants  SafetyRoundParticipant[]
  images        SafetyRoundImage[]

  @@index([companyId])
  @@index([moduleId])
  @@index([createdBy])
  @@index([assignedTo])
  @@index([templateId])
}

model SafetyRoundParticipant {
  id            String            @id @default(cuid())
  safetyRoundId String
  userId        String
  role          ParticipantRole   @default(PARTICIPANT)
  joinedAt      DateTime          @default(now())
  
  safetyRound   SafetyRound       @relation(fields: [safetyRoundId], references: [id], onDelete: Cascade)
  user          User              @relation(fields: [userId], references: [id])

  @@unique([safetyRoundId, userId])
  @@index([safetyRoundId])
  @@index([userId])
}

model SafetyRoundFinding {
  id             String          @id @default(cuid())
  description    String
  severity       FindingSeverity
  status         FindingStatus   @default(OPEN)
  statusComment  String?
  statusUpdatedAt DateTime?
  statusUpdatedBy String?
  location       String?
  dueDate        DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  safetyRound    SafetyRound     @relation(fields: [safetyRoundId], references: [id], onDelete: Cascade)
  safetyRoundId  String

  checklistItem  SafetyRoundChecklistItem @relation(fields: [checklistItemId], references: [id], onDelete: Cascade)
  checklistItemId String

  createdBy      String
  assignedTo     String?
  
  measures       SafetyRoundMeasure[]
  images         SafetyRoundImage[]
  Measure        Measure[]
  deviation      Deviation?      @relation(fields: [deviationId], references: [id])
  deviationId    String?        // Kobling til avviket som ble opprettet

  updatedByUser  User?           @relation("FindingStatusUpdatedBy", fields: [statusUpdatedBy], references: [id])

  @@index([safetyRoundId])
  @@index([checklistItemId])
  @@index([deviationId])
}

model SafetyRoundImage {
  id            String            @id @default(cuid())
  url           String
  caption       String?
  createdAt     DateTime          @default(now())
  
  // Kan tilhøre enten en vernerunde eller et funn
  safetyRoundId String?
  safetyRound   SafetyRound?      @relation(fields: [safetyRoundId], references: [id], onDelete: Cascade)
  findingId     String?
  finding       SafetyRoundFinding? @relation(fields: [findingId], references: [id], onDelete: Cascade)
  
  uploadedById  String
  uploadedBy    User              @relation(fields: [uploadedById], references: [id])

  checklistItem   SafetyRoundChecklistItem? @relation(fields: [checklistItemId], references: [id])
  checklistItemId String?

  @@index([safetyRoundId])
  @@index([findingId])
  @@index([uploadedById])
}

model SafetyRoundMeasure {
  id          String      @id @default(cuid())
  description String
  status      MeasureStatus
  priority    Priority
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  findingId   String
  finding     SafetyRoundFinding @relation(fields: [findingId], references: [id])
  createdBy   String
  completedBy String?
  assignedTo  String?
  estimatedCost Float?

  @@index([findingId])
}

// Ny modell for sjekkliste-elementer
model SafetyRoundChecklistItem {
  id            String      @id @default(cuid())
  category      String
  question      String      
  description   String?
  response      String?     // YES, NO, NA
  comment       String?
  order         Int
  isRequired    Boolean     @default(true)
  completedAt   DateTime?   
  completedBy   String?
  safetyRoundId String
  safetyRound   SafetyRound @relation(fields: [safetyRoundId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  findings      SafetyRoundFinding[]

  // Legg til images-relasjon
  images    SafetyRoundImage[]

  @@index([safetyRoundId])
}

model SafetyRoundApproval {
  id            String      @id @default(cuid())
  token         String      @unique
  status        ApprovalStatus @default(PENDING)
  safetyRound   SafetyRound @relation(fields: [safetyRoundId], references: [id])
  safetyRoundId String
  expiresAt     DateTime
  approvedAt    DateTime?
  approvedBy    String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([safetyRoundId])
}

model SafetyRoundReport {
  id            String      @id @default(cuid())
  safetyRoundId String      @unique
  safetyRound   SafetyRound @relation(fields: [safetyRoundId], references: [id])
  reportNumber  String      @unique
  generatedAt   DateTime    @default(now())
  generatedBy   String
  signedAt      DateTime?
  signedBy      String?
  status        ReportStatus @default(PENDING)
  pdfUrl        String?
  metadata      Json?

  @@index([safetyRoundId])
  @@index([reportNumber])
}

model SafetyRoundTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  industry    String?  // Bransje
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String   // Admin som opprettet malen
  version     Int      @default(1)
  
  // Relasjoner
  sections    SafetyRoundTemplateSection[]
  companies   Company[]
  safetyRounds SafetyRound[]
  
  @@index([industry])
  @@index([createdBy])
}

model SafetyRoundTemplateSection {
  id          String   @id @default(cuid())
  title       String   
  description String?
  order       Int
  templateId  String
  template    SafetyRoundTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  // Relasjoner
  checkpoints SafetyRoundCheckpoint[]

  @@index([templateId])
}

model SafetyRoundCheckpoint {
  id          String   @id @default(cuid())
  question    String
  description String?
  type        CheckpointType  // Enum for spørsmålstype
  isRequired  Boolean  @default(true)
  order       Int
  options     Json?    // For multiple choice spørsmål
  sectionId   String
  section     SafetyRoundTemplateSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  @@index([sectionId])
}

enum CheckpointType {
  YES_NO
  MULTIPLE_CHOICE
  TEXT
  NUMBER
  PHOTO
}

enum SafetyRoundStatus {
  DRAFT
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ParticipantRole {
  LEADER
  PARTICIPANT
  OBSERVER
}

enum FindingSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum FindingStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum MeasureStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
}


enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ReportStatus {
  PENDING
  SIGNED
  REJECTED
}

// Først legger vi til en modell for utstyr/objekter
model Equipment {
  id          String      @id @default(cuid())
  companyId   String
  name        String
  type        String      // Type utstyr (f.eks. MACHINE, TOOL, VEHICLE)
  category    String      // Kategori (f.eks. PRODUCTION, SAFETY, TRANSPORT)
  serialNumber String?    
  manufacturer String?
  model       String?
  location    String?
  status      String      // ACTIVE, INACTIVE, MAINTENANCE, DISPOSED
  lastInspection DateTime?
  nextInspection DateTime?
  purchaseDate DateTime?
  deviations  Deviation[] // Kobling til avvik
  documents   EquipmentDocument[]
  inspections EquipmentInspection[]
  company     Company     @relation(fields: [companyId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Legg til riskAssessments-relasjon
  riskAssessments RiskAssessment[]

  @@index([companyId])
}

// Dokumentasjon tilknyttet utstyr
model EquipmentDocument {
  id          String    @id @default(cuid())
  equipmentId String
  type        String    // MANUAL, CERTIFICATE, INSPECTION_REPORT, etc.
  title       String
  url         String
  equipment   Equipment @relation(fields: [equipmentId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([equipmentId])
}

// Inspeksjoner av utstyr
model EquipmentInspection {
  id             String    @id @default(cuid())
  type           String    // ROUTINE, MAINTENANCE, CERTIFICATION
  status         String    // PASSED, FAILED, NEEDS_ATTENTION
  findings       String?
  nextInspection DateTime?
  inspector      User      @relation("Inspections", fields: [inspectorId], references: [id])
  inspectorId    String
  comments       String?
  equipment      Equipment @relation(fields: [equipmentId], references: [id])
  equipmentId    String
  createdAt      DateTime  @default(now())
  completedAt    DateTime?
  company        Company   @relation(fields: [companyId], references: [id])
  companyId      String

  @@index([equipmentId])
  @@index([inspectorId])
  @@index([companyId])
}

model DeviationStatusHistory {
  id        String   @id @default(cuid())
  status    String
  comment   String?
  updatedBy String
  updatedAt DateTime @default(now())
  deviation Deviation @relation(fields: [deviationId], references: [id])
  deviationId String

  @@index([deviationId])
}

