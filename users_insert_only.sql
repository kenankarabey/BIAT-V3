-- Mevcut users tablosuna kullanıcı ekleme

-- Önce tabloyu kontrol edelim
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Kullanıcı ekleme (kolonların adlarını kontrol edip gerekiyorsa değiştirin)
INSERT INTO users (
    -- id otomatik oluşturulacaksa, id satırını yorum haline getirin
    -- id,
    email,
    ad_soyad,
    telefon,
    departman,
    konum,
    sifre
    -- created_at ve updated_at kolonları otomatik doldurulacaksa, bunları dahil etmeyin
) VALUES (
    -- '550e8400-e29b-41d4-a716-446655440000', -- Manuel UUID, gerekiyorsa yorum işaretini kaldırın
    'kullanici@adalet.gov.tr',
    'Kenan Karabey',
    '+90 552 363 14 01',
    'Bilgi İşlem',
    'Malatya Adliyesi',
    'sifre123'
);

-- Ekleme başarılı olduysa, kullanıcıyı görüntüleyelim
SELECT * FROM users 
WHERE email = 'kullanici@adalet.gov.tr'; 