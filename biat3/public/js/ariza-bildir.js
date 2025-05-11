

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('issueForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const sicil_no = document.getElementById('sicilNo').value;
        const aciklama = document.getElementById('description').value;
        const telefon = document.getElementById('telefon').value;
        const fileInput = document.getElementById('fileUpload');
        const file = fileInput.files[0];

        console.log('Form verileri:', { sicil_no, aciklama, telefon, file });

        let foto_url = null;

        // Fotoğraf varsa önce Storage'a yükle
        if (file) {
            try {
                const safeFileName = slugifyFileName(file.name);
                const filePath = `${Date.now()}_${safeFileName}`;
                console.log('Fotoğraf yükleniyor:', filePath);
                
                // Önce bucket'ın varlığını kontrol et
                const { data: buckets, error: bucketError } = await supabase
                    .storage
                    .listBuckets();
        
                if (bucketError) {
                    console.error('Bucket listesi alınamadı:', bucketError);
                    throw new Error('Storage erişimi sağlanamadı');
    }
    
                const { error } = await supabase.storage
                    .from('ariza-fotograflari')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error('Fotoğraf yükleme hatası:', error);
                    throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
    }

                // Public URL al
                const { data: publicUrlData } = supabase
                    .storage
                    .from('ariza-fotograflari')
                    .getPublicUrl(filePath);

                foto_url = publicUrlData.publicUrl;
                console.log('Fotoğraf public URL:', foto_url);
            } catch (error) {
                console.error('Fotoğraf yükleme işlemi başarısız:', error);
                alert(error.message);
                return;
            }
        }

        // Şimdi tabloya kaydet
        console.log('Tabloya kaydediliyor:', { sicil_no, aciklama, telefon, foto_url });
        const today = new Date().toISOString(); // UTC ISO formatı
        const ariza_no = generateArizaNo();
        const { error: insertError } = await supabase
            .from('ariza_bildirimleri')
            .insert([{
                ariza_no: ariza_no,
                sicil_no: sicil_no,
                ariza_aciklamasi: aciklama,
                telefon: telefon,
                foto_url: foto_url,
                tarih: today
            }]);
        
        if (insertError) {
            console.error('Tabloya kayıt hatası:', insertError);
            alert('Kayıt başarısız: ' + insertError.message);
        } else {
            console.log('Kayıt başarılı!');
            alert('Arıza bildirimi başarıyla kaydedildi!');
            document.getElementById('issueForm').reset();
            const fileLabel = document.getElementById('fileUploadLabel');
            if (fileLabel) fileLabel.textContent = 'Dosya seçilmedi';
        }
    });
});

function generateArizaNo() {
  // Yıl + Ay + Gün + Saat + Dakika + Saniye + 4 haneli random
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ARZ${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${random}`;
}

function slugifyFileName(filename) {
    const trMap = {ç:'c',Ç:'C',ğ:'g',Ğ:'G',ı:'i',İ:'I',ö:'o',Ö:'O',ş:'s',Ş:'S',ü:'u',Ü:'U'};
    filename = filename.replace(/[çÇğĞıİöÖşŞüÜ]/g, letter => trMap[letter]);
    filename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
    return filename;
}

