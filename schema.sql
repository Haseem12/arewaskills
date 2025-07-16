-- This schema is designed for a MySQL database.

--
-- Table structure for table `registrations`
--
CREATE TABLE `registrations` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) DEFAULT NULL,
  `company_organization` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `years_of_experience` INT NOT NULL,
  `what_do_you_hope_to_learn_` TEXT NOT NULL,
  `status` ENUM('new', 'payment_pending', 'awaiting_confirmation', 'paid') NOT NULL DEFAULT 'new',
  `paymentMethod` ENUM('bank_transfer', 'bank_branch') DEFAULT NULL,
  `receiptNumber` VARCHAR(255) DEFAULT NULL,
  `submittedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` VARCHAR(50) NOT NULL DEFAULT 'registration'
);

--
-- Table structure for table `showcases`
--
CREATE TABLE `showcases` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `projectName` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) NOT NULL,
  `projectUrl` VARCHAR(255) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `technologies` VARCHAR(255) NOT NULL,
  `presenterName` VARCHAR(255) NOT NULL,
  `presenterEmail` VARCHAR(255) NOT NULL,
  `status` ENUM('new', 'payment_pending', 'awaiting_confirmation', 'paid') NOT NULL DEFAULT 'new',
  `paymentMethod` ENUM('bank_transfer', 'bank_branch') DEFAULT NULL,
  `receiptNumber` VARCHAR(255) DEFAULT NULL,
  `submittedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` VARCHAR(50) NOT NULL DEFAULT 'showcase'
);

-- It's recommended to add indexes for columns that are frequently searched, like `email`.
CREATE INDEX `idx_registrations_email` ON `registrations` (`email`);
CREATE INDEX `idx_showcases_email` ON `showcases` (`presenterEmail`);
