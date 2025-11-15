import { calculateLiters, getAvailableProducts, getProducts, getTokenDetails, searchTokens, sellFuel } from '@/api/attendant';
import { useAuth } from '@/context/AuthContext';
import { Transaction } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, HelperText, IconButton, List, Modal as PaperModal, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
// Scanner is loaded dynamically to avoid blocking the route if the native module isn't installed yet

export default function SellFuelScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [pumpPickerVisible, setPumpPickerVisible] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [Scanner, setScanner] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedPump, setSelectedPump] = useState<{ id: number; pumpNumber: number; dispenserId: number } | null>(null);
  const [stationId, setStationId] = useState<number | null>(null);
  const [dispensers, setDispensers] = useState<Array<{ id: number; dispenserNumber: number; pumps: Array<{ id: number; pumpNumber: number; product?: string }> }>>([]);
  const [productOptions, setProductOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [fetched, setFetched] = useState<Transaction | null>(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [liters, setLiters] = useState<number | null>(null);
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<any>(null);
  

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setTokenInput(text.trim());
  };

  const handleOpenScanner = async () => {
    try {
      const mod = await import('expo-barcode-scanner');
      const { status } = await mod.BarCodeScanner.requestPermissionsAsync();
      setCameraGranted(status === 'granted');
      setScanner(() => mod.BarCodeScanner);
    } catch (e) {
      setCameraGranted(false);
      setSnackbar('Scanner module not available. Please install expo-barcode-scanner.');
    } finally {
      setScanVisible(true);
    }
  };

useEffect(() => {
  const run = async () => {
    if (!user?.id) return;
    try {
      const [avail, prods] = await Promise.all([
        getAvailableProducts(),
        getProducts(), // Now returns OMC products
      ]);

      setStationId(avail?.station?.id ?? null);
      setDispensers(avail?.station?.dispensers ?? []);

      // Use station-specific products only (must have station price)
      const list = Array.isArray(avail?.station?.products)
        ? avail.station.products.map((p: any) => ({ id: p.id, name: p.name }))
        : [];

      setProductOptions(list);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };
  run();
}, [user?.id]);

  const handleLookup = async () => {
    const token = tokenInput.trim();
    if (!token) {
      setError('Enter a valid token');
      return;
    }
    setError('');
    setFetched(null);
    setLookupLoading(true);
    try {
      const data = await getTokenDetails(token);
      setFetched(data);
      if (data?.deletedAt) {
        setSnackbar('This token has already been used.');
      }
    } catch (e: any) {
      setError('Token not found. Please verify and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!tokenInput.trim() || !selectedProduct) {
      setError('Select product and enter token');
      return;
    }
    try {
      const res = await calculateLiters(tokenInput.trim(), selectedProduct);
      const value = typeof res === 'number' ? res : res?.liters;
      if (value == null) throw new Error('Invalid response');
      setLiters(value);
      setSnackbar(`Dispense ${value} L`);
    } catch (e) {
      setError('Failed to calculate liters');
    }
  };

  // auto-calc when both token and product are set
 useEffect(() => {
  const q = tokenInput.trim();
  if (!q) {
    setSearchResults([]);
    setShowDropdown(false);
    return;
  }

  // Show box but don't query until 2+ chars
  if (q.length < 2) {
    setSearchResults([]);
    setShowDropdown(true);
    return;
  }

  if (searchDebounce.current) clearTimeout(searchDebounce.current);

  searchDebounce.current = setTimeout(async () => {
    try {
      const results = await searchTokens(q);
      setSearchResults(results);
      console.log('results', results.length, results?.[0])
      setShowDropdown(true);
    } catch (e) {
      console.warn('Token search error', e);
      setSearchResults([]);
      setShowDropdown(true);
    }
  }, 300); // 300 ms debounce

  return () => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
  };
}, [tokenInput]);

  const handleComplete = async () => {
    if (!fetched || !tokenInput.trim()) return;
    if (fetched.deletedAt) {
      setSnackbar('Token is already used.');
      return;
    }
    if (!selectedProduct || !selectedProductId) { setError('Select a product'); return; }
    if (!selectedPump || !stationId) { setError('Select a pump'); return; }
    if (liters == null) { setError('Calculate liters first'); return; }
    setError('');
    setCompleteLoading(true);
    try {
      await sellFuel(tokenInput.trim(), {
        // liters,
        stationId: stationId!,
        dispenserId: selectedPump.dispenserId,
        pumpId: selectedPump.id,
        productCatalogId: selectedProductId,
      });
      setSnackbar('Transaction complete. Token marked as used.');
      setFetched({ ...fetched, deletedAt: new Date().toISOString() });
      setSelectedProduct('');
      setSelectedProductId(null);
      setSelectedPump(null);
      setLiters(null);
      setTokenInput('');
    } catch (e: any) {
      setError('Failed to complete transaction.');
    } finally {
      setCompleteLoading(false);
    }
  };

  const disabledComplete = !fetched || !!fetched.deletedAt || !selectedProduct || !selectedPump || liters == null;

  const pumpOptions = useMemo(() => {
    const all = dispensers.flatMap((d) => (d.pumps || []).map((p) => ({
      id: p.id,
      pumpNumber: p.pumpNumber,
      dispenserId: (d as any).id,
      dispenserNumber: (d as any).dispenserNumber,
      product: (p as any).productCatalog?.name || (p as any).product,
    })));
    if (!selectedProduct) return all;
    return all.filter((p) => (p as any).product === selectedProduct);
  }, [dispensers, selectedProduct]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
  style={{ flex: 1, backgroundColor: theme.colors.background }}
  contentContainerStyle={{ padding: 16, marginTop: 54, paddingBottom: 80 }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 16 }}>Sell Fuel</Text>

        <Card style={{ borderRadius: 16 }}>
          <Card.Content>
           <View style={{ position: 'relative' }}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ flex: 1 }}>
      <TextInput
        ref={inputRef}
        mode="outlined"
        label="Token"
        placeholder="Enter token number"
        value={tokenInput}
        onChangeText={setTokenInput}
        onFocus={() => tokenInput && setShowDropdown(true)}
        right={<TextInput.Icon icon="content-paste" onPress={handlePaste} />}
        autoCapitalize="none"
        autoCorrect={false}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // tiny delay for click
      />
    </View>
    <IconButton icon="qrcode-scan" onPress={handleOpenScanner} style={{ marginLeft: 8 }} />
  </View>

  {/* ----- SIMPLE INLINE RESULTS BOX ----- */}
  {showDropdown && (
    <View
      style={{
        marginTop: 6,
        borderWidth: 0,
        // borderColor: '#e3e3e3',
        // backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 220,
        overflow: 'hidden',
      }}
    >
      {tokenInput.trim().length < 2 ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#666' }}>Type at least 2 characters…</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#666' }}>No results</Text>
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: 220 }}>
          {searchResults.map((item) => (
            <TouchableOpacity
              key={item}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
              onPress={() => {
                setTokenInput(item);
                setShowDropdown(false);
              }}
            >
              <Text style={{ fontSize: 15 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )}
</View>
            {!!error && <HelperText type="error" visible>{error}</HelperText>}
            <Button mode="contained" onPress={handleLookup} loading={lookupLoading} style={{ marginTop: 8 }}>
              Fetch Token Details
            </Button>
          </Card.Content>
        </Card>

        {fetched && (
          <Card style={{ marginTop: 16, borderRadius: 16 }}>
            <Card.Title title="Token Details" />
            <Divider />
            <Card.Content>
              <List.Item title="Token" description={fetched.token || 'N/A'} left={(props) => <List.Icon {...props} icon="pound" />} />
              <List.Item title="Amount" description={`GHS ${fetched.amount ?? 'N/A'}`} left={(props) => <List.Icon {...props} icon="cash" />} />
              <List.Item title="Issued" description={new Date(fetched.createdAt).toLocaleString()} left={(props) => <List.Icon {...props} icon="calendar" />} />
              <List.Item title="Status" description={fetched.deletedAt ? 'USED' : 'UNUSED'} left={(props) => <List.Icon {...props} icon={fetched.deletedAt ? 'cancel' : 'check-circle'} />} />
              <View style={{ marginTop: 12 }}>
                <Button mode="outlined" onPress={() => setProductPickerVisible(true)}>
                  {selectedProduct || 'Select Product'}
                </Button>
              </View>
              <View style={{ marginTop: 12 }}>
                <Button mode="outlined" onPress={() => setPumpPickerVisible(true)} disabled={!productOptions.length}>
                  {selectedPump ? `Pump ${selectedPump.pumpNumber}` : 'Select Pump'}
                </Button>
              </View>

              <View style={{ marginTop: 12 }}>
                <Button mode="contained-tonal" onPress={handleCalculate} disabled={!selectedProduct || !tokenInput.trim()}>
                  Calculate Liters
                </Button>
                {liters != null && (
                  <Text style={{ marginTop: 8, fontWeight: '600' }}>{`Liters to dispense: ${liters}`}</Text>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleComplete}
                disabled={disabledComplete}
                loading={completeLoading}
                style={{ marginTop: 12 }}
              >
                Transaction Complete
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <PaperModal visible={productPickerVisible} onDismiss={() => setProductPickerVisible(false)} contentContainerStyle={{ marginHorizontal: 16, backgroundColor: 'white', borderRadius: 16, maxHeight: '80%' }}>
          <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
            <Card.Title title="Select Product" />
            <Divider />
            <FlatList
              data={productOptions}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProduct(item.name);
                    setSelectedProductId(item.id);
                    setProductPickerVisible(false);
                    setSelectedPump(null);
                    setLiters(null);
                  }}
                  style={{ paddingHorizontal: 16, paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </Card>
        </PaperModal>

        <PaperModal visible={pumpPickerVisible} onDismiss={() => setPumpPickerVisible(false)} contentContainerStyle={{ marginHorizontal: 16, backgroundColor: 'white', borderRadius: 16, maxHeight: '80%' }}>
          <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
            <Card.Title title="Select Pump" />
            <Divider />
            <FlatList
              data={pumpOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedPump({ id: item.id, pumpNumber: item.pumpNumber, dispenserId: (item as any).dispenserId });
                    setPumpPickerVisible(false);
                    setLiters(null);
                  }}
                  style={{ paddingHorizontal: 16, paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 16 }}>{`Pump ${item.pumpNumber} • Dispenser ${(item as any).dispenserNumber} • ${(item as any).product || ''}`}</Text>
                </TouchableOpacity>
              )}
            />
          </Card>
        </PaperModal>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2500} style={{ bottom: 80 }}>
        {snackbar}
      </Snackbar>

      <Modal
        transparent
        visible={scanVisible}
        animationType="fade"
        onRequestClose={() => setScanVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setScanVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ width: '88%', height: 360, overflow: 'hidden', borderRadius: 16 }}>
            {cameraGranted === true ? (
              Scanner ? (
                <Scanner
                  style={{ flex: 1 }}
                  onBarCodeScanned={({ data }: any) => {
                    if (data) {
                      setTokenInput(String(data));
                      setScanVisible(false);
                    }
                  }}
                />
              ) : (
                <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white' }}>Scanner not available</Text>
                </View>
              )
            ) : cameraGranted === false ? (
              <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Camera permission denied</Text>
              </View>
            ) : (
              <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Requesting camera permission…</Text>
              </View>
            )}
          </View>
          <Text style={{ color: 'white', marginTop: 16 }}>Tap anywhere to close</Text>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
