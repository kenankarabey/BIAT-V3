-- Manuel kullanıcı yönetimi için users tablosu

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Otomatik UUID oluşturur
    email TEXT UNIQUE NOT NULL,
    ad_soyad TEXT NOT NULL,
    telefon TEXT,
    departman TEXT,
    konum TEXT,
    sifre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Güncelleme tarihini otomatik güncellemek için trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at();

-- Manuel kullanıcı ekleme örnekleri:

-- Örnek 1: UUID otomatik oluşturulacak şekilde
INSERT INTO users (
    email,
    ad_soyad,
    telefon,
    departman,
    konum,
    sifre
) VALUES (
    'kullanici@adalet.gov.tr',
    'Kenan Karabey',
    '+90 552 363 14 01',
    'Bilgi İşlem',
    'Malatya Adliyesi',
    'sifre123'
);

-- Örnek 2: UUID elle belirterek
INSERT INTO users (
    id,
    email,
    ad_soyad,
    telefon,
    departman,
    konum,
    sifre
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- Manuel belirtilen UUID
    'kullanici2@adalet.gov.tr',
    'Test Kullanıcı',
    '+90 555 123 45 67',
    'Yazı İşleri',
    'Ankara Adliyesi',
    'test123'
);

-- Tüm kullanıcıları görüntüleme
SELECT * FROM users; 