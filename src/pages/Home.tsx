import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonInput,
  IonText,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonToast,
} from '@ionic/react';
import { list, addCircle, barChartOutline, settingsOutline, add } from 'ionicons/icons';
import { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import { CURRENCIES } from '../constants';
import TripItem from '../components/TripItem';
import GlobalStatsView from '../components/GlobalStatsView';
import SettingsView from '../components/SettingsView';
import { Keyboard } from '@capacitor/keyboard';
import './Home.css';

const Home: React.FC = () => {
  const { trips, addTrip } = useTrips();

  // Internal active view state
  const [activeTab, setActiveTab] = useState<'trips' | 'add' | 'stats' | 'settings'>('trips');

  const [title, setTitle] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [localCurrency, setLocalCurrency] = useState<string>('');
  const [spendingCurrency, setSpendingCurrency] = useState<string>('');
  const [cashExchangeRate, setCashExchangeRate] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleCreateTrip = () => {
    if (!title || !startDate || !endDate || !localCurrency || !spendingCurrency) {
      setToastMessage('Please fill out all mandatory fields (Title, Dates, Currencies).');
      setShowToast(true);
      return;
    }
    
    addTrip({
      title,
      startDate,
      endDate,
      localCurrency,
      spendingCurrency,
      cashExchangeRate: cashExchangeRate ? Number(cashExchangeRate) : undefined,
      budget: budget ? Number(budget) : undefined
    });
    
    // Reset form
    setTitle('');
    setStartDate(new Date().toISOString());
    setEndDate(new Date().toISOString());
    setLocalCurrency('');
    setSpendingCurrency('');
    setCashExchangeRate('');
    setBudget('');
    
    // Switch to trips view
    setActiveTab('trips');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Travel Expenses</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        
        {(trips.length === 0 || activeTab === 'add') && (
          <IonCard className="add-trip-card">
            <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Trip Title *</IonLabel>
                  <IonInput 
                    type="text" 
                    placeholder="e.g. Paris Getaway" 
                    value={title} 
                    onIonInput={e => setTitle(e.detail.value!)}
                    enterkeyhint="next"
                    onKeyUp={dismissKeyboard}
                  ></IonInput>
                </IonItem>

              <IonItem className="ion-margin-top">
                <IonLabel>Start Date *</IonLabel>
                <IonDatetimeButton slot="end" datetime="start-datetime"></IonDatetimeButton>
                <IonModal keepContentsMounted={true}>
                  <IonDatetime
                    id="start-datetime"
                    presentation="date"
                    value={startDate}
                    onIonChange={e => setStartDate(e.detail.value as string)}
                  ></IonDatetime>
                </IonModal>
              </IonItem>

              <IonItem>
                <IonLabel>End Date *</IonLabel>
                <IonDatetimeButton slot="end" datetime="end-datetime"></IonDatetimeButton>
                <IonModal keepContentsMounted={true}>
                  <IonDatetime
                    id="end-datetime"
                    presentation="date"
                    value={endDate}
                    onIonChange={e => setEndDate(e.detail.value as string)}
                  ></IonDatetime>
                </IonModal>
              </IonItem>

              <IonItem>
                <IonLabel>Local Currency *</IonLabel>
                <IonSelect
                  slot="end"
                  value={localCurrency}
                  onIonChange={e => setLocalCurrency(e.detail.value)}
                  interface="action-sheet"
                  interfaceOptions={{ cssClass: 'scrollable-action-sheet' }}
                  mode="md"
                  selectedText={localCurrency}
                  placeholder="Select"
                >
                  {CURRENCIES.map(c => (
                    <IonSelectOption key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="ion-margin-top">
                <IonLabel>Spending Currency *</IonLabel>
                <IonSelect
                  slot="end"
                  value={spendingCurrency}
                  onIonChange={e => setSpendingCurrency(e.detail.value)}
                  interface="action-sheet"
                  interfaceOptions={{ cssClass: 'scrollable-action-sheet' }}
                  mode="md"
                  selectedText={spendingCurrency}
                  placeholder="Select"
                >
                  {CURRENCIES.map(c => (
                    <IonSelectOption key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem className="ion-margin-top">
                <IonLabel position="stacked">Total Budget (in {localCurrency || 'Local Currency'})</IonLabel>
                <IonInput 
                  type="number" 
                  placeholder="e.g. 5000" 
                  value={budget}
                  onIonInput={e => setBudget(e.detail.value!)}
                  enterkeyhint="next"
                  onKeyUp={dismissKeyboard}
                ></IonInput>
              </IonItem>

              <IonItem className="ion-margin-top">
                <IonLabel position="stacked">Cash Exchange Rate</IonLabel>
                <IonInput 
                  type="number" 
                  placeholder="e.g. 1.25" 
                  value={cashExchangeRate}
                  onIonInput={e => setCashExchangeRate(e.detail.value!)}
                  enterkeyhint="done"
                  onKeyUp={dismissKeyboard}
                ></IonInput>
              </IonItem>
              <IonText color="medium" className="ion-padding-start" style={{ fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                Specify an exchange rate if you withdrew cash at a specific rate to accurately convert your cash expenses.
              </IonText>

              <div className="ion-margin-top ion-padding-top">
                <IonButton expand="block" shape="round" onClick={handleCreateTrip}>
                  Create Trip
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {(trips.length > 0 && activeTab === 'trips') && (
          <div style={{ paddingTop: '8px' }}>
            {trips.map(trip => (
              <TripItem key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {trips.length > 0 && activeTab === 'stats' && (
          <div style={{ paddingTop: '8px' }}>
            <GlobalStatsView trips={trips} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="ion-margin-top">
            <SettingsView />
          </div>
        )}

      </IonContent>

      {trips.length > 0 && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="trips" onClick={() => setActiveTab('trips')} selected={activeTab === 'trips'}>
            <IonIcon icon={list} />
            <IonLabel>Trips</IonLabel>
          </IonTabButton>
          <IonTabButton tab="add" onClick={() => setActiveTab('add')} selected={activeTab === 'add'}>
            <IonIcon icon={addCircle} />
            <IonLabel>Add Trip</IonLabel>
          </IonTabButton>
          <IonTabButton tab="stats" onClick={() => setActiveTab('stats')} selected={activeTab === 'stats'}>
            <IonIcon icon={barChartOutline} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
          <IonTabButton tab="settings" onClick={() => setActiveTab('settings')} selected={activeTab === 'settings'}>
            <IonIcon icon={settingsOutline} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="danger"
        position="bottom"
      />
    </IonPage>
  );
};

export default Home;
