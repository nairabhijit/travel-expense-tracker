import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetimeButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonText,
  IonToggle,
  IonAlert,
  IonIcon
} from '@ionic/react';
import { trash, add, camera, image, documentText } from 'ionicons/icons';
import { CATEGORIES, SOURCES, CURRENCIES } from '../constants';
import { Trip, Expense } from '../types';
import { formatAmount } from '../utils/format';

import './AddExpenseModal.css';
import { Keyboard } from '@capacitor/keyboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AddExpenseModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSaveExpense: (expense: {
    id?: string;
    categoryId: string;
    title: string;
    amount: number;
    date: string;
    sourceId: string;
    currency: string;
    baseCurrencyAmount: number;
    customExchangeRate?: number;
    billUrl?: string; // Keep for backwards compatibility
    billUrls?: string[];
  }) => void;
  trip: Trip | null;
  expenseToEdit?: Expense | null;
  onDeleteExpense?: (id: string) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onDidDismiss, onSaveExpense, trip, expenseToEdit, onDeleteExpense }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [source, setSource] = useState<string>(SOURCES[0].id);
  const [billUrls, setBillUrls] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const defaultCurrencyCode = trip?.spendingCurrency || 'USD';

  const dismissKeyboard = async (e: any) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      try {
        await Keyboard.hide();
      } catch (err) {}
    }
  };
  const [expenseCurrency, setExpenseCurrency] = useState<string>(defaultCurrencyCode);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isFetchingRate, setIsFetchingRate] = useState<boolean>(false);
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (expenseToEdit) {
        setSelectedCategory(expenseToEdit.categoryId);
        setTitle(expenseToEdit.title || '');
        setAmount(expenseToEdit.amount.toString());
        setDate(expenseToEdit.date);
        setSource(expenseToEdit.sourceId);
        if (trip) {
          setExpenseCurrency(expenseToEdit.currency || trip.spendingCurrency);
          setExchangeRate(1);
        }
        if (expenseToEdit.customExchangeRate) {
          setUseCustomRate(true);
          setCustomRate(expenseToEdit.customExchangeRate.toString());
        } else {
          setUseCustomRate(false);
          setCustomRate('');
        }
        setBillUrls(expenseToEdit.billUrls || (expenseToEdit.billUrl ? [expenseToEdit.billUrl] : []));
      } else {
        setSelectedCategory(null);
        setTitle('');
        setAmount('');
        setDate(new Date().toISOString());
        setSource(SOURCES[0].id);
        if (trip) {
          setExpenseCurrency(trip.spendingCurrency);
          setExchangeRate(1);
        }
        setUseCustomRate(false);
        setCustomRate('');
        setBillUrls([]);
      }
    }
  }, [isOpen, trip, expenseToEdit]);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (!isOpen || !trip || expenseCurrency === trip.localCurrency) {
      setExchangeRate(1);
      return;
    }

    const fetchRate = async () => {
      // If it's a cash transaction in the spending currency and the trip has a custom cash rate, use it
      if (source === 'cash' && expenseCurrency === trip.spendingCurrency && trip.cashExchangeRate) {
        setExchangeRate(trip.cashExchangeRate);
        return;
      }

      setIsFetchingRate(true);
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${expenseCurrency}`);
        const data = await response.json();
        if (data.result === 'success' && data.rates[trip.localCurrency]) {
          setExchangeRate(data.rates[trip.localCurrency]);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setIsFetchingRate(false);
      }
    };

    fetchRate();
  }, [expenseCurrency, isOpen, trip, source]);

  const effectiveExchangeRate = useCustomRate && customRate && !isNaN(Number(customRate)) 
    ? Number(customRate) 
    : exchangeRate;

  const handleSave = () => {
    if (!title || !selectedCategory || !expenseCurrency || !amount || isNaN(Number(amount)) || !date || !source) {
      setError('Please fill all mandatory fields marked with *');
      return;
    }
    setError('');
    
    // Calculate final base amount
    const numAmount = Number(amount);
    const calculatedBaseAmount = numAmount * effectiveExchangeRate;

    onSaveExpense({
      id: expenseToEdit?.id,
      categoryId: selectedCategory,
      title,
      amount: numAmount,
      date,
      sourceId: source,
      currency: expenseCurrency,
      baseCurrencyAmount: calculatedBaseAmount,
      customExchangeRate: useCustomRate ? Number(customRate) : undefined,
      billUrls: billUrls.length > 0 ? billUrls : undefined,
      billUrl: undefined // Clear the singular field as we've migrated
    });
    
    onDidDismiss();
  };

  const categoryObj = CATEGORIES.find(c => c.id === selectedCategory);
  
  // Display calculations
  const isDifferentCurrency = trip && expenseCurrency !== trip.localCurrency;
  const convertedAmount = amount && !isNaN(Number(amount)) && isDifferentCurrency 
    ? formatAmount(Number(amount) * effectiveExchangeRate) 
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];

    const processFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (file.type === 'application/pdf') {
            resolve(event.target?.result as string);
            return;
          }
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_DIMENSION = 800;

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          img.onerror = reject;
          if (event.target?.result) {
            img.src = event.target.result as string;
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const processed = await Promise.all(Array.from(files).map(processFile));
      setBillUrls(prev => [...prev, ...processed]);
    } catch (err) {
      console.error('Error processing images', err);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar className="glass-header">
          <IonTitle>{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onDidDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        
        {!selectedCategory ? (
          <>
            <h3 className="ion-margin-top ion-text-center">Select a Category</h3>
            <IonGrid className="category-grid">
              <IonRow>
                {CATEGORIES.map(cat => (
                  <IonCol size="4" key={cat.id}>
                    <IonCard 
                      className="category-card ion-activatable ripple-parent" 
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                        <IonCardContent className="ion-text-center">
                        <div className="category-icon" style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--ion-color-primary)' }}>
                          <FontAwesomeIcon icon={cat.icon} />
                        </div>
                        <div className="category-name">{cat.name}</div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </>
        ) : (
          <>
             <IonItem lines="none" className="ion-margin-vertical">
                <div slot="start" className="category-icon" style={{ fontSize: '1.75rem', margin: 0, marginRight: '12px', color: 'var(--ion-color-primary)' }}>
                  {categoryObj?.icon && <FontAwesomeIcon icon={categoryObj.icon} />}
                </div>
                <IonLabel>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{categoryObj?.name}</h2>
                </IonLabel>
                <IonButton fill="clear" onClick={() => setSelectedCategory(null)}>Change</IonButton>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput 
                type="text" 
                placeholder="e.g. Dinner, Taxi ticket, etc." 
                value={title} 
                onIonInput={e => setTitle(e.detail.value!)}
                enterkeyhint="next"
                onKeyUp={dismissKeyboard}
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Currency *</IonLabel>
              <IonSelect 
                value={expenseCurrency} 
                onIonChange={e => setExpenseCurrency(e.detail.value)}
                interface="action-sheet"
                interfaceOptions={{ cssClass: 'scrollable-action-sheet' }}
                mode="md"
                selectedText={expenseCurrency}
              >
                {CURRENCIES.map(c => (
                  <IonSelectOption key={c.code} value={c.code}>
                    {c.code}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">
                Amount ({CURRENCIES.find(c => c.code === expenseCurrency)?.symbol}) *
              </IonLabel>
              <IonInput 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onIonInput={e => setAmount(e.detail.value!)}
                enterkeyhint="done"
                onKeyUp={dismissKeyboard}
              ></IonInput>
            </IonItem>
            
            {isDifferentCurrency && (
              <div className="ion-padding-start ion-padding-end ion-margin-top">
                <IonItem lines="none" className="ion-no-padding">
                  <IonLabel>Use custom conversion rate</IonLabel>
                  <IonToggle checked={useCustomRate} onIonChange={e => setUseCustomRate(e.detail.checked)} />
                </IonItem>
                
                {useCustomRate && (
                  <IonItem className="ion-margin-bottom">
                    <IonLabel position="stacked">Custom Rate (1 {expenseCurrency} = ? {trip?.localCurrency})</IonLabel>
                    <IonInput 
                      type="number" 
                      value={customRate} 
                      onIonInput={e => setCustomRate(e.detail.value!)}
                      placeholder="e.g. 1.25"
                      enterkeyhint="done"
                      onKeyUp={dismissKeyboard}
                    ></IonInput>
                  </IonItem>
                )}

                <div style={{ minHeight: '20px', marginTop: '8px' }}>
                  {isFetchingRate && !useCustomRate ? (
                    <IonText color="medium" style={{ fontSize: '0.85rem' }}>
                      <IonSpinner name="dots" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> 
                      Fetching latest rates...
                    </IonText>
                  ) : (
                    <IonText color="medium" style={{ fontSize: '0.85rem' }}>
                      ~ {CURRENCIES.find(c => c.code === trip?.localCurrency)?.symbol}{convertedAmount} {trip?.localCurrency} 
                      {useCustomRate ? ' (Custom Rate)' : (source === 'cash' && expenseCurrency === trip?.spendingCurrency && trip?.cashExchangeRate ? ' (via Trip Cash Rate)' : ' (Live Rate)')}
                    </IonText>
                  )}
                </div>
              </div>
            )}

            <IonItem className="ion-margin-top">
              <IonLabel>Date *</IonLabel>
              <IonDatetimeButton slot="end" datetime="expense-datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="expense-datetime"
                  presentation="date"
                  value={date}
                  onIonChange={e => setDate(e.detail.value as string)}
                ></IonDatetime>
              </IonModal>
            </IonItem>

            <IonItem>
              <IonLabel>Payment Source *</IonLabel>
              <IonSelect slot="end" value={source} onIonChange={e => setSource(e.detail.value)} interface="action-sheet">
                {SOURCES.map(s => (
                  <IonSelectOption key={s.id} value={s.id}>
                    {s.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="ion-margin-top">
              <IonLabel position="stacked">Bill Screenshots (Optional)</IonLabel>
              <div style={{ padding: '10px 0', width: '100%' }}>
                
                {/* Images Preview Grid */}
                {billUrls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    {billUrls.map((url, idx) => {
                      const isPdf = url.startsWith('data:application/pdf');
                      return (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        {isPdf ? (
                          <div onClick={() => setPreviewUrl(url)} style={{ height: '100px', width: '100px', borderRadius: '8px', border: '1px solid var(--ion-color-light-shade)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ion-color-light)', cursor: 'pointer' }}>
                            <IonIcon icon={documentText} style={{ fontSize: '40px', color: 'var(--ion-color-medium)' }} />
                            <IonText color="medium" style={{ fontSize: '0.6rem', marginTop: '4px' }}>PDF</IonText>
                          </div>
                        ) : (
                          <img onClick={() => setPreviewUrl(url)} src={url} alt={`Bill preview ${idx + 1}`} style={{ height: '100px', width: '100px', borderRadius: '8px', border: '1px solid var(--ion-color-light-shade)', objectFit: 'cover', cursor: 'pointer' }} />
                        )}
                        <IonButton 
                          color="danger" 
                          shape="round" 
                          size="small" 
                          onClick={() => {
                            setBillUrls(prev => prev.filter((_, i) => i !== idx));
                          }}
                          style={{ position: 'absolute', top: '-10px', right: '-10px', margin: 0, '--padding-start': '8px', '--padding-end': '8px' }}
                        >
                          <IonIcon icon={trash} slot="icon-only" />
                        </IonButton>
                      </div>
                    );
                    })}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <IonButton fill="outline" color="medium" onClick={() => cameraInputRef.current?.click()} style={{ flex: 1 }}>
                    <IonIcon icon={camera} slot="start" />
                    Camera
                  </IonButton>
                  <IonButton fill="outline" color="medium" onClick={() => fileInputRef.current?.click()} style={{ flex: 1 }}>
                    <IonIcon icon={image} slot="start" />
                    Gallery
                  </IonButton>
                </div>
                
                {/* Hidden Inputs */}
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  ref={cameraInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
              </div>
            </IonItem>

            {error && (
              <IonText color="danger" className="ion-text-center" style={{ display: 'block', margin: '8px 0', fontSize: '0.9rem' }}>
                {error}
              </IonText>
            )}

            <div className="ion-margin-top ion-padding-top" style={{ display: 'flex', gap: '8px' }}>
              {expenseToEdit && onDeleteExpense && (
                <IonButton 
                  expand="block" 
                  shape="round" 
                  color="danger" 
                  fill="outline" 
                  style={{ flex: 1 }} 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </IonButton>
              )}
              <IonButton 
                expand="block" 
                shape="round" 
                style={{ flex: expenseToEdit && onDeleteExpense ? 1 : undefined }} 
                onClick={handleSave}
              >
                {expenseToEdit ? 'Update' : 'Save Expense'}
              </IonButton>
            </div>
          </>
        )}
      </IonContent>

      <IonAlert
        isOpen={showDeleteConfirm}
        onDidDismiss={() => setShowDeleteConfirm(false)}
        header="Delete Expense"
        message="Are you sure you want to permanently delete this expense?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { 
            text: 'Delete', 
            role: 'destructive', 
            handler: () => {
              if (expenseToEdit && onDeleteExpense) {
                onDeleteExpense(expenseToEdit.id!);
                onDidDismiss();
              }
            } 
          }
        ]}
      />

      <IonModal isOpen={!!previewUrl} onDidDismiss={() => setPreviewUrl(null)}>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>Preview</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setPreviewUrl(null)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent color="dark" className="ion-padding ion-text-center" style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', height: '100%' }}>
          {previewUrl?.startsWith('data:application/pdf') ? (
            <object data={previewUrl} type="application/pdf" style={{ width: '100%', height: '100%' }}>
              <p style={{ color: '#fff' }}>Unable to display PDF preview on this device.</p>
            </object>
          ) : (
            <img src={previewUrl || ''} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto', display: 'block' }} />
          )}
        </IonContent>
      </IonModal>
    </IonModal>
  );
};

export default AddExpenseModal;
