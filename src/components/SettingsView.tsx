import React, { useRef, useState } from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonIcon, IonLabel, IonButton, IonAlert,
  IonText
} from '@ionic/react';
import { documentOutline, downloadOutline, trashOutline, settingsOutline } from 'ionicons/icons';

const SettingsView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = () => {
    try {
      const tripsData = localStorage.getItem('travel_expenses_trips') || '[]';
      const expensesData = localStorage.getItem('travel_expenses_items') || '[]';

      const exportObject = {
        app: "Travel Expenses Data Backup",
        dateExported: new Date().toISOString(),
        trips: JSON.parse(tripsData),
        expenses: JSON.parse(expensesData)
      };

      const dataStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `travel-expenses-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export data", e);
      alert("Failed to export data.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);

        if (data && typeof data === 'object') {
          if (data.trips && Array.isArray(data.trips)) {
            localStorage.setItem('travel_expenses_trips', JSON.stringify(data.trips));
          }
          if (data.expenses && Array.isArray(data.expenses)) {
            localStorage.setItem('travel_expenses_items', JSON.stringify(data.expenses));
          }
          
          alert("Data imported successfully! The app will now reload.");
          window.location.reload();
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        console.error("Failed to parse JSON backup", err);
        alert("Failed to read the backup file. Ensure it is a valid JSON file.");
      }
    };
    reader.readAsText(file);
    
    // Reset file input so the same file could be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = () => {
    localStorage.removeItem('travel_expenses_trips');
    localStorage.removeItem('travel_expenses_items');
    window.location.reload();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <IonCard className="ion-margin-bottom">
        <IonCardHeader>
          <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={settingsOutline} color="primary" /> App Settings
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="medium">
            <p>Manage your completely private, offline travel data. Ensure you export backups frequently if you clear your browsing data!</p>
          </IonText>

          <IonList lines="none" className="ion-margin-top" style={{ background: 'transparent' }}>
            
            {/* Export */}
            <IonItem className="ion-margin-bottom" style={{ '--background': 'var(--ion-color-light)', borderRadius: '12px' }}>
              <IonIcon icon={downloadOutline} slot="start" color="primary" />
              <IonLabel>
                <h2>Export Backup Data</h2>
                <p>Download your trips and expenses as JSON</p>
              </IonLabel>
              <IonButton slot="end" fill="solid" shape="round" color="primary" onClick={handleExportData}>
                Export
              </IonButton>
            </IonItem>

            {/* Import */}
            <IonItem className="ion-margin-bottom" style={{ '--background': 'var(--ion-color-light)', borderRadius: '12px' }}>
              <IonIcon icon={documentOutline} slot="start" color="success" />
              <IonLabel>
                <h2>Import JSON Backup</h2>
                <p>Restore your data from a backup file</p>
              </IonLabel>
              <IonButton slot="end" fill="solid" shape="round" color="success" onClick={triggerFileInput}>
                Import
              </IonButton>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImportData}
              />
            </IonItem>

            {/* Clear All */}
            <IonItem style={{ '--background': 'rgba(var(--ion-color-danger-rgb), 0.1)', borderRadius: '12px' }}>
              <IonIcon icon={trashOutline} slot="start" color="danger" />
              <IonLabel color="danger">
                <h2>Clear All Data</h2>
                <p>Permanently delete everything locally</p>
              </IonLabel>
              <IonButton slot="end" fill="outline" shape="round" color="danger" onClick={() => setShowClearConfirm(true)}>
                Wipe Data
              </IonButton>
            </IonItem>

          </IonList>
        </IonCardContent>
      </IonCard>

      <IonAlert
        isOpen={showClearConfirm}
        onDidDismiss={() => setShowClearConfirm(false)}
        header="Clear All Data?"
        message="Are you absolutely sure? This will delete all your trips and expenses from this device. Consider exporting a backup first!"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Wipe Everything',
            role: 'destructive',
            handler: handleClearAllData
          }
        ]}
      />
    </div>
  );
};

export default SettingsView;
