import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type QRScannerProps = {
  onScan: (data: string) => void;
  onClose: () => void;
};

// --- Cores do Tema ---
const PRIMARY_ORANGE = '#ff8c42';
const TEXT_GRAY = '#D1D5DB'; // Cor equivalente a gray-300
const BACKGROUND_BLACK = '#000000';
const OVERLAY_BLACK = 'rgba(0, 0, 0, 0.6)'; // black/60
const WHITE = '#ffffff';
const SUCCESS_GREEN = '#10B981'; // Cor equivalente a green-500

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  // --- Estado: Verificando Permissões ---
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Verificando permissões...</Text>
      </View>
    );
  }

  // --- Estado: Permissão Negada ---
  if (!permission.granted) {
    return (
      <View style={styles.permissionDeniedContainer}>
        <Text style={styles.permissionDeniedTitle}>
          📷 Permissão da Câmera Necessária
        </Text>
        <Text style={styles.permissionDeniedSubtitle}>
          Para escanear QR Codes, precisamos acessar sua câmera
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={requestPermission}
        >
          <Text style={styles.primaryButtonText}>
            Permitir Acesso à Câmera
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onClose}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Estado: Scanner Ativo ---
  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay com instruções */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.headerOverlay}>
            <View style={styles.headerBox}>
              <Text style={styles.headerTitle}>
                Escaneie o QR Code
              </Text>
              <Text style={styles.headerSubtitle}>
                Aponte a câmera para o código do restaurante
              </Text>
            </View>
          </View>

          {/* Frame do scanner no centro */}
          <View style={styles.scannerFrameContainer}>
            <View style={styles.scannerFrame}>
              {/* Frame principal */}
              <View style={styles.frameBorder} />
              
              {/* Cantos decorativos */}
              <View style={[styles.frameCorner, styles.cornerTopLeft]} />
              <View style={[styles.frameCorner, styles.cornerTopRight]} />
              <View style={[styles.frameCorner, styles.cornerBottomLeft]} />
              <View style={[styles.frameCorner, styles.cornerBottomRight]} />
            </View>

            {scanned && (
              <View style={styles.scannedBox}>
                <Text style={styles.scannedText}>
                  ✓ QR Code Detectado!
                </Text>
              </View>
            )}
          </View>

          {/* Botões inferiores */}
          <View style={styles.footerButtons}>
            {scanned ? (
              <TouchableOpacity
                style={[styles.button, styles.rescanButton]}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanButtonText}>
                  🔄 Escanear Novamente
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  Posicione o QR Code dentro do quadro
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  // --- Estados de Permissão ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_BLACK,
  },
  loadingText: {
    color: WHITE,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_BLACK,
    padding: 24,
  },
  permissionDeniedTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionDeniedSubtitle: {
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // --- Botões (Comuns e Específicos) ---
  button: {
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: PRIMARY_ORANGE,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#4B5563', // Cor equivalente a gray-600
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: WHITE,
    fontWeight: 'bold',
  },

  // --- Scanner Ativo ---
  scannerContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_BLACK,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },

  // Header Overlay (Instruções)
  headerOverlay: {
    alignItems: 'center',
    paddingTop: 48, // pt-12 (assumindo que 12*4 = 48)
  },
  headerBox: {
    backgroundColor: OVERLAY_BLACK,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: TEXT_GRAY,
    textAlign: 'center',
  },

  // Frame do Scanner
  scannerFrameContainer: {
    alignItems: 'center',
  },
  scannerFrame: {
    position: 'relative',
  },
  frameBorder: {
    width: 256, // w-64
    height: 256, // h-64
    borderWidth: 4,
    borderColor: WHITE,
    borderRadius: 24, // rounded-3xl
  },
  // Cantos Decorativos (Border Top/Left/Bottom/Right)
  frameCorner: {
    position: 'absolute',
    width: 48, // w-12
    height: 48, // h-12
    borderColor: PRIMARY_ORANGE,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 8,
    borderLeftWidth: 8,
    borderTopLeftRadius: 24, // rounded-tl-3xl
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderTopRightRadius: 24,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderBottomLeftRadius: 24,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderBottomRightRadius: 24,
  },

  // Feedback de Escaneamento
  scannedBox: {
    marginTop: 24,
    backgroundColor: SUCCESS_GREEN,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  scannedText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Botões Inferiores
  footerButtons: {
    alignItems: 'center',
    paddingBottom: 32, // pb-8
  },
  instructionBox: {
    backgroundColor: OVERLAY_BLACK,
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
  },
  instructionText: {
    color: WHITE,
    textAlign: 'center',
  },
  rescanButton: {
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 50, // rounded-full
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 16,
    // Adicionando sombra manualmente (iOS)
    shadowColor: BACKGROUND_BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Adicionando sombra manualmente (Android)
    elevation: 8,
  },
  rescanButtonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // white/20
    // A propriedade `backdrop-blur` não tem um equivalente nativo simples em RN,
    // então usamos uma cor transparente.
    borderRadius: 50, // rounded-full
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 18,
  },
});