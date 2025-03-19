-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SUPPORT', 'COMPANY_ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `companyId` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `address` JSON NULL,
    `certifications` JSON NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `orgNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `organizationType` VARCHAR(191) NOT NULL,
    `organizationCode` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationDate` DATETIME(3) NULL,
    `lastBrregUpdate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `paymentStatus` ENUM('PAID', 'PENDING', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `lastPaymentDate` DATETIME(3) NULL,
    `subscriptionPlan` VARCHAR(191) NOT NULL DEFAULT 'STANDARD',
    `employeeCount` INTEGER NOT NULL DEFAULT 1,
    `storageLimit` INTEGER NOT NULL DEFAULT 1,
    `includeVernerunde` BOOLEAN NOT NULL DEFAULT false,
    `vernerundeDate` DATETIME(3) NULL,

    UNIQUE INDEX `Company_orgNumber_key`(`orgNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NULL,
    `streetNo` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Norge',
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Address_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Module` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Module_companyId_idx`(`companyId`),
    UNIQUE INDEX `Module_companyId_key_key`(`companyId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSHandbook` (
    `id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `companyId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `publishedBy` VARCHAR(191) NULL,

    INDEX `HMSHandbook_companyId_idx`(`companyId`),
    INDEX `HMSHandbook_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSRelease` (
    `id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `handbookId` VARCHAR(191) NOT NULL,
    `changes` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `approvedBy` VARCHAR(191) NOT NULL,
    `approvedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `content` JSON NOT NULL,
    `changelog` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HMSRelease_handbookId_version_key`(`handbookId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `order` INTEGER NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `handbookId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HMSSection_handbookId_idx`(`handbookId`),
    INDEX `HMSSection_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskAssessment` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `department` VARCHAR(191) NULL,
    `activity` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'AAPEN', 'PAAGAAR', 'LUKKET') NOT NULL DEFAULT 'DRAFT',
    `dueDate` DATETIME(3) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `equipmentId` VARCHAR(191) NULL,

    INDEX `RiskAssessment_companyId_idx`(`companyId`),
    INDEX `RiskAssessment_equipmentId_idx`(`equipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hazard` (
    `id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `consequence` TEXT NOT NULL,
    `probability` INTEGER NOT NULL,
    `severity` INTEGER NOT NULL,
    `riskLevel` INTEGER NOT NULL,
    `existingMeasures` TEXT NULL,
    `riskAssessmentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Hazard_riskAssessmentId_idx`(`riskAssessmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measure` (
    `id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('ELIMINATION', 'SUBSTITUTION', 'ENGINEERING', 'ADMINISTRATIVE', 'PPE') NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'AAPEN', 'PAAGAAR', 'LUKKET') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `hazardId` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hmsChangeId` VARCHAR(191) NULL,

    INDEX `Measure_hazardId_idx`(`hazardId`),
    INDEX `Measure_hmsChangeId_idx`(`hmsChangeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deviation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('NEAR_MISS', 'INCIDENT', 'ACCIDENT', 'IMPROVEMENT', 'OBSERVATION') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'AAPEN', 'PAAGAAR', 'LUKKET') NOT NULL DEFAULT 'OPEN',
    `dueDate` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `reportedBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `closedAt` DATETIME(3) NULL,
    `closedBy` VARCHAR(191) NULL,
    `closeComment` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,
    `sourceId` VARCHAR(191) NULL,
    `equipmentId` VARCHAR(191) NULL,
    `objectType` VARCHAR(191) NULL,
    `objectId` VARCHAR(191) NULL,
    `partAffected` VARCHAR(191) NULL,
    `maintenanceRequired` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Deviation_companyId_idx`(`companyId`),
    INDEX `Deviation_status_idx`(`status`),
    INDEX `Deviation_source_sourceId_idx`(`source`, `sourceId`),
    INDEX `Deviation_equipmentId_idx`(`equipmentId`),
    INDEX `Deviation_reportedBy_idx`(`reportedBy`),
    INDEX `Deviation_assignedTo_idx`(`assignedTo`),
    INDEX `Deviation_createdAt_idx`(`createdAt`),
    INDEX `Deviation_updatedAt_idx`(`updatedAt`),
    INDEX `Deviation_type_idx`(`type`),
    INDEX `Deviation_severity_idx`(`severity`),
    INDEX `Deviation_companyId_status_idx`(`companyId`, `status`),
    INDEX `Deviation_companyId_reportedBy_idx`(`companyId`, `reportedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviationMeasure` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `priority` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `deviationId` VARCHAR(191) NOT NULL,
    `closedAt` DATETIME(3) NULL,
    `closedBy` VARCHAR(191) NULL,
    `closeComment` VARCHAR(191) NULL,
    `closureVerifiedBy` VARCHAR(191) NULL,
    `closureVerifiedAt` DATETIME(3) NULL,

    INDEX `DeviationMeasure_deviationId_idx`(`deviationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviationImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `deviationId` VARCHAR(191) NOT NULL,
    `uploadedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DeviationImage_deviationId_idx`(`deviationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailQueue` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmailQueue_status_idx`(`status`),
    INDEX `EmailQueue_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `Document_userId_idx`(`userId`),
    INDEX `Document_companyId_idx`(`companyId`),
    INDEX `Document_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `Category_companyId_idx`(`companyId`),
    UNIQUE INDEX `Category_name_companyId_key`(`name`, `companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentVersion` (
    `id` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `documentId` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,

    INDEX `DocumentVersion_documentId_idx`(`documentId`),
    INDEX `DocumentVersion_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PPESymbolMapping` (
    `id` VARCHAR(191) NOT NULL,
    `symbol` ENUM('M001_GENERAL_MANDATORY', 'M002_READ_INSTRUCTIONS', 'M003_WEAR_EAR_PROTECTION', 'M004_WEAR_EYE_PROTECTION', 'M005_CONNECT_EARTH_TERMINAL', 'M006_DISCONNECT_MAINS', 'M007_WEAR_OPAQUE_EYE_PROTECTION', 'M008_WEAR_FOOT_PROTECTION', 'M009_WEAR_PROTECTIVE_GLOVES', 'M010_WEAR_PROTECTIVE_CLOTHING', 'M011_WASH_HANDS', 'M012_USE_HANDRAIL', 'M013_WEAR_FACE_SHIELD', 'M014_WEAR_HEAD_PROTECTION', 'M015_WEAR_HIGH_VISIBILITY', 'M016_WEAR_MASK', 'M017_WEAR_RESPIRATORY_PROTECTION', 'M018_WEAR_SAFETY_HARNESS', 'M019_WEAR_WELDING_MASK', 'M020_WEAR_SAFETY_BELTS', 'M021_DISCONNECT_BEFORE_MAINTENANCE', 'M022_USE_BARRIER_CREAM', 'M023_USE_FOOTBRIDGE', 'M024_USE_WALKWAY', 'M025_PROTECT_INFANTS_EYES', 'M026_USE_PROTECTIVE_APRON', 'M027_INSTALL_GUARD', 'M028_KEEP_LOCKED', 'M029_SOUND_HORN', 'M030_PLACE_TRASH_IN_BIN', 'M031_USE_TABLE_SAW_GUARD', 'M032_USE_ANTISTATIC_FOOTWEAR', 'M033_LOWER_SKI_RESTRAINT', 'M034_RAISE_SKI_RESTRAINT', 'M035_EXIT_TOWPATH', 'M036_KEEP_SKI_TIPS_UP', 'M037_SECURE_LIFEBOAT_HATCH', 'M038_START_LIFEBOAT_MOTOR', 'M039_LOWER_LIFEBOAT', 'M040_LOWER_LIFEBOAT_TO_WATER', 'M041_LOWER_RESCUE_BOAT', 'M042_RELEASE_LIFEBOAT_HOOKS', 'M043_START_WATER_SPRAY', 'M044_START_AIR_SUPPLY', 'M045_RELEASE_GRIPES', 'M046_SECURE_GAS_CYLINDERS', 'M047_USE_BREATHING_EQUIPMENT', 'M048_USE_GAS_DETECTOR', 'M049_USE_SPORTS_PROTECTION', 'M050_EXIT_SLED_LEFT', 'M051_EXIT_SLED_RIGHT', 'M052_KEEP_SLED_DISTANCE', 'M053_WEAR_LIFEJACKET', 'M054_SUPERVISE_CHILDREN', 'M055_KEEP_FROM_CHILDREN', 'M056_VENTILATE_BEFORE_ENTERING', 'M057_ENSURE_VENTILATION', 'M058_ENTRY_WITH_SUPERVISOR', 'M059_WEAR_LAB_COAT', 'M060_HOLD_TROLLEY_HANDLE', 'M061_DISINFECT_HANDS', 'M062_DISINFECT_SURFACE') NOT NULL,
    `stoffkartotekId` VARCHAR(191) NOT NULL,

    INDEX `PPESymbolMapping_stoffkartotekId_idx`(`stoffkartotekId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stoffkartotek` (
    `id` VARCHAR(191) NOT NULL,
    `produktnavn` VARCHAR(191) NOT NULL,
    `produsent` VARCHAR(191) NULL,
    `databladUrl` TEXT NULL,
    `beskrivelse` TEXT NULL,
    `bruksomrade` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `opprettetAvId` VARCHAR(191) NULL,

    INDEX `Stoffkartotek_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FareSymbolMapping` (
    `id` VARCHAR(191) NOT NULL,
    `symbol` ENUM('BRANNFARLIG', 'ETSENDE', 'GIFTIG', 'HELSEFARE', 'MILJØFARE', 'EKSPLOSJONSFARLIG', 'OKSIDERENDE', 'GASS_UNDER_TRYKK', 'AKUTT_GIFTIG') NOT NULL,
    `stoffkartotekId` VARCHAR(191) NOT NULL,

    INDEX `FareSymbolMapping_stoffkartotekId_idx`(`stoffkartotekId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJA` (
    `id` VARCHAR(191) NOT NULL,
    `tittel` VARCHAR(191) NOT NULL,
    `arbeidssted` VARCHAR(191) NOT NULL,
    `beskrivelse` TEXT NOT NULL,
    `deltakere` TEXT NOT NULL,
    `startDato` DATETIME(3) NOT NULL,
    `sluttDato` DATETIME(3) NULL,
    `status` ENUM('UTKAST', 'SENDT_TIL_GODKJENNING', 'GODKJENT', 'AVVIST', 'UTGATT') NOT NULL DEFAULT 'UTKAST',
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oppdatertDato` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `SJA_companyId_idx`(`companyId`),
    INDEX `SJA_opprettetAvId_idx`(`opprettetAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAProdukt` (
    `id` VARCHAR(191) NOT NULL,
    `mengde` VARCHAR(191) NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `produktId` VARCHAR(191) NOT NULL,

    INDEX `SJAProdukt_sjaId_idx`(`sjaId`),
    INDEX `SJAProdukt_produktId_idx`(`produktId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Risiko` (
    `id` VARCHAR(191) NOT NULL,
    `aktivitet` VARCHAR(191) NOT NULL,
    `fare` VARCHAR(191) NOT NULL,
    `konsekvens` VARCHAR(191) NOT NULL,
    `sannsynlighet` INTEGER NOT NULL,
    `alvorlighet` INTEGER NOT NULL,
    `risikoVerdi` INTEGER NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,

    INDEX `Risiko_sjaId_idx`(`sjaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tiltak` (
    `id` VARCHAR(191) NOT NULL,
    `beskrivelse` VARCHAR(191) NOT NULL,
    `ansvarlig` VARCHAR(191) NOT NULL,
    `frist` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `risikoId` VARCHAR(191) NULL,

    INDEX `Tiltak_sjaId_idx`(`sjaId`),
    INDEX `Tiltak_risikoId_idx`(`risikoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAGodkjenning` (
    `id` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `godkjentAvId` VARCHAR(191) NOT NULL,
    `godkjentDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rolle` VARCHAR(191) NOT NULL,
    `status` ENUM('UTKAST', 'SENDT_TIL_GODKJENNING', 'GODKJENT', 'AVVIST', 'UTGATT') NOT NULL,
    `kommentar` TEXT NULL,

    INDEX `SJAGodkjenning_sjaId_idx`(`sjaId`),
    INDEX `SJAGodkjenning_godkjentAvId_idx`(`godkjentAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJARevisjon` (
    `id` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `endretAvId` VARCHAR(191) NOT NULL,
    `endretDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endringer` TEXT NOT NULL,

    INDEX `SJARevisjon_sjaId_idx`(`sjaId`),
    INDEX `SJARevisjon_endretAvId_idx`(`endretAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJABilde` (
    `id` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `beskrivelse` VARCHAR(191) NULL,
    `lastetOppAvId` VARCHAR(191) NOT NULL,
    `lastetOppDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SJABilde_sjaId_idx`(`sjaId`),
    INDEX `SJABilde_lastetOppAvId_idx`(`lastetOppAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAKommentar` (
    `id` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `forfatterId` VARCHAR(191) NOT NULL,
    `innhold` TEXT NOT NULL,
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SJAKommentar_sjaId_idx`(`sjaId`),
    INDEX `SJAKommentar_forfatterId_idx`(`forfatterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAMal` (
    `id` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `beskrivelse` TEXT NULL,
    `tittel` VARCHAR(191) NOT NULL,
    `arbeidssted` VARCHAR(191) NOT NULL,
    `deltakere` TEXT NOT NULL,
    `ansvarlig` VARCHAR(191) NOT NULL,
    `arbeidsoppgaver` TEXT NOT NULL,
    `opprettetAvId` VARCHAR(191) NOT NULL,
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `SJAMal_companyId_idx`(`companyId`),
    INDEX `SJAMal_opprettetAvId_idx`(`opprettetAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAMalRisiko` (
    `id` VARCHAR(191) NOT NULL,
    `aktivitet` VARCHAR(191) NOT NULL,
    `fare` VARCHAR(191) NOT NULL,
    `konsekvens` VARCHAR(191) NOT NULL,
    `sannsynlighet` INTEGER NOT NULL,
    `alvorlighet` INTEGER NOT NULL,
    `risikoVerdi` INTEGER NOT NULL,
    `tiltak` TEXT NOT NULL,
    `malId` VARCHAR(191) NOT NULL,

    INDEX `SJAMalRisiko_malId_idx`(`malId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAMalTiltak` (
    `id` VARCHAR(191) NOT NULL,
    `beskrivelse` TEXT NOT NULL,
    `ansvarlig` VARCHAR(191) NOT NULL,
    `frist` DATETIME(3) NULL,
    `malId` VARCHAR(191) NOT NULL,

    INDEX `SJAMalTiltak_malId_idx`(`malId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAVedlegg` (
    `id` VARCHAR(191) NOT NULL,
    `navn` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `lastetOppAvId` VARCHAR(191) NOT NULL,
    `lastetOppDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SJAVedlegg_sjaId_idx`(`sjaId`),
    INDEX `SJAVedlegg_lastetOppAvId_idx`(`lastetOppAvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SJAKundeGodkjenning` (
    `id` VARCHAR(191) NOT NULL,
    `sjaId` VARCHAR(191) NOT NULL,
    `kundeNavn` VARCHAR(191) NOT NULL,
    `kundeEpost` VARCHAR(191) NOT NULL,
    `godkjentDato` DATETIME(3) NULL,
    `avvistDato` DATETIME(3) NULL,
    `kommentar` TEXT NULL,
    `opprettetDato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oppdatertDato` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SJAKundeGodkjenning_sjaId_key`(`sjaId`),
    INDEX `SJAKundeGodkjenning_sjaId_idx`(`sjaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSChange` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `implementedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sectionId` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,

    INDEX `HMSChange_companyId_idx`(`companyId`),
    INDEX `HMSChange_sectionId_idx`(`sectionId`),
    INDEX `HMSChange_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviationHMSChange` (
    `id` VARCHAR(191) NOT NULL,
    `deviationId` VARCHAR(191) NOT NULL,
    `hmsChangeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DeviationHMSChange_deviationId_idx`(`deviationId`),
    INDEX `DeviationHMSChange_hmsChangeId_idx`(`hmsChangeId`),
    UNIQUE INDEX `DeviationHMSChange_deviationId_hmsChangeId_key`(`deviationId`, `hmsChangeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskAssessmentHMSChange` (
    `id` VARCHAR(191) NOT NULL,
    `riskAssessmentId` VARCHAR(191) NOT NULL,
    `hmsChangeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RiskAssessmentHMSChange_riskAssessmentId_idx`(`riskAssessmentId`),
    INDEX `RiskAssessmentHMSChange_hmsChangeId_idx`(`hmsChangeId`),
    UNIQUE INDEX `RiskAssessmentHMSChange_riskAssessmentId_hmsChangeId_key`(`riskAssessmentId`, `hmsChangeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HazardHMSChange` (
    `id` VARCHAR(191) NOT NULL,
    `hazardId` VARCHAR(191) NOT NULL,
    `hmsChangeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HazardHMSChange_hazardId_idx`(`hazardId`),
    INDEX `HazardHMSChange_hmsChangeId_idx`(`hmsChangeId`),
    UNIQUE INDEX `HazardHMSChange_hazardId_hmsChangeId_key`(`hazardId`, `hmsChangeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSConsultation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'AAPEN', 'PAAGAAR', 'LUKKET') NOT NULL DEFAULT 'SCHEDULED',
    `scheduledAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `summary` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `consultantId` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,

    INDEX `HMSConsultation_moduleId_idx`(`moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSConsultationAction` (
    `id` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'AAPEN', 'PAAGAAR', 'LUKKET') NOT NULL DEFAULT 'OPEN',
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `consultationId` VARCHAR(191) NOT NULL,

    INDEX `HMSConsultationAction_consultationId_idx`(`consultationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSTemplateSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `order` INTEGER NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `lastEditedBy` VARCHAR(191) NOT NULL,
    `lastEditedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `templateId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HMSTemplateSection_templateId_idx`(`templateId`),
    INDEX `HMSTemplateSection_parentId_idx`(`parentId`),
    INDEX `HMSTemplateSection_lastEditedAt_idx`(`lastEditedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Training` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Training_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HMSGoal` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `status` ENUM('IN_PROGRESS', 'ACHIEVED', 'CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HMSGoal_companyId_idx`(`companyId`),
    INDEX `HMSGoal_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskAssessmentMeasure` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `priority` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `riskAssessmentId` VARCHAR(191) NOT NULL,
    `hazardId` VARCHAR(191) NULL,

    INDEX `RiskAssessmentMeasure_riskAssessmentId_idx`(`riskAssessmentId`),
    INDEX `RiskAssessmentMeasure_hazardId_idx`(`hazardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `emailDigestFrequency` VARCHAR(191) NOT NULL DEFAULT 'INSTANT',
    `deviationCreated` BOOLEAN NOT NULL DEFAULT true,
    `deviationAssigned` BOOLEAN NOT NULL DEFAULT true,
    `sjaCreated` BOOLEAN NOT NULL DEFAULT true,
    `sjaAssigned` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationSettings_userId_key`(`userId`),
    INDEX `NotificationSettings_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `dailyDigest` BOOLEAN NOT NULL DEFAULT false,
    `weeklyDigest` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `theme` VARCHAR(191) NOT NULL DEFAULT 'system',

    UNIQUE INDEX `user_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `meetingType` ENUM('online', 'physical') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `participants` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Booking_date_time_idx`(`date`, `time`),
    INDEX `Booking_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRound` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `scheduledDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,

    INDEX `SafetyRound_companyId_idx`(`companyId`),
    INDEX `SafetyRound_moduleId_idx`(`moduleId`),
    INDEX `SafetyRound_createdBy_idx`(`createdBy`),
    INDEX `SafetyRound_assignedTo_idx`(`assignedTo`),
    INDEX `SafetyRound_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `safetyRoundId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('LEADER', 'PARTICIPANT', 'OBSERVER') NOT NULL DEFAULT 'PARTICIPANT',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SafetyRoundParticipant_safetyRoundId_idx`(`safetyRoundId`),
    INDEX `SafetyRoundParticipant_userId_idx`(`userId`),
    UNIQUE INDEX `SafetyRoundParticipant_safetyRoundId_userId_key`(`safetyRoundId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundFinding` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `statusComment` VARCHAR(191) NULL,
    `statusUpdatedAt` DATETIME(3) NULL,
    `statusUpdatedBy` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `safetyRoundId` VARCHAR(191) NOT NULL,
    `checklistItemId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `deviationId` VARCHAR(191) NULL,

    INDEX `SafetyRoundFinding_safetyRoundId_idx`(`safetyRoundId`),
    INDEX `SafetyRoundFinding_checklistItemId_idx`(`checklistItemId`),
    INDEX `SafetyRoundFinding_deviationId_idx`(`deviationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `safetyRoundId` VARCHAR(191) NULL,
    `findingId` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `checklistItemId` VARCHAR(191) NULL,

    INDEX `SafetyRoundImage_safetyRoundId_idx`(`safetyRoundId`),
    INDEX `SafetyRoundImage_findingId_idx`(`findingId`),
    INDEX `SafetyRoundImage_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundMeasure` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `findingId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `completedBy` VARCHAR(191) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `estimatedCost` DOUBLE NULL,

    INDEX `SafetyRoundMeasure_findingId_idx`(`findingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundChecklistItem` (
    `id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `response` VARCHAR(191) NULL,
    `comment` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `completedAt` DATETIME(3) NULL,
    `completedBy` VARCHAR(191) NULL,
    `safetyRoundId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SafetyRoundChecklistItem_safetyRoundId_idx`(`safetyRoundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundApproval` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `safetyRoundId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SafetyRoundApproval_token_key`(`token`),
    INDEX `SafetyRoundApproval_safetyRoundId_idx`(`safetyRoundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundReport` (
    `id` VARCHAR(191) NOT NULL,
    `safetyRoundId` VARCHAR(191) NOT NULL,
    `reportNumber` VARCHAR(191) NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `generatedBy` VARCHAR(191) NOT NULL,
    `signedAt` DATETIME(3) NULL,
    `signedBy` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SIGNED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `pdfUrl` VARCHAR(191) NULL,
    `metadata` JSON NULL,

    UNIQUE INDEX `SafetyRoundReport_safetyRoundId_key`(`safetyRoundId`),
    UNIQUE INDEX `SafetyRoundReport_reportNumber_key`(`reportNumber`),
    INDEX `SafetyRoundReport_safetyRoundId_idx`(`safetyRoundId`),
    INDEX `SafetyRoundReport_reportNumber_idx`(`reportNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    INDEX `SafetyRoundTemplate_industry_idx`(`industry`),
    INDEX `SafetyRoundTemplate_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundTemplateSection` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,

    INDEX `SafetyRoundTemplateSection_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SafetyRoundCheckpoint` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('YES_NO', 'MULTIPLE_CHOICE', 'TEXT', 'NUMBER', 'PHOTO') NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL,
    `options` JSON NULL,
    `sectionId` VARCHAR(191) NOT NULL,

    INDEX `SafetyRoundCheckpoint_sectionId_idx`(`sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `lastInspection` DATETIME(3) NULL,
    `nextInspection` DATETIME(3) NULL,
    `purchaseDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Equipment_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentDocument` (
    `id` VARCHAR(191) NOT NULL,
    `equipmentId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EquipmentDocument_equipmentId_idx`(`equipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentInspection` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `findings` VARCHAR(191) NULL,
    `nextInspection` DATETIME(3) NULL,
    `inspectorId` VARCHAR(191) NOT NULL,
    `comments` VARCHAR(191) NULL,
    `equipmentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `EquipmentInspection_equipmentId_idx`(`equipmentId`),
    INDEX `EquipmentInspection_inspectorId_idx`(`inspectorId`),
    INDEX `EquipmentInspection_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviationStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deviationId` VARCHAR(191) NOT NULL,

    INDEX `DeviationStatusHistory_deviationId_idx`(`deviationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DaluxSync` (
    `id` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `sourceType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `error` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `lastSync` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `additionalData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DaluxSync_companyId_idx`(`companyId`),
    INDEX `DaluxSync_status_idx`(`status`),
    INDEX `DaluxSync_projectId_idx`(`projectId`),
    UNIQUE INDEX `DaluxSync_sourceId_sourceType_key`(`sourceId`, `sourceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CompanyToSafetyRoundTemplate` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CompanyToSafetyRoundTemplate_AB_unique`(`A`, `B`),
    INDEX `_CompanyToSafetyRoundTemplate_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_HMSSectionToRiskAssessment` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_HMSSectionToRiskAssessment_AB_unique`(`A`, `B`),
    INDEX `_HMSSectionToRiskAssessment_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MeasureToSafetyRoundFinding` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_MeasureToSafetyRoundFinding_AB_unique`(`A`, `B`),
    INDEX `_MeasureToSafetyRoundFinding_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TrainingParticipants` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_TrainingParticipants_AB_unique`(`A`, `B`),
    INDEX `_TrainingParticipants_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Module` ADD CONSTRAINT `Module_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSHandbook` ADD CONSTRAINT `HMSHandbook_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSHandbook` ADD CONSTRAINT `HMSHandbook_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSRelease` ADD CONSTRAINT `HMSRelease_handbookId_fkey` FOREIGN KEY (`handbookId`) REFERENCES `HMSHandbook`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSSection` ADD CONSTRAINT `HMSSection_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `HMSSection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSSection` ADD CONSTRAINT `HMSSection_handbookId_fkey` FOREIGN KEY (`handbookId`) REFERENCES `HMSHandbook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessment` ADD CONSTRAINT `RiskAssessment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessment` ADD CONSTRAINT `RiskAssessment_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hazard` ADD CONSTRAINT `Hazard_riskAssessmentId_fkey` FOREIGN KEY (`riskAssessmentId`) REFERENCES `RiskAssessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measure` ADD CONSTRAINT `Measure_hazardId_fkey` FOREIGN KEY (`hazardId`) REFERENCES `Hazard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measure` ADD CONSTRAINT `Measure_hmsChangeId_fkey` FOREIGN KEY (`hmsChangeId`) REFERENCES `HMSChange`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deviation` ADD CONSTRAINT `Deviation_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deviation` ADD CONSTRAINT `Deviation_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviationMeasure` ADD CONSTRAINT `DeviationMeasure_deviationId_fkey` FOREIGN KEY (`deviationId`) REFERENCES `Deviation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviationImage` ADD CONSTRAINT `DeviationImage_deviationId_fkey` FOREIGN KEY (`deviationId`) REFERENCES `Deviation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailQueue` ADD CONSTRAINT `EmailQueue_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentVersion` ADD CONSTRAINT `DocumentVersion_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentVersion` ADD CONSTRAINT `DocumentVersion_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PPESymbolMapping` ADD CONSTRAINT `PPESymbolMapping_stoffkartotekId_fkey` FOREIGN KEY (`stoffkartotekId`) REFERENCES `Stoffkartotek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stoffkartotek` ADD CONSTRAINT `Stoffkartotek_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stoffkartotek` ADD CONSTRAINT `Stoffkartotek_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FareSymbolMapping` ADD CONSTRAINT `FareSymbolMapping_stoffkartotekId_fkey` FOREIGN KEY (`stoffkartotekId`) REFERENCES `Stoffkartotek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJA` ADD CONSTRAINT `SJA_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJA` ADD CONSTRAINT `SJA_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAProdukt` ADD CONSTRAINT `SJAProdukt_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAProdukt` ADD CONSTRAINT `SJAProdukt_produktId_fkey` FOREIGN KEY (`produktId`) REFERENCES `Stoffkartotek`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Risiko` ADD CONSTRAINT `Risiko_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tiltak` ADD CONSTRAINT `Tiltak_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tiltak` ADD CONSTRAINT `Tiltak_risikoId_fkey` FOREIGN KEY (`risikoId`) REFERENCES `Risiko`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAGodkjenning` ADD CONSTRAINT `SJAGodkjenning_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAGodkjenning` ADD CONSTRAINT `SJAGodkjenning_godkjentAvId_fkey` FOREIGN KEY (`godkjentAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJARevisjon` ADD CONSTRAINT `SJARevisjon_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJARevisjon` ADD CONSTRAINT `SJARevisjon_endretAvId_fkey` FOREIGN KEY (`endretAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJABilde` ADD CONSTRAINT `SJABilde_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJABilde` ADD CONSTRAINT `SJABilde_lastetOppAvId_fkey` FOREIGN KEY (`lastetOppAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAKommentar` ADD CONSTRAINT `SJAKommentar_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAKommentar` ADD CONSTRAINT `SJAKommentar_forfatterId_fkey` FOREIGN KEY (`forfatterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMal` ADD CONSTRAINT `SJAMal_opprettetAvId_fkey` FOREIGN KEY (`opprettetAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMal` ADD CONSTRAINT `SJAMal_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMalRisiko` ADD CONSTRAINT `SJAMalRisiko_malId_fkey` FOREIGN KEY (`malId`) REFERENCES `SJAMal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAMalTiltak` ADD CONSTRAINT `SJAMalTiltak_malId_fkey` FOREIGN KEY (`malId`) REFERENCES `SJAMal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAVedlegg` ADD CONSTRAINT `SJAVedlegg_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAVedlegg` ADD CONSTRAINT `SJAVedlegg_lastetOppAvId_fkey` FOREIGN KEY (`lastetOppAvId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SJAKundeGodkjenning` ADD CONSTRAINT `SJAKundeGodkjenning_sjaId_fkey` FOREIGN KEY (`sjaId`) REFERENCES `SJA`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSChange` ADD CONSTRAINT `HMSChange_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `HMSSection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSChange` ADD CONSTRAINT `HMSChange_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviationHMSChange` ADD CONSTRAINT `DeviationHMSChange_deviationId_fkey` FOREIGN KEY (`deviationId`) REFERENCES `Deviation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviationHMSChange` ADD CONSTRAINT `DeviationHMSChange_hmsChangeId_fkey` FOREIGN KEY (`hmsChangeId`) REFERENCES `HMSChange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessmentHMSChange` ADD CONSTRAINT `RiskAssessmentHMSChange_riskAssessmentId_fkey` FOREIGN KEY (`riskAssessmentId`) REFERENCES `RiskAssessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessmentHMSChange` ADD CONSTRAINT `RiskAssessmentHMSChange_hmsChangeId_fkey` FOREIGN KEY (`hmsChangeId`) REFERENCES `HMSChange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HazardHMSChange` ADD CONSTRAINT `HazardHMSChange_hazardId_fkey` FOREIGN KEY (`hazardId`) REFERENCES `Hazard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HazardHMSChange` ADD CONSTRAINT `HazardHMSChange_hmsChangeId_fkey` FOREIGN KEY (`hmsChangeId`) REFERENCES `HMSChange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSConsultation` ADD CONSTRAINT `HMSConsultation_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSConsultationAction` ADD CONSTRAINT `HMSConsultationAction_consultationId_fkey` FOREIGN KEY (`consultationId`) REFERENCES `HMSConsultation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSTemplateSection` ADD CONSTRAINT `HMSTemplateSection_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `HMSTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSTemplateSection` ADD CONSTRAINT `HMSTemplateSection_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `HMSTemplateSection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Training` ADD CONSTRAINT `Training_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HMSGoal` ADD CONSTRAINT `HMSGoal_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessmentMeasure` ADD CONSTRAINT `RiskAssessmentMeasure_riskAssessmentId_fkey` FOREIGN KEY (`riskAssessmentId`) REFERENCES `RiskAssessment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RiskAssessmentMeasure` ADD CONSTRAINT `RiskAssessmentMeasure_hazardId_fkey` FOREIGN KEY (`hazardId`) REFERENCES `Hazard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationSettings` ADD CONSTRAINT `NotificationSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRound` ADD CONSTRAINT `SafetyRound_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRound` ADD CONSTRAINT `SafetyRound_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRound` ADD CONSTRAINT `SafetyRound_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRound` ADD CONSTRAINT `SafetyRound_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRound` ADD CONSTRAINT `SafetyRound_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `SafetyRoundTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundParticipant` ADD CONSTRAINT `SafetyRoundParticipant_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundParticipant` ADD CONSTRAINT `SafetyRoundParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundFinding` ADD CONSTRAINT `SafetyRoundFinding_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundFinding` ADD CONSTRAINT `SafetyRoundFinding_checklistItemId_fkey` FOREIGN KEY (`checklistItemId`) REFERENCES `SafetyRoundChecklistItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundFinding` ADD CONSTRAINT `SafetyRoundFinding_deviationId_fkey` FOREIGN KEY (`deviationId`) REFERENCES `Deviation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundFinding` ADD CONSTRAINT `SafetyRoundFinding_statusUpdatedBy_fkey` FOREIGN KEY (`statusUpdatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundImage` ADD CONSTRAINT `SafetyRoundImage_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundImage` ADD CONSTRAINT `SafetyRoundImage_findingId_fkey` FOREIGN KEY (`findingId`) REFERENCES `SafetyRoundFinding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundImage` ADD CONSTRAINT `SafetyRoundImage_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundImage` ADD CONSTRAINT `SafetyRoundImage_checklistItemId_fkey` FOREIGN KEY (`checklistItemId`) REFERENCES `SafetyRoundChecklistItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundMeasure` ADD CONSTRAINT `SafetyRoundMeasure_findingId_fkey` FOREIGN KEY (`findingId`) REFERENCES `SafetyRoundFinding`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundChecklistItem` ADD CONSTRAINT `SafetyRoundChecklistItem_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundApproval` ADD CONSTRAINT `SafetyRoundApproval_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundReport` ADD CONSTRAINT `SafetyRoundReport_safetyRoundId_fkey` FOREIGN KEY (`safetyRoundId`) REFERENCES `SafetyRound`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundTemplateSection` ADD CONSTRAINT `SafetyRoundTemplateSection_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `SafetyRoundTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SafetyRoundCheckpoint` ADD CONSTRAINT `SafetyRoundCheckpoint_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `SafetyRoundTemplateSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipment` ADD CONSTRAINT `Equipment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentDocument` ADD CONSTRAINT `EquipmentDocument_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentInspection` ADD CONSTRAINT `EquipmentInspection_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentInspection` ADD CONSTRAINT `EquipmentInspection_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentInspection` ADD CONSTRAINT `EquipmentInspection_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviationStatusHistory` ADD CONSTRAINT `DeviationStatusHistory_deviationId_fkey` FOREIGN KEY (`deviationId`) REFERENCES `Deviation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaluxSync` ADD CONSTRAINT `DaluxSync_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyToSafetyRoundTemplate` ADD CONSTRAINT `_CompanyToSafetyRoundTemplate_A_fkey` FOREIGN KEY (`A`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CompanyToSafetyRoundTemplate` ADD CONSTRAINT `_CompanyToSafetyRoundTemplate_B_fkey` FOREIGN KEY (`B`) REFERENCES `SafetyRoundTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HMSSectionToRiskAssessment` ADD CONSTRAINT `_HMSSectionToRiskAssessment_A_fkey` FOREIGN KEY (`A`) REFERENCES `HMSSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HMSSectionToRiskAssessment` ADD CONSTRAINT `_HMSSectionToRiskAssessment_B_fkey` FOREIGN KEY (`B`) REFERENCES `RiskAssessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MeasureToSafetyRoundFinding` ADD CONSTRAINT `_MeasureToSafetyRoundFinding_A_fkey` FOREIGN KEY (`A`) REFERENCES `Measure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MeasureToSafetyRoundFinding` ADD CONSTRAINT `_MeasureToSafetyRoundFinding_B_fkey` FOREIGN KEY (`B`) REFERENCES `SafetyRoundFinding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TrainingParticipants` ADD CONSTRAINT `_TrainingParticipants_A_fkey` FOREIGN KEY (`A`) REFERENCES `Training`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TrainingParticipants` ADD CONSTRAINT `_TrainingParticipants_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
