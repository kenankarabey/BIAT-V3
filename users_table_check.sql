-- Mevcut users tablosunun yapısını görüntüle
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Tabloyu alter etme örneği (gerekirse)
-- Eksik kolonları eklemek için

-- Telefon kolonu eklemek için örnek (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'telefon'
  ) THEN
    ALTER TABLE users ADD COLUMN telefon TEXT;
  END IF;
END $$;

-- Departman kolonu eklemek için (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'departman'
  ) THEN
    ALTER TABLE users ADD COLUMN departman TEXT;
  END IF;
END $$;

-- Konum kolonu eklemek için (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'konum'
  ) THEN
    ALTER TABLE users ADD COLUMN konum TEXT;
  END IF;
END $$;

-- Şifre kolonu eklemek için (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'sifre'
  ) THEN
    ALTER TABLE users ADD COLUMN sifre TEXT;
  END IF;
END $$;

-- Güncellenmiş tabloyu görüntüle
SELECT * FROM users LIMIT 5; 