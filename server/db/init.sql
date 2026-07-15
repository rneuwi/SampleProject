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
  ('Sarah', 'Chen', 'sarah.chen@example.com', '(212) 555-0101'),
  ('Marcus', 'Johnson', 'marcus.johnson@example.com', '(415) 555-0102'),
  ('Denise', 'Alvarez', 'denise.alvarez@example.com', '(312) 555-0103'),
  ('Thomas', 'Reilly', 'thomas.reilly@example.com', '(617) 555-0104'),
  ('Angela', 'Price', 'angela.price@example.com', '(480) 555-0105'),
  ('Victor', 'Alderman', 'victor.alderman@example.com', '(503) 555-0106'),
  ('Jordan', 'Blake', 'jordan.blake@example.com', '(206) 555-0107'),
  ('Priya', 'Natarajan', 'priya.natarajan@example.com', '(720) 555-0108'),
  ('Miguel', 'Torres', 'miguel.torres@example.com', '(646) 555-0109'),
  ('Emily', 'Foster', 'emily.foster@example.com', '(901) 555-0110'),
  ('Grace', 'Kim', 'grace.kim@example.com', '(773) 555-0111'),
  ('Ryan', 'OConnell', 'ryan.oconnell@example.com', '(571) 555-0112'),
  ('Natalie', 'Brooks', 'natalie.brooks@example.com', '(858) 555-0113'),
  ('Sofia', 'Ramirez', 'sofia.ramirez@example.com', '(305) 555-0115'),
  ('Benjamin', 'Walsh', 'benjamin.walsh@example.com', '(216) 555-0116'),
  ('Chloe', 'Nguyen', 'chloe.nguyen@example.com', '(614) 555-0117');

-- 16 loan applications total (2 full pages at the default page size of 10),
-- spanning every underwriting outcome and loan type.
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
   58.62, 98.90, 'declined', 'Debt-to-income ratio exceeds the maximum allowable threshold of 50%.'),
  (6, 'fha', 333333, 350000, 400000, 1000, 823, 'employed', 5.000, 360, 1789.40,
   8.37, 95.24, 'refer', 'Does not clearly meet automated guidelines; refer to an underwriter for manual review.'),
  (7, 'conventional', 260000, 400000, 160000, 500, 780, 'employed', 6.500, 360, 1643.38,
   16.08, 65.00, 'approved', 'Strong credit profile with conservative debt-to-income and loan-to-value ratios.'),
  (8, 'fha', 300000, 316000, 92000, 700, 690, 'employed', 6.500, 360, 1896.20,
   33.86, 94.94, 'conditional', 'Meets minimum guidelines; recommend conditional approval pending documentation review.'),
  (9, 'va', 218000, 227000, 78000, 1000, 650, 'self_employed', 6.500, 360, 1377.91,
   36.58, 96.04, 'refer', 'Does not clearly meet automated guidelines; refer to an underwriter for manual review.'),
  (10, 'usda', 180000, 300000, 72000, 300, 760, 'employed', 6.500, 360, 1137.72,
   23.96, 60.00, 'approved', 'Strong credit profile with conservative debt-to-income and loan-to-value ratios.'),
  (11, 'conventional', 400000, 410000, 130000, 1800, 600, 'employed', 6.500, 360, 2528.27,
   39.95, 97.56, 'declined', 'Loan-to-value ratio exceeds the maximum allowable threshold of 97%.'),
  (12, 'fha', 250000, 264000, 95000, 600, 700, 'employed', 6.500, 360, 1580.17,
   27.54, 94.70, 'conditional', 'Meets minimum guidelines; recommend conditional approval pending documentation review.'),
  (13, 'conventional', 150000, 300000, 60000, 2000, 580, 'unemployed', 6.500, 360, 948.10,
   58.96, 50.00, 'declined', 'Applicant reports no current source of employment income.'),
  (14, 'conventional', 200000, 340000, 110000, 400, 760, 'employed', 6.500, 360, 1264.14,
   18.15, 58.82, 'approved', 'Strong credit profile with conservative debt-to-income and loan-to-value ratios.'),
  (15, 'fha', 175000, 250000, 60000, 900, 660, 'retired', 6.500, 360, 1106.12,
   40.12, 70.00, 'conditional', 'Meets minimum guidelines; recommend conditional approval pending documentation review.'),
  (16, 'usda', 230000, 245000, 85000, 1100, 630, 'employed', 6.500, 360, 1453.76,
   36.05, 93.88, 'conditional', 'Meets minimum guidelines; recommend conditional approval pending documentation review.');
