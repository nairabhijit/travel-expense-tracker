import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonAlert,
  IonContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonDatetimeButton,
  IonDatetime,
  IonIcon,
  IonText,
  IonItemGroup,
  IonItemDivider,
  IonProgressBar,
  IonToast
} from '@ionic/react';
import { add, chevronDown, chevronUp, createOutline, trash, trashOutline, barChartOutline, downloadOutline, receiptOutline } from 'ionicons/icons';
import { Trip, Expense } from '../types';
import { useExpenses } from '../hooks/useExpenses';
import { useTrips } from '../hooks/useTrips';
import { CATEGORIES, SOURCES, CURRENCIES } from '../constants';
import { formatAmount } from '../utils/format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddExpenseModal from './AddExpenseModal';
import TripStatsModal from './TripStatsModal';
import HoldTooltip from './HoldTooltip';
import './TripItem.css';

interface TripItemProps {
  trip: Trip;
}

const MIN_EXPENSES_TO_SHOW = 2;

const TripItem: React.FC<TripItemProps> = ({ trip }) => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(trip.id);
  const { updateTrip, deleteTrip } = useTrips();
  const [showAll, setShowAll] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Edit & Delete State
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(trip.title);
  const [editStartDate, setEditStartDate] = useState(trip.startDate);
  const [editEndDate, setEditEndDate] = useState(trip.endDate);
  const [editLocalCurrency, setEditLocalCurrency] = useState(trip.localCurrency);
  const [editSpendingCurrency, setEditSpendingCurrency] = useState(trip.spendingCurrency);
  const [editCashRate, setEditCashRate] = useState(trip.cashExchangeRate ? String(trip.cashExchangeRate) : '');
  const [editBudget, setEditBudget] = useState(trip.budget ? String(trip.budget) : '');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const handleUpdateTrip = () => {
    if (!editTitle || !editStartDate || !editEndDate || !editLocalCurrency || !editSpendingCurrency) {
      setToastMessage('Please fill out all mandatory fields (Title, Dates, Currencies).');
      setShowToast(true);
      return;
    }

    updateTrip({
      ...trip,
      title: editTitle,
      startDate: editStartDate,
      endDate: editEndDate,
      localCurrency: editLocalCurrency,
      spendingCurrency: editSpendingCurrency,
      cashExchangeRate: editCashRate ? Number(editCashRate) : undefined,
      budget: editBudget ? Number(editBudget) : undefined,
    });
    setIsEditTripOpen(false);
  };

  const handleDeleteTrip = () => {
    deleteTrip(trip.id);
    setIsDeleteConfirmOpen(false);
  };

  const currency = CURRENCIES.find(c => c.code === trip.localCurrency);
  const spendingCurrencyObj = CURRENCIES.find(c => c.code === trip.spendingCurrency);

  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Source', 'Original Amount', 'Currency', 'Base Amount', 'Local Currency'];
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      CATEGORIES.find(c => c.id === e.categoryId)?.name || e.categoryId,
      SOURCES.find(s => s.id === e.sourceId)?.name || e.sourceId,
      e.amount,
      e.currency || trip.spendingCurrency,
      e.baseCurrencyAmount || e.amount,
      trip.localCurrency
    ]);

    // Add quotes around fields to handle commas, though our inputs are fairly structured
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date(trip.startDate).toLocaleDateString().replace(/\//g, '-');
    link.setAttribute('download', `trip-expenses-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveExpense = (expenseData: {
    id?: string;
    categoryId: string;
    amount: number;
    date: string;
    sourceId: string;
    currency: string;
    baseCurrencyAmount: number;
    customExchangeRate?: number;
    billUrl?: string; // Keep for backwards compatibility
    billUrls?: string[];
  }) => {
    if (expenseData.id) {
      updateExpense({
        ...expenseData,
        tripId: trip.id,
      } as Expense);
    } else {
      addExpense({
        tripId: trip.id,
        ...expenseData
      });
      setShowAll(true);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
  };

  const visibleExpenses = showAll ? expenses : expenses.slice(0, MIN_EXPENSES_TO_SHOW);
  const hasMoreExpenses = expenses.length > MIN_EXPENSES_TO_SHOW;

  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.baseCurrencyAmount || exp.amount), 0);

  // Budget calculations
  const budgetRatio = trip.budget ? Math.min(totalSpent / trip.budget, 1) : 0;
  let budgetColor = 'success';
  if (budgetRatio > 0.75) budgetColor = 'warning';
  if (budgetRatio >= 1) budgetColor = 'danger';

  // Group visible expenses by Date
  const groupedExpenses = visibleExpenses.reduce((groups, exp) => {
    const dateStr = new Date(exp.date).toLocaleDateString();
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(exp);
    return groups;
  }, {} as Record<string, Expense[]>);

  const getCategoryIcon = (cid: string) => CATEGORIES.find(c => c.id === cid)?.icon || '';
  const getCategoryName = (cid: string) => CATEGORIES.find(c => c.id === cid)?.name || '';
  const getSourceIcon = (sid: string) => SOURCES.find(s => s.id === sid)?.icon || '';
  const getSourceName = (sid: string) => SOURCES.find(s => s.id === sid)?.name || '';
  const getCurrencyIcon = (code: string) => CURRENCIES.find(c => c.code === code)?.icon;
  const getCurrencySymbol = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

  // Date formatting
  const formatDateRange = (start: string, end: string) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const d1 = new Date(start).toLocaleDateString('en-US', opts);
    const d2 = new Date(end).toLocaleDateString('en-US', opts);
    if (d1 === d2) return d1;
    return `${d1} - ${d2}`;
  };

  const remainingBudget = trip.budget ? (trip.budget - totalSpent) : null;

  return (
    <IonCard className="trip-item-card ion-margin-bottom">
      <div style={{ padding: '16px', borderBottom: '1px solid var(--ion-color-light-shade)' }}>

        {/* Title & Dates */}
        <div
          style={{ cursor: 'pointer', marginBottom: '16px' }}
          onClick={() => setIsEditTripOpen(true)}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 4px 0', padding: 0, color: 'var(--ion-color-primary)', lineHeight: '1.4', textDecoration: 'underline', textDecorationColor: 'var(--ion-color-light-shade)' }}>
            {trip.title}
          </h2>
          <IonText color="medium" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {formatDateRange(trip.startDate, trip.endDate)}
          </IonText>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--ion-color-light-shade)', margin: '0 0 16px 0' }} />

        {/* Overview Row */}
        <div>
          <div style={{ marginBottom: trip.budget ? '16px' : '0' }}>
            <IonText color="medium" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>Total Spent</IonText>
            <IonText color="dark" style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.2' }}>
              <FontAwesomeIcon icon={currency?.icon} />{'\u2009'}{formatAmount(totalSpent)}
            </IonText>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: trip.budget ? '12px' : '0' }}>
            <div style={{ flex: 1 }}>
              <IonText color="medium" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>Budget</IonText>
              <IonText color="dark" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {trip.budget ? <><FontAwesomeIcon icon={currency?.icon} />{'\u2009'}{formatAmount(trip.budget)}</> : '---'}
              </IonText>
            </div>

            <div style={{ flex: 1, textAlign: 'right' }}>
              <IonText color="medium" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block' }}>Remaining</IonText>
              <IonText color={remainingBudget && remainingBudget < 0 ? 'danger' : 'success'} style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {remainingBudget !== null ? <><FontAwesomeIcon icon={currency?.icon} />{'\u2009'}{formatAmount(remainingBudget)}</> : '---'}
              </IonText>
            </div>
          </div>

          {trip.budget && (
            <div>
              <IonProgressBar value={budgetRatio} color={budgetColor} style={{ height: '6px', borderRadius: '3px' }}></IonProgressBar>
            </div>
          )}
        </div>
      </div>

      <IonCardContent>
        {expenses.length === 0 ? (
          <div className="ion-text-center ion-padding-vertical ion-text-muted">
            No expenses yet. Add one!
          </div>
        ) : (
          <IonList lines="full" className="trip-expense-list">
            {Object.entries(groupedExpenses).map(([dateStr, dayExpenses]) => (
              <IonItemGroup key={dateStr}>
                <IonItemDivider color="light">
                  <IonLabel style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ion-color-medium)' }}>
                    {dateStr}
                  </IonLabel>
                </IonItemDivider>
                {dayExpenses.map(exp => (
                  <IonItemSliding key={exp.id}>
                    <IonItem className="expense-item" button onClick={() => handleEditExpense(exp)}>
                      <div 
                        slot="start" 
                        className="expense-list-icon"
                        onClick={(e) => { e.stopPropagation(); handleEditExpense(exp); }}
                      >
                        <HoldTooltip text={getCategoryName(exp.categoryId)}>
                          <FontAwesomeIcon icon={getCategoryIcon(exp.categoryId)} style={{ pointerEvents: 'none' }} />
                        </HoldTooltip>
                      </div>
                      <IonLabel>
                        <h3 style={{ fontWeight: 600 }}>
                          {exp.title || getCategoryName(exp.categoryId)}
                          {((exp.billUrls && exp.billUrls.length > 0) || exp.billUrl) && (
                            <IonIcon icon={receiptOutline} style={{ marginLeft: '6px', color: 'var(--ion-color-medium)', verticalAlign: 'middle', pointerEvents: 'none' }} />
                          )}
                        </h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <HoldTooltip text={getSourceName(exp.sourceId)}>
                            <span><FontAwesomeIcon icon={getSourceIcon(exp.sourceId)} style={{ pointerEvents: 'none' }} /></span>
                          </HoldTooltip>
                        </p>
                      </IonLabel>
                      <div slot="end" className="ion-text-right">
                        <div style={{ fontWeight: 'bold', color: 'var(--ion-color-dark)' }}>
                          <FontAwesomeIcon icon={getCurrencyIcon((exp as any).currency || trip.spendingCurrency)} style={{ pointerEvents: 'none' }} />{'\u2009'}{formatAmount(exp.amount)}
                        </div>
                        {(exp as any).currency && (exp as any).currency !== trip.localCurrency && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)' }}>
                            ~ <FontAwesomeIcon icon={currency?.icon} style={{ pointerEvents: 'none' }} />{'\u2009'}{formatAmount((exp as any).baseCurrencyAmount)}
                          </div>
                        )}
                      </div>
                    </IonItem>

                    <IonItemOptions side="end">
                      <IonItemOption color="danger" onClick={() => setExpenseToDelete(exp.id)}>
                        <IonIcon slot="icon-only" icon={trash} />
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonItemGroup>
            ))}
          </IonList>
        )}

        {hasMoreExpenses && (
          <IonButton
            fill="clear"
            expand="block"
            size="small"
            onClick={() => setShowAll(!showAll)}
            className="show-more-btn"
          >
            {showAll ? 'Show Less' : `Show All ${expenses.length} Expenses`}
            <IonIcon slot="end" icon={showAll ? chevronUp : chevronDown} />
          </IonButton>
        )}

        <IonButton
          expand="block"
          fill="outline"
          shape="round"
          className="ion-margin-top action-add-expense-btn"
          onClick={() => {
            setExpenseToEdit(null);
            setIsAddExpenseOpen(true);
          }}
        >
          <IonIcon slot="start" icon={add} />
          Add Expense
        </IonButton>
      </IonCardContent>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onDidDismiss={() => {
          setIsAddExpenseOpen(false);
          setTimeout(() => setExpenseToEdit(null), 300);
        }}
        onSaveExpense={handleSaveExpense}
        trip={trip}
        expenseToEdit={expenseToEdit}
        onDeleteExpense={handleDeleteExpense}
      />

      <TripStatsModal
        isOpen={isStatsOpen}
        onDidDismiss={() => setIsStatsOpen(false)}
        trip={trip}
        expenses={expenses}
      />

      {/* Edit Trip Modal */}
      <IonModal isOpen={isEditTripOpen} onDidDismiss={() => setIsEditTripOpen(false)}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Edit Trip</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsEditTripOpen(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Trip Title *</IonLabel>
            <IonInput
              type="text"
              value={editTitle}
              onIonInput={e => setEditTitle(e.detail.value!)}
            ></IonInput>
          </IonItem>

          <IonItem className="ion-margin-top">
            <IonLabel>Start Date *</IonLabel>
            <IonDatetimeButton slot="end" datetime={`edit-start-${trip.id}`}></IonDatetimeButton>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id={`edit-start-${trip.id}`}
                presentation="date"
                value={editStartDate}
                onIonChange={e => setEditStartDate(e.detail.value as string)}
              ></IonDatetime>
            </IonModal>
          </IonItem>

          <IonItem>
            <IonLabel>End Date *</IonLabel>
            <IonDatetimeButton slot="end" datetime={`edit-end-${trip.id}`}></IonDatetimeButton>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id={`edit-end-${trip.id}`}
                presentation="date"
                value={editEndDate}
                onIonChange={e => setEditEndDate(e.detail.value as string)}
              ></IonDatetime>
            </IonModal>
          </IonItem>

          <IonItem>
            <IonLabel>Local Currency *</IonLabel>
            <IonSelect
              slot="end"
              value={editLocalCurrency}
              onIonChange={e => setEditLocalCurrency(e.detail.value)}
              interface="action-sheet"
              selectedText={editLocalCurrency}
              disabled={true}
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
              value={editSpendingCurrency}
              onIonChange={e => setEditSpendingCurrency(e.detail.value)}
              interface="action-sheet"
              selectedText={editSpendingCurrency}
            >
              {CURRENCIES.map(c => (
                <IonSelectOption key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem className="ion-margin-top">
            <IonLabel position="stacked">Total Budget (in {editLocalCurrency})</IonLabel>
            <IonInput
              type="number"
              placeholder="e.g. 5000"
              value={editBudget}
              onIonInput={e => setEditBudget(e.detail.value!)}
            ></IonInput>
          </IonItem>

          <IonItem className="ion-margin-top">
            <IonLabel position="stacked">Cash Exchange Rate</IonLabel>
            <IonInput
              type="number"
              placeholder="e.g. 1.25"
              value={editCashRate}
              onIonInput={e => setEditCashRate(e.detail.value!)}
            ></IonInput>
          </IonItem>

          <div className="ion-margin-top ion-padding-top" style={{ display: 'flex', gap: '8px' }}>
            <IonButton expand="block" shape="round" color="danger" fill="outline" style={{ flex: 1 }} onClick={() => setIsDeleteConfirmOpen(true)}>
              Delete Trip
            </IonButton>
            <IonButton expand="block" shape="round" style={{ flex: 1 }} onClick={handleUpdateTrip}>
              Save Changes
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Delete Trip Confirmation */}
      <IonAlert
        isOpen={isDeleteConfirmOpen}
        onDidDismiss={() => setIsDeleteConfirmOpen(false)}
        header="Delete Trip"
        message="Are you sure you want to delete this trip and all its expenses? This cannot be undone."
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: handleDeleteTrip }
        ]}
      />

      {/* Delete Expense Confirmation */}
      <IonAlert
        isOpen={!!expenseToDelete}
        onDidDismiss={() => setExpenseToDelete(null)}
        header="Delete Expense"
        message="Are you sure you want to permanently delete this expense?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Delete', role: 'destructive', handler: () => {
              if (expenseToDelete) {
                handleDeleteExpense(expenseToDelete);
                setExpenseToDelete(null);
              }
            }
          }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="danger"
        position="bottom"
      />
    </IonCard>
  );
};

export default TripItem;
