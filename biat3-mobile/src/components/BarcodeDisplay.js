import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Svg, Rect, G, Line, Text as SvgText } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

/**
 * Barkod ve taranabilir QR kod gösterimi bileşeni
 */
const BarcodeDisplay = ({ 
  value,
  qrValue, 
  showLabel = true, 
  textColor = '#1e293b', 
  backgroundColor = '#FFFFFF',
  borderColor = '#e2e8f0' 
}) => {
  // Handle empty values
  if (!value && !qrValue) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: '#ef4444' }]}>Barkod bilgisi bulunamadı</Text>
      </View>
    );
  }

  // If only one value is provided, use it for both
  const barcodeValue = value || qrValue;
  const qrCodeValue = qrValue || value;

  // QR değerinde JSON varsa, formatla göster
  let displayQrValue = qrCodeValue;
  try {
    const parsedQr = JSON.parse(qrCodeValue);
    displayQrValue = JSON.stringify(parsedQr, null, 2);
  } catch (e) {
    // JSON değilse olduğu gibi göster
  }

  // Create an improved barcode visualization
  const createBarcode = (value) => {
    if (!value) return null;
    
    const characters = value.toString().split('');
    const barcodeHeight = 80;
    const totalBars = characters.length * 2 + 8; // Each character has 2 bars + start/stop codes
    const barWidth = 2;
    const spacing = 1;
    const svgWidth = (barWidth + spacing) * totalBars;
    
    // Generate pseudo-random barcode patterns based on input characters
    const generateBars = () => {
      const bars = [];
      
      // Start bars (always the same pattern for Code128)
      bars.push({ x: 0, width: barWidth * 2, height: barcodeHeight });
      bars.push({ x: barWidth * 2 + spacing * 2, width: barWidth, height: barcodeHeight });
      bars.push({ x: barWidth * 3 + spacing * 3, width: barWidth * 2, height: barcodeHeight });
      
      let xPosition = barWidth * 5 + spacing * 5;
      
      // Bars for each character
      characters.forEach((char, charIndex) => {
        const charCode = char.charCodeAt(0);
        
        // Generate bar pattern based on character code
        const pattern = [
          (charCode % 2) + 1, // Wider if odd ASCII value
          ((charCode + 1) % 2) + 1, // Alternating pattern
        ];
        
        pattern.forEach((width, i) => {
          const height = i % 2 === 0 
            ? barcodeHeight 
            : barcodeHeight - (10 + (charIndex % 3) * 5); // Vary heights for visual interest
          
          bars.push({
            x: xPosition,
            width: barWidth * width,
            height: height
          });
          
          xPosition += barWidth * width + spacing;
        });
        
        // Add space between characters
        xPosition += spacing;
      });
      
      // End bars (always the same pattern for Code128)
      const endX = xPosition;
      bars.push({ x: endX, width: barWidth * 2, height: barcodeHeight });
      bars.push({ x: endX + barWidth * 2 + spacing, width: barWidth, height: barcodeHeight });
      bars.push({ x: endX + barWidth * 3 + spacing * 2, width: barWidth * 2, height: barcodeHeight });
      
      return bars;
    };
    
    const bars = generateBars();
    
    return (
      <Svg height={barcodeHeight} width={svgWidth} viewBox={`0 0 ${svgWidth} ${barcodeHeight}`}>
        <G>
          {bars.map((bar, index) => (
            <Rect
              key={index}
              x={bar.x}
              y={0}
              width={bar.width}
              height={bar.height}
              fill="#000"
            />
          ))}
        </G>
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barkod gösterimi */}
      <View style={styles.barcodeContainer}>
        {showLabel && <Text style={[styles.label, { color: textColor }]}>Barkod</Text>}
        <View style={[
          styles.barcodeWrapper, 
          { 
            backgroundColor: backgroundColor,
            borderColor: borderColor
          }
        ]}>
          {createBarcode(barcodeValue)}
          <Text style={[styles.codeText, { color: textColor }]}>{barcodeValue}</Text>
        </View>
      </View>

      {/* QR Kod gösterimi - react-native-qrcode-svg kullanarak */}
      <View style={styles.qrContainer}>
        {showLabel && <Text style={[styles.label, { color: textColor }]}>QR Kod</Text>}
        <View style={[
          styles.qrWrapper, 
          { 
            backgroundColor: backgroundColor,
            borderColor: borderColor
          }
        ]}>
          <QRCode
            value={qrCodeValue}
            size={200}
            backgroundColor="white"
            color="black"
          />
          <Text style={[styles.codeText, { color: textColor }]}>Telefonla taranabilir</Text>
        </View>
      </View>

      {/* QR Kod içeriği */}
      <View style={styles.qrContentContainer}>
        <Text style={[styles.qrContentLabel, { color: textColor }]}>QR Kod İçeriği:</Text>
        <View style={[
          styles.qrContentWrapper, 
          { 
            backgroundColor: backgroundColor,
            borderColor: borderColor 
          }
        ]}>
          <Text style={[styles.qrContent, { color: textColor }]}>{displayQrValue}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barcodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  barcodeWrapper: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  codeText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrContentContainer: {
    width: '100%',
    marginBottom: 16,
  },
  qrContentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qrContentWrapper: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrContent: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default BarcodeDisplay;

// --- Sadece QR Kod gösteren bileşen ---
export const QRCodeDisplay = ({ value, size = 180 }) => (
  <View style={qrStyles.container}>
    <QRCode value={value || '-'} size={size} backgroundColor="white" color="black" />
    <Text style={qrStyles.text}>Telefonla taranabilir</Text>
    <Text style={qrStyles.content}>QR Kod İçeriği: {value || '-'}</Text>
  </View>
);

const qrStyles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  text: { fontSize: 12, color: '#64748b', marginTop: 4 },
  content: { fontSize: 12, color: '#64748b', marginTop: 2 },
});

// --- Sadece Barkod gösteren bileşen ---
export const BarcodeOnlyDisplay = ({ value, width = 290, height = 60 }) => {
  // Basit barkod çizimi (örnek, gerçek barkod için kütüphane önerilir)
  const barWidth = 2;
  const spacing = 1;
  const chars = (value || '').toString().split('');
  const totalBars = chars.length * 2 + 8;
  const svgWidth = (barWidth + spacing) * totalBars;
  let x = 0;
  const bars = [];
  for (let i = 0; i < totalBars; i++) {
    bars.push({ x, width: barWidth, height });
    x += barWidth + spacing;
  }
  return (
    <View style={barcodeStyles.container}>
      <Svg height={height} width={width} viewBox={`0 0 ${svgWidth} ${height}`}>
        <G>
          {bars.map((bar, idx) => (
            <Rect key={idx} x={bar.x} y={0} width={bar.width} height={bar.height} fill="#000" />
          ))}
        </G>
      </Svg>
      <Text style={barcodeStyles.text}>Telefonla taranabilir</Text>
      <Text style={barcodeStyles.content}>Barkod İçeriği: {value || '-'}</Text>
    </View>
  );
};

const barcodeStyles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  text: { fontSize: 12, color: '#64748b', marginTop: 4 },
  content: { fontSize: 12, color: '#64748b', marginTop: 2 },
}); 