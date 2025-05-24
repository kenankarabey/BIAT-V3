import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalSelector from 'react-native-modal-selector';
import withThemedScreen from '../components/withThemedScreen';
import { supabase } from '../supabaseClient';
const ODA_TIPLERI = {
  MAHKEME_KALEMLERI: 'Mahkeme Kalemi',
  HAKIM_ODALARI: 'Hakim Odaları',
  DURUSMA_SALONU: 'Duruşma Salonu'
};

const BIRIMLER = {
  [ODA_TIPLERI.MAHKEME_KALEMLERI]: [
    'Sulh Hukuk Mahkemesi', 'Hukuk Ön Büro', 'Hukuk Vezne', 'Asliye Hukuk Mahkemesi',
    'Tüketici Mahkemesi', 'Kadastro Mahkemesi', 'İş Mahkemesi', 'Aile Mahkemesi',
    'Ağır Ceza Mahkemesi', 'Adalet Komisyonu Başkanlığı', 'Sulh Ceza Hakimliği',
    'İnfaz Hakimliği', 'Çocuk Mahkemesi', 'Savcılık İnfaz Bürosu', 'Asliye Ceza Mahkemesi',
    'Adli Destek ve Mağdur Hizmetleri Müdürlüğü ve Görüşme Odaları', 'Ceza Ön Büro',
    'Ceza Vezne', 'Soruşturma Bürosu', 'İdari İşler Müdürlüğü', 'Müracaat Bürosu',
    'Muhabere Bürosu', 'Talimat Bürosu', 'Emanet Bürosu', 'Nöbetçi Sulh Ceza Hakimliği',
    'Cumhuriyet Başsavcılığı', 'Bakanlık Muhabere Bürosu', 'CMK', 'Maaş',
    'İcra Müdürlüğü', 'Adli Sicil Şefliği', 'İcra Hukuk Mahkemesi', 'İcra Ceza Mahkemesi'
  ],
  [ODA_TIPLERI.HAKIM_ODALARI]: [
    'Sulh Hukuk Mahkemesi',
    'Asliye Hukuk Mahkemesi',
    'Tüketici Mahkemesi',
    'Kadastro Mahkemesi',
    'İş Mahkemesi',
    'Aile Mahkemesi',
    'Ağır Ceza Mahkemesi',
    'Adalet Komisyonu Başkanlığı',
    'Sulh Ceza Hakimliği',
    'İnfaz Hakimliği',
    'Çocuk Mahkemesi',
    'Asliye Ceza Mahkemesi',
    'İdari İşler Müdürlüğü',
    'Nöbetçi Sulh Ceza Hakimliği',
    'Cumhuriyet Başsavcılığı',
    'İcra Hukuk Mahkemesi',
    'İcra Ceza Mahkemesi'
  ],
  [ODA_TIPLERI.DURUSMA_SALONU]: [
    'Sulh Hukuk Mahkemesi',
    'Asliye Hukuk Mahkemesi',
    'Tüketici Mahkemesi',
    'Kadastro Mahkemesi',
    'İş Mahkemesi',
    'Aile Mahkemesi',
    'Ağır Ceza Mahkemesi',
    'Sulh Ceza Hakimliği',
    'İnfaz Hakimliği',
    'Çocuk Mahkemesi',
    'Asliye Ceza Mahkemesi',
    'İdari İşler Müdürlüğü',
    'Nöbetçi Sulh Ceza Hakimliği',
    'İcra Hukuk Mahkemesi',
    'İcra Ceza Mahkemesi'
  ]
};

const RoomTypeSelectionScreen = ({ navigation, theme }) => {
  const [secilenOdaTipi, setSecilenOdaTipi] = useState('');
  const [secilenBirim, setSecilenBirim] = useState('');
  const [mahkemeNo, setMahkemeNo] = useState('');
  const [odaModalVisible, setOdaModalVisible] = useState(false);
  const [birimModalVisible, setBirimModalVisible] = useState(false);

  const isDark = theme?.isDark;
  // Ortak kutu stili (input ve selector için)
  const boxStyle = {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: isDark ? theme.cardBackground : '#fff',
    paddingHorizontal: 12,
    paddingVertical: 0,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  };

  const modalSelector = boxStyle;
  const modalOptionContainer = {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
  };
  const modalOptionText = {
    color: isDark ? '#fff' : theme.text,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
  };
  const modalCancelText = {
    color: isDark ? '#fff' : theme.text,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  };
  const modalOverlay = {
    backgroundColor: 'rgba(22,26,74,0.7)',
  };
  const modalInitValueText = {
    color: theme.textSecondary,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  };
  const modalSelectText = {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 8,
  };
  const inputContainerCustom = boxStyle;
  const inputCustom = {
    color: theme.text,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  };
  const labelCustom = {
    color: theme.text,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  };

  const odaTipiData = Object.values(ODA_TIPLERI).map((tip) => ({ key: tip, label: tip }));
  const birimData = secilenOdaTipi ? BIRIMLER[secilenOdaTipi].map((birim) => ({ key: birim, label: birim })) : [];

  const handleDevamEt = () => {
    if (!secilenOdaTipi || !secilenBirim || !mahkemeNo) {
      // Hata mesajı göster
      return;
    }
    navigation.navigate('AddDevice', {
      odaTipi: secilenOdaTipi,
      birim: secilenBirim,
      mahkemeNo
    });
  };

  const inputBgColor = isDark ? '#23272e' : theme.inputBg;
  const inputTextColor = isDark ? '#111' : theme.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()}> 
          <Ionicons name="arrow-back" size={24} color={theme.text} /> 
        </TouchableOpacity> 
        <Text style={[styles.headerTitle, { color: theme.text }]}>Oda Bilgileri</Text> 
        <View style={{ width: 24 }} /> 
      </View> 
      <ScrollView style={styles.scrollView}> 
        <View style={styles.formContainer}> 
          <Text style={labelCustom}>Oda Tipi</Text>
          <TouchableOpacity style={[boxStyle, { backgroundColor: inputBgColor }]} onPress={() => setOdaModalVisible(true)}>
            <Text style={[inputCustom, { backgroundColor: inputBgColor, color: inputTextColor }]}>{secilenOdaTipi || 'Seçiniz'}</Text>
          </TouchableOpacity>
          <ModalSelector
            data={odaTipiData}
            visible={odaModalVisible}
            onChange={(option) => {
              setSecilenOdaTipi(option.key);
              setSecilenBirim('');
              setOdaModalVisible(false);
            }}
            onModalClose={() => setOdaModalVisible(false)}
            optionContainerStyle={modalOptionContainer}
            optionTextStyle={modalOptionText}
            cancelTextStyle={modalCancelText}
            overlayStyle={modalOverlay}
            cancelText="Vazgeç"
            selectedKey={secilenOdaTipi}
            value={secilenOdaTipi}
            style={{ borderWidth: 0, borderColor: 'transparent' }}
            customSelector={<View />}
          />

          <Text style={labelCustom}>Birim</Text>
          <TouchableOpacity style={[boxStyle, { backgroundColor: inputBgColor }]} onPress={() => secilenOdaTipi && setBirimModalVisible(true)} disabled={!secilenOdaTipi}>
            <Text style={[inputCustom, { backgroundColor: inputBgColor, color: inputTextColor }]}>{secilenBirim || 'Seçiniz'}</Text>
          </TouchableOpacity>
          <ModalSelector
            data={birimData}
            visible={birimModalVisible}
            onChange={(option) => {
              setSecilenBirim(option.key);
              setBirimModalVisible(false);
            }}
            onModalClose={() => setBirimModalVisible(false)}
            optionContainerStyle={modalOptionContainer}
            optionTextStyle={modalOptionText}
            cancelTextStyle={modalCancelText}
            overlayStyle={modalOverlay}
            cancelText="Vazgeç"
            selectedKey={secilenBirim}
            value={secilenBirim}
            style={{ borderWidth: 0, borderColor: 'transparent' }}
            customSelector={<View />}
          />

          <Text style={labelCustom}>Mahkeme No</Text>
          <View style={[boxStyle, { backgroundColor: inputBgColor }]}>
            <TextInput
              value={mahkemeNo}
              onChangeText={setMahkemeNo}
              placeholder="Mahkeme numarasını giriniz"
              placeholderTextColor={isDark ? '#888' : theme.textSecondary}
              style={[inputCustom, { backgroundColor: inputBgColor, color: inputTextColor }]}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.devamButton, { backgroundColor: theme.primary }]}
            onPress={handleDevamEt}
          >
            <Text style={styles.devamButtonText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  devamButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  devamButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default withThemedScreen(RoomTypeSelectionScreen); 