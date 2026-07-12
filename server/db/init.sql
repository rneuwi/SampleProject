-- Executed automatically by the MySQL container on first boot
-- (mounted to /docker-entrypoint-initdb.d/init.sql)

CREATE TABLE IF NOT EXISTS applicants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id INT NOT NULL,
  loan_type ENUM('conventional', 'fha', 'va', 'usda') NOT NULL DEFAULT 'conventional',
  loan_amount DECIMAL(12,2) NOT NULL,
  property_value DECIMAL(12,2) NOT NULL,
  annual_income DECIMAL(12,2) NOT NULL,
  monthly_debts DECIMAL(12,2) NOT NULL,
  credit_score SMALLINT NOT NULL,
  employment_status ENUM('employed', 'self_employed', 'unemployed', 'retired') NOT NULL,
  dti_ratio DECIMAL(5,2),
  ltv_ratio DECIMAL(5,2),
  underwriting_status ENUM('approved', 'conditional', 'refer', 'declined'),
  underwriting_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_loan_applicant FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
  INDEX idx_underwriting_status (underwriting_status),
  INDEX idx_applicant_id (applicant_id)
) ENGINE=InnoDB;
