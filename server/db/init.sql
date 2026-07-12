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
  -- Loan terms used to derive the estimated monthly housing payment (principal & interest).
  interest_rate DECIMAL(5,3) NOT NULL DEFAULT 6.500,
  loan_term_months SMALLINT UNSIGNED NOT NULL DEFAULT 360,
  monthly_housing_payment DECIMAL(12,2),
  -- Snapshot of the calculated metrics and recommendation at decision time.
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

-- Demo seed data spanning each underwriting outcome, so the dashboard has
-- something to show immediately. Metrics below were computed by hand using
-- the same formulas as server/src/utils/mortgageMath.ts (6.5% / 360mo).

INSERT INTO applicants (first_name, last_name, email, phone) VALUES
  ('Sarah', 'Chen', 'sarah.chen@example.com', '555-0101'),
  ('Marcus', 'Johnson', 'marcus.johnson@example.com', '555-0102'),
  ('Denise', 'Alvarez', 'denise.alvarez@example.com', '555-0103'),
  ('Thomas', 'Reilly', 'thomas.reilly@example.com', '555-0104'),
  ('Angela', 'Price', 'angela.price@example.com', '555-0105');

INSERT INTO loan_applications
  (applicant_id, loan_type, loan_amount, property_value, annual_income, monthly_debts,
   credit_score, employment_status, interest_rate, loan_term_months, monthly_housing_payment,
   dti_ratio, ltv_ratio, underwriting_status, underwriting_notes)
VALUES
  (1, 'conventional', 320000, 400000, 145000, 400, 760, 'employed', 6.500, 360, 2022.60,
   20.05, 80.00, 'approved', 'Strong credit profile with conservative debt-to-income and loan-to-value ratios.'),
  (2, 'fha', 285000, 317000, 96000, 650, 700, 'self_employed', 6.500, 360, 1801.40,
   30.64, 89.91, 'approved', 'Meets standard conventional underwriting guidelines.'),
  (3, 'conventional', 245000, 258000, 68000, 900, 640, 'employed', 6.500, 360, 1548.57,
   43.20, 94.96, 'conditional', 'Meets minimum guidelines; recommend conditional approval pending documentation review.'),
  (4, 'va', 210000, 220000, 72000, 1200, 615, 'employed', 6.500, 360, 1327.35,
   42.12, 95.45, 'refer', 'Does not clearly meet automated guidelines; refer to an underwriter for manual review.'),
  (5, 'conventional', 180000, 182000, 54000, 1500, 590, 'employed', 6.500, 360, 1137.73,
   58.62, 98.90, 'declined', 'Debt-to-income ratio exceeds the maximum allowable threshold of 50%.');
